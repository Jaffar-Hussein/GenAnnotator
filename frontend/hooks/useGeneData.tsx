import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

interface GeneData {
  name: string;
  start: number;
  end: number;
  header: string;
  sequence: string;
  length: number;
  gc_content: number;
  annotated: boolean;
  genome: string;
}

interface GeneAnnotation {
  gene: Array<{
    gene_instance: string;
    strand: number;
    gene: string;
    gene_biotype: string;
    transcript_biotype: string;
    gene_symbol: string;
    description: string;
    is_current: boolean;
    status: string;
  }>;
  peptide: Array<{
    peptide: string;
    transcript: string;
    annotation: string;
  }>;
}

interface UseGeneDataReturn {
  geneData: GeneData | null;
  annotation: GeneAnnotation | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useGeneData = (geneName: string): UseGeneDataReturn => {
  const [geneData, setGeneData] = useState<GeneData | null>(null);
  const [annotation, setAnnotation] = useState<GeneAnnotation | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const { accessToken } = useAuthStore.getState();

  const fetchGeneData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch gene data
      const geneResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/data/api/gene/?name=${geneName}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!geneResponse.ok) {
        throw new Error('Failed to fetch gene data');
      }

      const geneDataResponse = await geneResponse.json();
      setGeneData(geneDataResponse[0]); // API returns an array with single item

      // Fetch annotation data
      const annotationResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/data/api/annotation/?gene_instance=${geneName}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!annotationResponse.ok) {
        throw new Error('Failed to fetch annotation data');
      }

      const annotationData = await annotationResponse.json();
      setAnnotation(annotationData);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (geneName) {
      fetchGeneData();
    }
  }, [geneName, accessToken]);

  return {
    geneData,
    annotation,
    loading,
    error,
    refetch: fetchGeneData
  };
};