import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const useSubmittedAnnotations = (statusFilter = 'PENDING') => {
  const [annotations, setAnnotations] = useState([]);
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

      
      const url = `${API_URL}/data/api/status/?limit=100&status=${statusFilter}`;

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

      const userAnnotations = data.results.filter(
        annotation => annotation.annotator === currentUserId
      );

      setAnnotations(userAnnotations);

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
  }, [accessToken, currentUserId, statusFilter]);

  return {
    annotations,
    loading,
    error,
    networkError,
    refetchAnnotations: fetchSubmittedAnnotations,
    hasAnnotations: annotations.length > 0
  };
};