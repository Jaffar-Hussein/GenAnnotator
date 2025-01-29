'use client';

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const useAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [networkError, setNetworkError] = useState(false);
  
  // Add console.log to debug token and user
  const store = useAuthStore.getState();
  const accessToken = store.accessToken;
  const currentUserId = store.user?.username;
  
  console.log('Debug Auth:', { 
    accessToken: !!accessToken, 
    currentUserId,
    storeState: store 
  });

  const fetchAssignments = async () => {
    if (!accessToken) {
      setError("No access token available");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setNetworkError(false);

      console.log('Fetching with token:', accessToken.slice(0, 10) + '...');

      const response = await fetch(
        `${API_URL}/data/api/status/?status=ONGOING&limit=100`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Response status:', response.status);

      if (!response.ok) {
        // Add more detailed error logging
        const errorData = await response.json();
        console.error('API Error:', errorData);
        
        if (response.status === 401 || response.status === 403) {
          throw new Error("Authentication error - Please log in again");
        }
        if (response.status === 404) {
          throw new Error("Resource not found");
        }
        if (response.status >= 500) {
          throw new Error("Server error - Please try again later");
        }
        throw new Error("Failed to fetch assignments");
      }

      const data = await response.json();
      console.log('Received data:', data);
      
      if (!Array.isArray(data.results)) {
        throw new Error("Invalid data format received");
      }

      const userAssignments = data.results.filter(
        assignment => assignment.annotator === currentUserId
      );

      setAssignments(userAssignments);
      setLoading(false);

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
      fetchAssignments();
    } else {
      setLoading(false); // Stop loading if no token
      setError("Please log in to view assignments");
    }
  }, [accessToken, currentUserId]);

  return {
    assignments,
    loading,
    error,
    networkError,
    refetchAssignments: fetchAssignments,
    hasAssignments: assignments.length > 0
  };
};