from django.shortcuts import render
from .serializers import GenomeSerializer, GeneSerializer, PeptideSerializer, AnnotationSerializer
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Genome, Gene, Peptide, Annotation

# Create your views here.

class GenomeAPIView(APIView):
    def get(self, request):
        inf = Genome.objects.all()
        if(request.GET.get('all', None) == 'true'):
            serializer = GenomeSerializer(inf, many=True)
            return Response(serializer.data)
        else:
            params = {"name": request.GET.get('name', None), 
                    "species": request.GET.get('species', None), 
                    "description": request.GET.get('description', None), 
                    "length": request.GET.get('length', None), 
                    "gc_content": request.GET.get('gc_content', None), 
                    "annotation": request.GET.get('annotation', None)}
            if(all(v is None for v in params.values())):
                return Response({"error": "No query parameters provided."}, status=status.HTTP_400_BAD_REQUEST)
            else:
                query_results = inf.filter(**{k: v for k, v in params.items() if v is not None})
                serializer = GenomeSerializer(query_results, many=True)
                return Response(serializer.data)

    def post(self, request):
        serializer = GenomeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)