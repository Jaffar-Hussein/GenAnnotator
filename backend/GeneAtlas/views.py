from django.shortcuts import render
from django.urls import reverse
from GeneAtlas import urls
from django.views.generic import CreateView
from .serializers import GenomeSerializer, GeneSerializer, PeptideSerializer, GeneAnnotationSerializer, PeptideAnnotationSerializer, GeneAnnotationStatusSerializer, TaskSerializer, TaskInputSerializer, BlastQueryInputSerializer, BlastRunInputSerializer, StatsInputSerializer, PFAMRunInputSerializer, GeneQuerySerializer, PeptideQuerySerializer
from rest_framework import status, request
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.pagination import LimitOffsetPagination
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from .permissions import IsAnnotatorUser, IsValidatorUser, ReadOnly
from .models import Genome, Gene, Peptide, GeneAnnotation, PeptideAnnotation, GeneAnnotationStatus, AsyncTasksCache
from django.db import transaction, models as db_models
from django.http import HttpResponse
from AccessControl.models import CustomUser
import csv
import requests
from .tasks import run_blast, pfamscan
from huey.contrib.djhuey import HUEY
from django.utils import timezone
from datetime import timedelta
import uuid

class HomeView(CreateView):

    def get(self, request):
        return render(request, "home.html")

class GenomeAPIView(APIView):
    def get(self, request) -> Response:
        inf = Genome.objects.all()
        if(request.GET.get('all', None) == 'true'):
            query_results = inf
        else:
            params = {"name": request.GET.get('name', None), # Name of the genome
                    "species": request.GET.get('species', None),  
                    "length": request.GET.get('length', None),
                    "motif": request.GET.get('motif', None),
                    "gc_content": request.GET.get('gc_content', None), 
                    "annotation": request.GET.get('annotation', None)} # Annotated status of the genome
            if(all(v is None for v in params.values())):
                return Response({"error": "No query parameters provided."}, status=status.HTTP_400_BAD_REQUEST)
            else:
                query_results = inf.filter(**{k: v for k, v in params.items() if v is not None and k != "motif"})
                if(params["motif"] is not None):
                    if(len(params["motif"]) < 3):
                        return Response({"error": "Motif must be at least 3 characters long."}, status=status.HTTP_400_BAD_REQUEST)
                    else:
                        query_results = [g for g in query_results if g.search_motif(params["motif"])]
        if(request.GET.get("limit",None)):
            paginator = LimitOffsetPagination()
            query_results = paginator.paginate_queryset(query_results, request)
            serializer = GenomeSerializer(query_results, many=True)
            return paginator.get_paginated_response(serializer.data)
        else:
            serializer = GenomeSerializer(query_results, many=True)
            return Response(serializer.data)

    def post(self, request) -> Response:
        serializer = GenomeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class GeneAPIView(APIView):
    def get(self, request) -> Response:
        inf = Gene.objects.all()
        motif = request.GET.get('motif', None)
        params = {"name": request.GET.get('name', None), # Name of the gene
                "genome": request.GET.get('genome', None), # Genome to which the gene belongs 
                "length": request.GET.get('length', None),
                "gc_content": request.GET.get('gc_content', None), 
                "annotated": request.GET.get('annotated', None), # Annotated status of the gene
                "limit": request.GET.get('limit', None)} # Should the result be paginated
        if(motif): 
            if(len(motif) < 3):
                return Response({"error": "Motif must be at least 3 characters long."}, status=status.HTTP_400_BAD_REQUEST)
            else:
                params[Gene.query_motif(motif)] = (motif).strip("%")
        if(all(v is None for v in params.values())):
            return Response({"error": "No query parameters provided. Please paginate the result."}, status=status.HTTP_400_BAD_REQUEST)
        else:
            # Validate the query parameters
            try:
                GeneQuerySerializer(data=params).is_valid(raise_exception=True)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
            query_results = inf.filter(**{k: v for k, v in params.items() if v is not None and k not in ["limit"]})

        if(params["limit"] is not None):
            paginator = LimitOffsetPagination()
            query_results = paginator.paginate_queryset(query_results, request)
            serializer = GeneSerializer(query_results, many=True)
            return paginator.get_paginated_response(serializer.data)
        else:
            serializer = GeneSerializer(query_results, many=True)
            return Response(serializer.data)

    def post(self, request) -> Response:
        serializer = GeneSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class PeptideAPIView(APIView):
    def get(self, request) -> Response:
        try:
            inf = Peptide.objects.all()
            motif = request.GET.get('motif', None) # Motif to be searched in the peptide sequence
            params = {"name": request.GET.get('name', None), # Name of the peptide
                    "gene": request.GET.get('gene', None),  # Gene to which the peptide belongs
                    "length": request.GET.get('length', None), # Length of the peptide
                    "gene__annotated": request.GET.get('annotated', None), # Annotated status of the gene to which the peptide belongs
                    "limit": request.GET.get('limit', None)} # Should the result be paginated
            if(motif):
                if(len(motif) < 3):
                    return Response({"error": "Motif must be at least 3 characters long."}, status=status.HTTP_400_BAD_REQUEST)
                else:
                    params[Peptide.query_motif(motif)] = (motif).strip("%")
            if(all(v is None for v in params.values())):
                return Response({"error": "No query parameters provided. Please paginate the result"}, status=status.HTTP_400_BAD_REQUEST)
            else:
                # Validate the query parameters
                try:
                    PeptideQuerySerializer(data=params).is_valid(raise_exception=True)
                except Exception as e:
                    return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
                query_results = inf.filter(**{k: v for k, v in params.items() if v is not None and k not in ["limit"]})
                if(query_results.count() == 0):
                    return Response({"error": "Peptide(s) not found."}, status=status.HTTP_404_NOT_FOUND)
                                    
            if(params["limit"] is not None):
                paginator = LimitOffsetPagination()
                query_results = paginator.paginate_queryset(query_results, request)
                serializer = PeptideSerializer(query_results, many=True)
                return paginator.get_paginated_response(serializer.data)
            else:
                serializer = PeptideSerializer(query_results, many=True)
                return Response(serializer.data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def post(self, request) -> Response:
        serializer = PeptideSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class AnnotationAPIView(APIView):

    permission_classes = [IsAuthenticated&(IsAnnotatorUser|IsValidatorUser|IsAdminUser|ReadOnly)]

    def get(self, request) -> Response:
        inf_annotation_gene = GeneAnnotation.objects.all()
        inf_annotation_peptide = PeptideAnnotation.objects.all()
        params = {"gene_instance": request.GET.get('gene_instance', None)} # Gene instance for which the annotation is to be retrieved
        if(all(v is None for v in params.values())):
            return Response({"error": "No query parameters provided."}, status=status.HTTP_400_BAD_REQUEST)
        else:
            query_results_gene_annotation = inf_annotation_gene.filter(**{k: v for k, v in params.items() if v is not None})
            gene_serializer = GeneAnnotationSerializer(query_results_gene_annotation, many=True)
            query_results_peptide_annotation = inf_annotation_peptide.filter(annotation__in=[g["gene_instance"] for g in gene_serializer.data])
            peptide_serializer = PeptideAnnotationSerializer(query_results_peptide_annotation, many=True)
        
        return Response({"gene": sorted(gene_serializer.data, key=lambda x: x['gene_instance']), "peptide": sorted(peptide_serializer.data, key=lambda x: x['annotation'])})


    def put(self, request, gene = None) -> Response:
        try:

            with transaction.atomic():

                response = {}

                if gene is None:
                    return Response({'error': 'No gene instance provided'}, status=status.HTTP_400_BAD_REQUEST)
                try:
                    if Gene.objects.get(name=gene).annotated:
                        return Response({'error': 'Gene already annotated with APPROVED status'}, status=status.HTTP_400_BAD_REQUEST)
                except Gene.DoesNotExist:
                    return Response({'error': 'Gene not found'}, status=status.HTTP_404_NOT_FOUND)

                current_annotation = GeneAnnotation.objects.filter(gene_instance=gene).first()

                if(current_annotation is None):
                    return Response({'error': 'Gene annotation not found'}, status=status.HTTP_404_NOT_FOUND)
                
                # Allow only the annotator assigned to the gene annotation to update the data
                self.check_object_permissions(request, current_annotation)

                # Update gene annotation data
                new_data = {
                    'gene_instance': gene,
                    'strand': request.data.get('strand',current_annotation.strand),
                    'gene': request.data.get('gene', current_annotation.gene),
                    'gene_biotype': request.data.get('gene_biotype', current_annotation.gene_biotype),
                    'transcript_biotype': request.data.get('transcript_biotype', current_annotation.transcript_biotype),
                    'gene_symbol': request.data.get('gene_symbol', current_annotation.gene_symbol),
                    'description': request.data.get('description', current_annotation.description),
                }
                
                gene_serializer = GeneAnnotationSerializer(instance=current_annotation, data=new_data)

                if not gene_serializer.is_valid():
                    return Response(gene_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
                new_gene_annotation = gene_serializer.save()

                response['gene_annotation'] = gene_serializer.data

                peptide = request.data.get('peptide',None)

                if not peptide is None:

                    current_peptide_annotation = PeptideAnnotation.objects.filter(peptide=peptide).first()

                    # Update peptide annotation data
                    peptide_new_data = {
                        'peptide': peptide,
                        'annotation': new_gene_annotation,
                        'transcript': request.data.get('transcript', 
                                                       current_peptide_annotation.transcript if current_peptide_annotation is not None 
                                                       else "No transcript"),
                    }
                
                    peptide_serializer = PeptideAnnotationSerializer(instance=current_peptide_annotation, data=peptide_new_data)

                    if not peptide_serializer.is_valid():
                        return Response(peptide_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
                    peptide_serializer.save()

                    response["peptide_annotation"] = peptide_serializer.data
                
                return Response(response, status=status.HTTP_201_CREATED)
    
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
    def post(self, request) -> Response:
        return Response({"error": "POST request not supported."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
    def delete(self, request) -> Response:
        return Response({"error": "DELETE request not supported."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

class AnnotationStatusAPIView(APIView):

    permission_classes = [IsAuthenticated&(IsAnnotatorUser|IsValidatorUser|IsAdminUser|ReadOnly)]

    def get(self, request) -> Response:
        inf = GeneAnnotationStatus.objects.all()
        params = {"gene": request.GET.get('gene', None),  # Gene(s) for which the status is to be retrieved
                "status": request.GET.get('status', None), # Status of the gene annotation
                "annotator": request.GET.get('annotator', None)} # Annotator assigned to the gene annotation
        params["annotator"] = CustomUser.objects.get(username=params["annotator"]) if params["annotator"] is not None else None
        query_results = inf.filter(**{k: v for k, v in params.items() if v is not None})
        if(request.GET.get("limit",None)):
            paginator = LimitOffsetPagination()
            query_results = paginator.paginate_queryset(query_results, request)
            serializer = GeneAnnotationStatusSerializer(query_results, many=True)
            return paginator.get_paginated_response(serializer.data)
        else:    
            serializer = GeneAnnotationStatusSerializer(query_results, many=True)
            return Response(serializer.data)

    def put(self, request) -> Response:

        params = {"action": request.data.get('action', None), # Action can be approve, reject, submit or setuser
                "gene": request.data.get('gene', None), # Gene(s) for which the action is to be performed
                "user": request.data.get('user', None)} # User to be assigned to the gene annotation
        
        # Ensure that gene keyworded object is a list or a string
        if(not params["gene"] is None):
            if(isinstance(params["gene"], list)):
                status_obj = GeneAnnotationStatus.objects.filter(gene__in=params["gene"])
                if(params["action"] != 'setuser'):
                    return Response({'error': 'Bulk actions not supported for approve, reject or submit'}, status=status.HTTP_400_BAD_REQUEST)
            elif(isinstance(params["gene"], str)):
                try:
                    if(params["action"] == 'setuser'):
                        status_obj = GeneAnnotationStatus.objects.filter(gene=params["gene"])
                    else:
                        status_obj = GeneAnnotationStatus.objects.get(gene=params["gene"])
                except GeneAnnotationStatus.DoesNotExist:
                    return Response({'error': 'Annotation not found'}, status=status.HTTP_404_NOT_FOUND)
                    
            else:
                return Response({'error': f'Gene parameter cannot be of type {type(params["gene"])}'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'error': 'A gene parameter must be provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        if status_obj is None:
            return Response({'error': 'No status found'}, status=status.HTTP_404_NOT_FOUND)

        if params["action"].lower() == 'approve':
            if(status_obj.status == GeneAnnotationStatus.PENDING or status_obj.status == GeneAnnotationStatus.REJECTED):
                if(request.user == status_obj.annotator):
                    return Response({'error': 'Annotator cannot approve their own annotation'}, status=status.HTTP_403_FORBIDDEN)
                return status_obj.approve(request)
            else:
                return Response({'error': f'Annotation {status_obj.gene} with status {status_obj.status} cannot be approved'}, status=status.HTTP_400_BAD_REQUEST)
        
        elif params["action"].lower() == 'reject':
            if(status_obj.status == GeneAnnotationStatus.PENDING or status_obj.status == GeneAnnotationStatus.APPROVED):
                if(request.user == status_obj.annotator):
                    return Response({'error': 'Annotator cannot reject their own annotation'}, status=status.HTTP_403_FORBIDDEN)
                return status_obj.reject(request)
            else:
                return Response({'error': f'Annotation {status_obj.gene} with status {status_obj.status} cannot be rejected'}, status=status.HTTP_400_BAD_REQUEST)

                
        elif params["action"].lower() == 'submit':
            if(status_obj.status == GeneAnnotationStatus.ONGOING):
                try:
                    self.check_object_permissions(request, status_obj)
                except Exception as e:
                    return Response({'error': str(e)}, status=status.HTTP_403_FORBIDDEN)
                return status_obj.submit()
            else:
                return Response({'error': f'Annotation {status_obj.gene} with status {status_obj.status} cannot be submitted'}, status=status.HTTP_400_BAD_REQUEST)

        
        elif params["action"].lower() == "setuser":
            
            if params["gene"] is not None:
                try:
                    user = CustomUser.objects.get(username=params["user"])
                except CustomUser.DoesNotExist:
                    return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
                if(user.role == "ANNOTATOR" or user.role == "VALIDATOR"):
                    # Ensure that the user is not assigned to an annotation that is not in the RAW status
                    raw_obj = status_obj.filter(status=GeneAnnotationStatus.RAW)
                    if(raw_obj.count() != status_obj.count()):
                        return Response({'error': 'User cannot be assigned to annotations that are not in the RAW status'}, status=status.HTTP_400_BAD_REQUEST)
                    return GeneAnnotationStatus.setuser(raw_obj, request, user=user)
                else:
                    return Response({'error': f'User with role {user.role} cannot be assigned to annotation'}, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({'error': 'User not provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(
            {'error': 'Invalid action'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    def post(self, request) -> Response:
        return Response({"error": "POST request not supported."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
    def delete(self, request) -> Response:
        return Response({"error": "DELETE request not supported."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
        
class StatsAPIView(APIView):

    def get(self, request) -> Response:
        try:
            user = request.GET.get("user", None)
            if(user is not None):
                if StatsInputSerializer(data={"user": user}).is_valid(raise_exception=False):
                    try:
                        user_pk = CustomUser.objects.get(username=user).id
                    except CustomUser.DoesNotExist:
                        return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
                    annotations = GeneAnnotationStatus.objects.filter(annotator=user_pk)
                    annotations_ongoing = annotations.filter(status=GeneAnnotationStatus.ONGOING)
                    annotations_pending = annotations.filter(status=GeneAnnotationStatus.PENDING)
                    annotations_approved = annotations.filter(status=GeneAnnotationStatus.APPROVED)
                    annotations_rejected = annotations.filter(status=GeneAnnotationStatus.REJECTED)
                    return Response({"annotations": annotations.count(),
                                    "ongoing": {"count": annotations_ongoing.count(), 
                                                "annotation": annotations_ongoing.values_list('gene', flat=True)},
                                    "pending": {"count": annotations_pending.count(), 
                                                "annotation": annotations_pending.values_list('gene', flat=True)},
                                    "approved": {"count": annotations_approved.count(), 
                                                "annotation": annotations_approved.values_list('gene', flat=True)},
                                    "rejected": {"count": annotations_rejected.count(), 
                                                "annotation": annotations_rejected.values_list('gene', flat=True)}})
                else:
                    return Response({"error": "Invalid user parameter."}, status=status.HTTP_400_BAD_REQUEST)
            else:
                genome_count = Genome.objects.count()
                stats_by_genome = Gene.objects.values('genome').annotate(total=db_models.Count('genome'), annotated=db_models.Sum('annotated', output_field=db_models.IntegerField()))
                genome_completed = stats_by_genome.filter(annotated=db_models.F('total')).count()
                genome_in_progress = stats_by_genome.filter(annotated=0).count()
                genome_unannotated = stats_by_genome.filter(annotated__lt=db_models.F('total'), annotated__gt=0).count()
                gene_count = Gene.objects.count()
                peptide_count = Peptide.objects.count()
                gene_annotation_count = GeneAnnotation.objects.count()
                peptide_annotation_count = PeptideAnnotation.objects.count()
                return Response({"genome_count": genome_count, 
                                "genome_fully_annotated_count": genome_completed, 
                                "genome_waiting_annotated_count": genome_in_progress, 
                                "genome_incomplete_annotated_count": genome_unannotated,
                                "gene_by_genome": stats_by_genome,
                                "gene_count": gene_count, "peptide_count": peptide_count, 
                                "gene_annotation_count": gene_annotation_count, 
                                "peptide_annotation_count": peptide_annotation_count})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    def post(self, request) -> Response:
        return Response({"error": "POST request not supported."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
    def put(self, request) -> Response:
        return Response({"error": "PUT request not supported."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
    def delete(self, request) -> Response:
        return Response({"error": "DELETE request not supported."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
class DownloadAPIView(APIView):

    def download(data: str, api: str, filters: dict, fields: list):
        response = HttpResponse(content_type='text/plain')
        query_params = filters
        if(query_params is not None):
            endpoint = "http://127.0.0.1:8000" + reverse(api)
            response_endpoint = requests.get(endpoint, params=query_params)
            if(response_endpoint.status_code == 200 and len(response_endpoint.json()) > 0):
                response['Content-Disposition'] = f'attachment; filename="{data}.txt"'
                writer = csv.writer(response, delimiter=';')
                if(fields is not None):
                    writer.writerow(fields)
                    for row in response_endpoint.json():
                        writer.writerow([row[f] for f in fields])
                else:
                    writer.writerow(response_endpoint.json()[0].keys())
                    for row in response_endpoint.json():
                        writer.writerow(row.values())
                return response
            else:
                return Response({"error": f"Error in {data} query."}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({"error": "No filters provided."}, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):

        data = request.data.get("data",None)

        if(data is not None):

            if(data == "genome"):

                return DownloadAPIView.download("genome", "genome_api", request.data.get("filters", None), request.data.get("fields", None))
                
            elif(data == "gene"):
                
                return DownloadAPIView.download("gene", "gene_api", request.data.get("filters", None), request.data.get("fields", None))
                    
            elif(data == "peptide"):
                
                return DownloadAPIView.download("peptide", "peptide_api", request.data.get("filters", None), request.data.get("fields", None))
                    
            elif(data == "annotation"):
                pass
            else:
                return Response({"error": "Data parameter provided is not valid."}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({"error": "No database parameter provided."}, status=status.HTTP_400_BAD_REQUEST)
    
    def post(self, request) -> Response:
        return Response({"error": "POST request not supported."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
    def put(self, request) -> Response:
        return Response({"error": "PUT request not supported."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
    def delete(self, request) -> Response:
        return Response({"error": "DELETE request not supported."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
class TaskAPIView(APIView):

    def get(self, request) -> Response:

        params = {"key": request.GET.get('key', None), # Key of the task
                "state": request.GET.get('state', None), # Status of the task
                "user": request.GET.get('user', None), # User who created the task
                "task": request.GET.get('task', None)} # Kind of task
        
        try:
            TaskInputSerializer(data=params).is_valid(raise_exception=True)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            params["user"] = CustomUser.objects.get(username=params["user"]) if params["user"] is not None else None
        except CustomUser.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        
        query_result = AsyncTasksCache.objects.filter(**{k: v for k, v in params.items() if v is not None})
        if query_result.count() == 0:
            return Response({"error": "No task found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = TaskSerializer(query_result, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request) -> Response:
        return Response({"error": "POST request not supported."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
    def put(self, request) -> Response:
        return Response({"error": "PUT request not supported."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
    def delete(self, request) -> Response:
        return Response({"error": "DELETE request not supported."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
class BlastAPIView(APIView):

    permission_classes = [IsAuthenticated&(IsAnnotatorUser|IsValidatorUser|IsAdminUser)]

    def get(self, request) -> Response:
        # Get the key of the task
        task = request.GET.get('key', None)
        try:
            TaskInputSerializer(data={"key": task}).is_valid(raise_exception=True)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        # From this point on, the parameters are assumed to be valid
        # retrieve the task from the cache
        if task:
            return AsyncTasksCache.retrieve_task(key=task, task_type="BLAST", user=request.user)
    
    def post(self, request) -> Response:
        # Validate the input parameters
        try:
            BlastRunInputSerializer(data=request.data).is_valid(raise_exception=True)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        # From this point on, the parameters are assumed to be valid
        # Gene name to be blasted
        try:
            gene = Gene.objects.get(name=request.data.get('gene', None))
        except Gene.DoesNotExist:
            return Response({"error": "Gene not found."}, status=status.HTTP_404_NOT_FOUND)
        if gene:
            # Check object permissions
            try:
                self.check_object_permissions(request, gene)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_403_FORBIDDEN)
            sequence = gene.sequence
            # Parameters for the BLAST task
            blast_params = {"sequence": sequence, # Sequence to be blasted
                    "program": request.data.get('program', "blastn"), # BLAST program to be used
                    "database": request.data.get('database', "nt"), # BLAST database to be used
                    "evalue": request.data.get('evalue', 0.001)} # E-value threshold
            return AsyncTasksCache.get_or_create_task(task_type="BLAST", task_params=blast_params, task_funct=run_blast, user=request.user)
        else:
            return Response({"error": "Gene parameter not provided."}, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request) -> Response:
        return Response({"error": "PUT request not supported."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
    def delete(self, request) -> Response:
        return Response({"error": "DELETE request not supported."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
class PFAMAPIView(APIView):

    permission_classes = [IsAuthenticated&(IsAnnotatorUser|IsValidatorUser|IsAdminUser)]

    def get(self, request) -> Response:
        # Get the key of the task
        key = request.GET.get('key', None)
        # Validate the query parameters
        try:
            TaskInputSerializer(data={"key": key}).is_valid(raise_exception=True)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        # From this point on, the parameters are assumed to be valid
        if key:
            # Retrieve the task from the cache
            return AsyncTasksCache.retrieve_task(key=key, task_type="PFAMScan", user=request.user)
    
    def post(self, request) -> Response:

        # Validate the input parameters
        try:
            PFAMRunInputSerializer(data=request.data).is_valid(raise_exception=True)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        # Get the peptide to be scanned
        try:
            peptide = Peptide.objects.get(name=request.data.get('peptide', None))
        except Peptide.DoesNotExist:
            return Response({"error": "Peptide not found."}, status=status.HTTP_404_NOT_FOUND)

        # Check object permissions
        try:
            self.check_object_permissions(request, peptide)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_403_FORBIDDEN)
        
        # Make paramaters for the PFAM task
        sequence = peptide.sequence
        pfam_params = {"sequence": sequence, # Sequence to be scanned against the PFAM database
                    "evalue": request.data.get('evalue', 0.001), # E-value threshold
                    "asp": request.data.get('asp', True), # Active site prediction method
                    "user": request.user.id, # User who submitted the task
        }
        
        # From this point on, the parameters are assumed to be valid
        return AsyncTasksCache.get_or_create_task(task_type="PFAMScan", task_params=pfam_params, task_funct=pfamscan, user=request.user)

    def put(self, request) -> Response:
        pass
    
    def delete(self, request) -> Response:
        pass