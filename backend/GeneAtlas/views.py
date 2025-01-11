from django.shortcuts import render
from .serializers import GenomeSerializer, GeneSerializer, PeptideSerializer, GeneAnnotationSerializer, PeptideAnnotationSerializer
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Genome, Gene, Peptide, GeneAnnotation, PeptideAnnotation

# Create your views here.

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
                }
        if(all(v is None for v in params.values())):
            return Response({"error": "No gene provided."}, status=status.HTTP_400_BAD_REQUEST)
        else:
            query_results_gene_annotation = inf_annotation_gene.get(**{k: v for k, v in params.items()})
            query_results_peptide_annotation = inf_annotation_peptide.get(annotation=query_results_gene_annotation)
        
        return Response({"gene": GeneAnnotationSerializer(query_results_gene_annotation).data, "peptide": PeptideAnnotationSerializer(query_results_peptide_annotation).data})


    def post(self, request):
        pass