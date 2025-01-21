import { useState } from 'react';
import { useAuthStore } from "@/store/useAuthStore";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

interface AnnotationFormData {
  gene_instance: string;
  user?: string;
  strand: number;
  gene?: string;
  peptide?: string;
  gene_biotype?: string;
  transcript_biotype?: string;
  gene_symbol?: string;
  description?: string;
  transcript?: string;
}

interface UseAnnotationFormReturn {
  formData: AnnotationFormData;
  setFormData: React.Dispatch<React.SetStateAction<AnnotationFormData>>;
  loading: boolean;
  saving: boolean;
  error: string | null;
  success: string | null;
  saveDraft: () => Promise<void>;
  submitAnnotation: () => Promise<void>;
}

export const useAnnotationForm = (geneId: string): UseAnnotationFormReturn => {
    const accessToken = useAuthStore(state => state.accessToken);
    const user = useAuthStore(state => state.user?.username);
  
    // Ensure gene_instance is set in initial form data
    const [formData, setFormData] = useState<AnnotationFormData>({
      gene_instance: geneId, // Set it here
      strand: 1,
      gene: '',
      peptide: '',
      gene_biotype: 'protein_coding',
      transcript_biotype: 'protein_coding',
      gene_symbol: '',
      description: '',
      transcript: ''
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
    
          // Match the exact format needed
          const draftData = {
            gene_instance: geneId,  // Make sure this is included
            strand: 1,
            gene_biotype: "protein_coding",
            transcript_biotype: "protein_coding"
          };
    
          console.log('Draft Data:', draftData); // Debug log
    
          const response = await fetch(`${API_URL}/data/api/annotation/`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(draftData)
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
  
    const submitAnnotation = async () => {
      try {
        setLoading(true);
        setError(null);
  
        if (!accessToken) {
          throw new Error('No access token available');
        }
  
        if (!user) {
          throw new Error('No user found');
        }
  
        if (!formData.gene || !formData.peptide || !formData.gene_symbol || !formData.description) {
          throw new Error('Please fill in all required fields');
        }
  
        const submissionData = {
          ...formData,
          gene_instance: geneId, 
          user
        };
  
        console.log('Submission Data:', submissionData);
  
        const response = await fetch(`${API_URL}/data/api/annotation/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify(submissionData)
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to submit annotation');
        }
  
        setSuccess('Annotation submitted successfully');
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
      submitAnnotation
    };
  };