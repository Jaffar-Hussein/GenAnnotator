import { useState } from 'react';
import { useAuthStore } from "@/store/useAuthStore";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

interface AnnotationFormData {
  strand: number;
  gene: string;
  peptide: string;
  gene_biotype: string;
  transcript_biotype: string;
  gene_symbol: string;
  description: string;
  transcript: string;
}

export const useAnnotationForm = (geneInstance: string) => {
  const accessToken = useAuthStore(state => state.accessToken);
  const user = useAuthStore(state => state.user?.username);

  const [formData, setFormData] = useState<AnnotationFormData>({
    strand: 1,
    gene: '',               
    peptide: '',
    gene_biotype: '',      
    transcript_biotype: '', 
    gene_symbol: '',
    description: '',
    transcript: '',
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const saveDraft = async () => {
    try {
      setSaving(true);
      setError(null);

      if (!accessToken) {
        throw new Error('No access token available');
      }

      const response = await fetch(`${API_URL}/data/api/annotation/${geneInstance}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          strand: formData.strand,
          gene_biotype: formData.gene_biotype,
          transcript_biotype: formData.transcript_biotype,
          description: formData.description || undefined,
          gene_symbol: formData.gene_symbol || undefined,
          gene: formData.gene || undefined,
          transcript: formData.transcript || undefined,
          peptide: formData.peptide || undefined
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save draft');
      }

      setSuccess('Draft saved successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save draft');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const submitForReview = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!accessToken) {
        throw new Error('No access token available');
      }

      if (!user) {
        throw new Error('No user found');
      }

      // First, save the latest changes
      await saveDraft();

      // Then submit for review using the status endpoint
      const statusResponse = await fetch(`${API_URL}/data/api/status/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          action: 'submit',
          user: user,
          gene: geneInstance
        })
      });

      if (!statusResponse.ok) {
        const errorData = await statusResponse.json();
        throw new Error(errorData.message || 'Failed to submit for review');
      }

      setSuccess('Annotation submitted for review successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit annotation');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    setFormData,
    loading,
    saving,
    error,
    success,
    saveDraft,
    submitForReview
  };
};