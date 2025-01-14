from django.shortcuts import render
from django.urls import reverse
from GeneAtlas import urls
from django.views.generic import CreateView
from .serializers import GenomeSerializer, GeneSerializer, PeptideSerializer, GeneAnnotationSerializer, PeptideAnnotationSerializer, GeneAnnotationStatusSerializer
from rest_framework import status, request
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Genome, Gene, Peptide, GeneAnnotation, PeptideAnnotation, GeneAnnotationStatus
from django.db import transaction, models as db_models
from django.http import HttpResponse
from AccessControl.models import CustomUser
import csv
import requests

# Create your views here.

class HomeView(CreateView):

    def home_rendering(request):
        endpoints = []
        print('List of URL patterns:')
        for pattern in urls.urlpatterns:
            if(hasattr(pattern, 'name') and hasattr(pattern, 'pattern') and pattern.name != 'home'):
                endpoints.append({"name": pattern.name.removesuffix("_api"), "url": pattern.pattern})
        postman_examples = [
            {"name": "Get All Genomes", "request": "GET /data/api/genome/?all=true"},
            {"name": "Genome Query", "request": "GET /data/api/genome/?name=Escherichia_coli_cft073"},
        ]
        return render(request, "home.html", {"endpoints": endpoints, "postman_examples": postman_examples,"api_version": "v1.0"})

class GenomeAPIView(APIView):
    def get(self, request):
        inf = Genome.objects.all()
        if(request.GET.get('all', None) == 'true'):
            serializer = GenomeSerializer(inf, many=True)
        else:
            params = {"name": request.GET.get('name', None), 
                    "species": request.GET.get('species', None), 
                    "description": request.GET.get('description', None), 
                    "length": request.GET.get('length', None),
                    "motif": request.GET.get('motif', None),
                    "gc_content": request.GET.get('gc_content', None), 
                    "annotation": request.GET.get('annotation', None)}
            if(all(v is None for v in params.values())):
                return Response({"error": "No query parameters provided."}, status=status.HTTP_400_BAD_REQUEST)
            else:
                query_results = inf.filter(**{k: v for k, v in params.items() if v is not None and k != "motif"})
                if(params["motif"] is not None):
                    if(len(params["motif"]) < 3):
                        return Response({"error": "Motif must be at least 3 characters long."}, status=status.HTTP_400_BAD_REQUEST)
                    else:
                        query_results = [g for g in query_results if g.search_motif(params["motif"])]
                serializer = GenomeSerializer(query_results, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = GenomeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class GeneAPIView(APIView):
    def get(self, request):
        inf = Gene.objects.all()
        print(request)
        params = {"name": request.GET.get('name', None), 
                "genome": request.GET.get('genome', None), 
                "description": request.GET.get('description', None), 
                "length": request.GET.get('length', None),
                "motif": request.GET.get('motif', None),
                "gc_content": request.GET.get('gc_content', None), 
                "annotated": request.GET.get('annotated', None)}
        if(request.GET.get('all', None) == 'true'):
            if(params["genome"] is not None):
                query_results = inf.filter(genome=params["genome"])
                serializer = GeneSerializer(query_results, many=True)
            else:
                return Response({"error": "No genome specified."}, status=status.HTTP_400_BAD_REQUEST)
        else:
            if(all(v is None for v in params.values())):
                return Response({"error": "No query parameters provided."}, status=status.HTTP_400_BAD_REQUEST)
            else:
                query_results = inf.filter(**{k: v for k, v in params.items() if v is not None and k != "motif"})
                if(params["motif"] is not None):
                    if(len(params["motif"]) < 3):
                        return Response({"error": "Motif must be at least 3 characters long."}, status=status.HTTP_400_BAD_REQUEST)
                    else:
                        query_results = [g for g in query_results if g.search_motif(params["motif"])]
                serializer = GeneSerializer(query_results, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = GeneSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class PeptideAPIView(APIView):
    def get(self, request):
        inf = Peptide.objects.all()
        params = {"name": request.GET.get('name', None), 
                "gene": request.GET.get('gene', None),  
                "length": request.GET.get('length', None),
                "motif": request.GET.get('motif', None),
                "annotated": request.GET.get('annotated', None)}
        if(request.GET.get('all', None) == 'true'):
            if(params["gene"] is not None):
                query_results = inf.filter(gene=params["gene"])
                serializer = PeptideSerializer(query_results, many=True)
            else:
                return Response({"error": "No gene specified."}, status=status.HTTP_400_BAD_REQUEST)
        else:
            if(all(v is None for v in params.values())):
                return Response({"error": "No query parameters provided."}, status=status.HTTP_400_BAD_REQUEST)
            else:
                query_results = inf.filter(**{k: v for k, v in params.items() if v is not None and k not in ["motif", "annotated"]})
                if(params["motif"] is not None):
                    if(len(params["motif"]) < 3):
                        return Response({"error": "Motif must be at least 3 characters long."}, status=status.HTTP_400_BAD_REQUEST)
                    else:
                        query_results = [p for p in query_results if p.search_motif(params["motif"])]
                if(params["annotated"] is not None):
                    for p in query_results:
                        gene_query_result = Gene.objects.get(name=p.gene)
                        if(gene_query_result.count() == 0):
                            return Response({"error": "Gene not found."}, status=status.HTTP_404_NOT_FOUND)
                        else:
                            if(not gene_query_result.annotated):
                                query_results.remove(p)
                serializer = PeptideSerializer(query_results, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = PeptideSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class AnnotationAPIView(APIView):

    def get(self, request):
        inf_annotation_gene = GeneAnnotation.objects.all()
        inf_annotation_peptide = PeptideAnnotation.objects.all()
        params = {"gene_instance": request.GET.get('gene_instance', None),
                  "user": request.GET.get('user', None),
                }
        if(all(v is None for v in params.values())):
            return Response({"error": "No query parameters provided."}, status=status.HTTP_400_BAD_REQUEST)
        else:
            if(params["user"] is not None):
                params["user"] = CustomUser.objects.get(username=params["user"]).id
            query_results_gene_annotation = inf_annotation_gene.filter(**{k: v for k, v in params.items() if v is not None})
            gene_serializer = GeneAnnotationSerializer(query_results_gene_annotation, many=True)
            query_results_peptide_annotation = inf_annotation_peptide.filter(annotation__in=[g["gene_instance"] for g in gene_serializer.data])
            peptide_serializer = PeptideAnnotationSerializer(query_results_peptide_annotation, many=True)
        
        return Response({"gene": sorted(gene_serializer.data, key=lambda x: x['gene_instance']), "peptide": sorted(peptide_serializer.data, key=lambda x: x['annotation'])})


    def put(self, request):
        try:

            with transaction.atomic():

                gene_instance = request.data.get('gene_instance',None)

                if gene_instance is None:
                    return Response({'error': 'No gene instance provided'}, status=status.HTTP_400_BAD_REQUEST)
                
                if Gene.objects.get(name=gene_instance).annotated:
                    return Response({'error': 'Gene already annotated with APPROVED status'}, status=status.HTTP_400_BAD_REQUEST)

                existing_gene_annotation = GeneAnnotation.objects.filter(gene_instance=gene_instance).first()

                gene_annotation_data = {
                    'gene_instance': gene_instance,
                    'user': CustomUser.objects.get(username=request.data.get('user',None)).id,
                    'strand': request.data.get('strand') if request.data.get('strand',None) is not None else existing_gene_annotation.strand,
                    'gene': request.data.get('gene') if request.data.get('gene',None) is not None else existing_gene_annotation.gene,
                    'gene_biotype': request.data.get('gene_biotype') if request.data.get('gene_biotype',None) is not None else existing_gene_annotation.gene_biotype,
                    'transcript_biotype': request.data.get('transcript_biotype') if request.data.get('transcript_biotype',None) is not None else existing_gene_annotation.transcript_biotype,
                    'gene_symbol': request.data.get('gene_symbol') if request.data.get('gene_symbol',None) is not None else existing_gene_annotation.gene_symbol,
                    'description': request.data.get('description') if request.data.get('description',None) is not None else existing_gene_annotation.description,
                }
                
                gene_serializer = GeneAnnotationSerializer(instance = existing_gene_annotation, data=gene_annotation_data)

                if not gene_serializer.is_valid():
                    return Response(gene_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
                gene_annotation = gene_serializer.save()

                peptide_instance = request.data.get('peptide',None)

                if not peptide_instance is None:

                    existing_peptide_annotation = PeptideAnnotation.objects.filter(peptide=peptide_instance).first()

                    peptide_annotation_data = {
                        'peptide': peptide_instance,
                        'user': CustomUser.objects.get(username=request.data.get('user')).id,
                        'annotation': gene_annotation,
                        'transcript': request.data.get('transcript') if request.data.get('transcript',None) is not None else existing_peptide_annotation.transcript
                    }
                
                    peptide_serializer = PeptideAnnotationSerializer(instance = existing_peptide_annotation, data=peptide_annotation_data)

                    if not peptide_serializer.is_valid():
                        return Response(peptide_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
                    peptide_serializer.save()

                    return Response({'gene_annotation': gene_serializer.data,'peptide_annotation': peptide_serializer.data}, status=status.HTTP_201_CREATED)
                
                return Response({'gene_annotation': gene_serializer.data}, status=status.HTTP_201_CREATED)
    
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
    def post(self, request):
        return Response({"error": "POST request not supported."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
    def delete(self, request):
        return Response({"error": "DELETE request not supported."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

class AnnotationStatusAPIView(APIView):

    def get(self, request):
        inf = GeneAnnotationStatus.objects.all()
        params = {"gene": request.GET.get('gene', None), 
                "user": request.GET.get('user', None), 
                "status": request.GET.get('status', None),
                "annotator": request.GET.get('annotator', None)}
        if(all(v is None for v in params.values())):
            return Response({"error": "No query parameters provided."}, status=status.HTTP_400_BAD_REQUEST)
        else:
            if(params["user"] is not None):
                params["user"] = CustomUser.objects.get(username=params["user"]).id
            query_results = inf.filter(**{k: v for k, v in params.items() if v is not None})
            serializer = GeneAnnotationStatusSerializer(query_results, many=True)
        return Response(serializer.data)

    def put(self, request):
        status_obj = GeneAnnotationStatus.objects.get(gene=request.data.get('gene', None))
        
        if status_obj is None:
            return Response({'error': 'No status found'}, status=status.HTTP_404_NOT_FOUND)
    
        action = request.data.get('action')
        if action == 'approve':
            status_obj.approve()
            return Response({'status': 'approved'})
        
        elif action == 'reject':
            reason = request.data.get('reason')
            if not reason:
                return Response(
                    {'error': 'Rejection reason required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            status_obj.reject(reason=reason)
            return Response({'status': 'rejected'})
        
        return Response(
            {'error': 'Invalid action'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    def post(self, request):
        return Response({"error": "POST request not supported."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
    def delete(self, request):
        return Response({"error": "DELETE request not supported."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
        
class StatsAPIView(APIView):

    def get(self, request):
        user = request.GET.get("user", None)
        if(user is not None):
            user_pk = CustomUser.objects.get(username=user).id
            query = GeneAnnotation.objects.filter(user=user_pk)
            return Response({"annotation_count": query.count(),
                             "annotation": [a["gene_instance"] for a in GeneAnnotationSerializer(query, many=True).data]})
        else:
            genome_count = Genome.objects.count()
            query_gene_by_genome = Gene.objects.values('genome').annotate(total=db_models.Count('genome'), annotated=db_models.Sum('annotated', output_field=db_models.IntegerField()))
            genome_fully_annotated_count = Genome.objects.filter(annotation=True).count()
            genome_waiting_annotated_count = len([g["genome"] for g in Gene.objects.values('genome').annotate(total=db_models.Sum('annotated', output_field=db_models.IntegerField())) if g["total"] == 0])
            genome_incomplete_annotated_count = len([g["genome"] for g in query_gene_by_genome if g["annotated"] < g["total"] and g["annotated"] > 0])
            gene_count = Gene.objects.count()
            peptide_count = Peptide.objects.count()
            gene_annotation_count = GeneAnnotation.objects.count()
            peptide_annotation_count = PeptideAnnotation.objects.count()
            return Response({"genome_count": genome_count, 
                            "genome_fully_annotated_count": genome_fully_annotated_count, 
                            "genome_waiting_annotated_count": genome_waiting_annotated_count, 
                            "genome_incomplete_annotated_count": genome_incomplete_annotated_count,
                            "gene_by_genome": query_gene_by_genome,
                            "gene_count": gene_count, "peptide_count": peptide_count, 
                            "gene_annotation_count": gene_annotation_count, 
                            "peptide_annotation_count": peptide_annotation_count})
    
    def post(self, request):
        return Response({"error": "POST request not supported."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
    def put(self, request):
        return Response({"error": "PUT request not supported."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
    def delete(self, request):
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
    
    def post(self, request):
        return Response({"error": "POST request not supported."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
    def put(self, request):
        return Response({"error": "PUT request not supported."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
    def delete(self, request):
        return Response({"error": "DELETE request not supported."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)