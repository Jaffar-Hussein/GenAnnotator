'use client';
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const useAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [networkError, setNetworkError] = useState(false);
  const store = useAuthStore.getState();
  const accessToken = store.accessToken;
  const currentUserId = store.user?.username

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      setNetworkError(false);
      
      const response = await fetch(
        `${API_URL}/data/api/status/?status=ONGOING&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      ).catch(() => {
        throw new Error("Network error - Please check your connection");
      });

      if (!response.ok) {
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
      
      if (!Array.isArray(data.results)) {
        throw new Error("Invalid data format received");
      }
      
      const userAssignments = data.results.filter(
        assignment => assignment.annotator === currentUserId
      );

      setAssignments(userAssignments);

      
    } catch (err) {
      setError(err.message);
      if (err.message.includes("Network error")) {
        setNetworkError(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);
  
  return {
    assignments,
    loading,
    error,
    networkError,
    refetchAssignments: fetchAssignments,
    hasAssignments: assignments.length > 0
  };
};