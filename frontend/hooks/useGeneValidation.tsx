"use client";
import { useEffect, useState } from 'react';
import { useAuthStore } from "@/store/useAuthStore";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

interface GeneAnnotation {
    gene_instance: string;
    strand: number;
    gene: string;
    gene_biotype: string;
    transcript_biotype: string;
    gene_symbol: string;
    description: string;
    is_current: boolean;
    status: string;
    
  }
  
  interface PeptideAnnotation {
    peptide: string;
    transcript: string;
    annotation: string;
  }
  
  interface AnnotationDetails {
    gene: GeneAnnotation[];
    peptide: PeptideAnnotation[];
  }
interface GeneStatus {
  gene: string;
  status: string;
  created_at: string;
  updated_at: string | null;
  validated_at: string | null;
  rejection_reason: string | null;
  annotator: string | null;
}

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: GeneStatus[];
}

interface UseGeneValidationReturn {
  pendingAnnotations: GeneStatus[];
  totalCount: number;
  loading: boolean;
  error: string | null;
  success: string | null;
  currentPage: number;
  selectedAnnotation: AnnotationDetails | null;
  approveGene: (gene: string) => Promise<void>;
  rejectGene: (gene: string, reason: string) => Promise<void>;
  fetchNextPage: () => Promise<void>;
  fetchPreviousPage: () => Promise<void>;
  fetchGeneDetails: (geneInstance: string) => Promise<void>;
}

export const useGeneValidation = (): UseGeneValidationReturn => {
  const user = useAuthStore(state => state.user?.username);
  const store = useAuthStore.getState();
  const accessToken = store.accessToken;

  const [pendingAnnotations, setPendingAnnotations] = useState<GeneStatus[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
  const [previousPageUrl, setPreviousPageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedAnnotation, setSelectedAnnotation] = useState<AnnotationDetails | null>(null);

  const fetchAnnotations = async (url: string) => {
    try {
      setLoading(true);
      setError(null);

      if (!accessToken) {
        throw new Error('No access token available');
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      });
    
      if (!response.ok) {
        throw new Error('Failed to fetch annotations');
      }
      
      const data: PaginatedResponse = await response.json();
      setPendingAnnotations(data.results);
      setTotalCount(data.count);
      setNextPageUrl(data.next);
      setPreviousPageUrl(data.previous);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch annotations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnotations(`${API_URL}/data/api/status/?limit=10&status=PENDING`);
  }, []);

  const approveGene = async (gene: string) => {
    try {
      setLoading(true);
      setError(null);

      if (!accessToken || !user) {
        throw new Error('No access token or user available');
      }

      const response = await fetch(`${API_URL}/data/api/status/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          action: "approve",
          user,
          gene: gene
        })
      });

      if (!response.ok) {
        throw new Error('Failed to approve gene');
      }

      setSuccess(`Successfully approved gene ${gene}`);
      // Refresh the list
      fetchAnnotations(`${API_URL}/data/api/status/?limit=10&status=PENDING`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve gene');
    } finally {
      setLoading(false);
    }
  };

  const rejectGene = async (gene: string, reason: string) => {
    try {
      setLoading(true);
      setError(null);

      if (!accessToken || !user) {
        throw new Error('No access token or user available');
      }

      const response = await fetch(`${API_URL}/data/api/status/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          action: "reject",
          reason,
          user,
          gene: gene
        })
      });

      if (!response.ok) {
        throw new Error('Failed to reject gene');
      }

      setSuccess(`Successfully rejected gene ${gene}`);
      // Refresh the list
      fetchAnnotations(`${API_URL}/data/api/status/?limit=10&status=PENDING`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject gene');
    } finally {
      setLoading(false);
    }
  };

  const fetchNextPage = async () => {
    if (nextPageUrl) {
      await fetchAnnotations(nextPageUrl);
      setCurrentPage(prev => prev + 1);
    }
  };

  const fetchPreviousPage = async () => {
    if (previousPageUrl) {
      await fetchAnnotations(previousPageUrl);
      setCurrentPage(prev => prev - 1);
    }
  };

  const fetchGeneDetails = async (geneInstance: string) => {
    try {
      setLoading(true);
      setError(null);

      if (!accessToken) {
        throw new Error('No access token available');
      }

      const response = await fetch(`http://127.0.0.1:8000/data/api/annotation/?gene_instance=${geneInstance}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch gene details');
      }

      const data = await response.json();
      setSelectedAnnotation(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch gene details');
    } finally {
      setLoading(false);
    }
};

  return {
    pendingAnnotations,
    totalCount,
    selectedAnnotation,
    loading,
    error,
    success,
    currentPage,
    approveGene,
    rejectGene,
    fetchNextPage,
    fetchPreviousPage,
    fetchGeneDetails
  };
};