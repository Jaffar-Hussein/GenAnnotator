from django.shortcuts import render
from .serializers import GenomeSerializer, GeneSerializer, PeptideSerializer, AnnotationSerializer
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Genome, Gene, Peptide, Annotation

# Create your views here.

class GenomeAPIView(APIView):
    def get(self, request):
        params = {"name": request.data.get('name', None), 
                  "species": request.data.get('species', None), 
                  "description": request.data.get('description', None), 
                  "length": request.data.get('length', None), 
                  "gc_content": request.data.get('gc_content', None), 
                  "annotation": request.data.get('annotation', None)}
        inf = Genome.objects.all()
        query_results = inf.filter(**{k: v for k, v in params.items() if v is not None})
        serializer = GenomeSerializer(query_results, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = GenomeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)