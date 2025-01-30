import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const VALID_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'] as const;
type ValidStatus = typeof VALID_STATUSES[number];

export const useSubmittedAnnotations = (statusFilter = 'ALL') => {
  const [allAnnotations, setAllAnnotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [networkError, setNetworkError] = useState(false);
  
  const store = useAuthStore.getState();
  const accessToken = store.accessToken;
  const currentUserId = store.user?.username;

  const fetchSubmittedAnnotations = async () => {
    if (!accessToken) {
      setError("No access token available");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setNetworkError(false);
      
      // Fetch all annotations without status filter
      const url = `${API_URL}/data/api/status/?limit=100`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        
        if (response.status === 401 || response.status === 403) {
          throw new Error("Authentication error - Please log in again");
        }
        throw new Error("Failed to fetch submitted annotations");
      }

      const data = await response.json();
      
      if (!Array.isArray(data.results)) {
        throw new Error("Invalid data format received");
      }

      // Filter for current user's annotations and normalize status
      const userAnnotations = data.results
      .filter(annotation => 
        annotation.annotator === currentUserId && 
        VALID_STATUSES.includes(annotation.status as ValidStatus)
      );

      setAllAnnotations(userAnnotations);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
      if (err.message.includes("Network error")) {
        setNetworkError(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken && currentUserId) {
      fetchSubmittedAnnotations();
    } else {
      setLoading(false);
      setError("Please log in to view annotations");
    }
  }, [accessToken, currentUserId]); 

  console.log(statusFilter)
  const annotations = statusFilter === 'ALL' 
    ? allAnnotations 
    : allAnnotations.filter(annotation => annotation.status === statusFilter);

  console.log('Annotations:', annotations);
  

  return {
    annotations,
    loading,
    error,
    networkError,
    refetchAnnotations: fetchSubmittedAnnotations,
    hasAnnotations: annotations.length > 0
  };
};