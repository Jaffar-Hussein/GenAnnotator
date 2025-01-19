"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  ArrowUp,
  Clock,
  CheckCircle2,
  XCircle,
  UserRound,
  Check,
  Loader2,
  ChevronDown,
  Plus,
  Minus,
  Dna,
  Info,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  fetchRawGenes,
  fetchNextGenes,
  fetchUsers,
  
  assignGeneToUser,
} from "@/services/api";

import AnnotatorStats from "@/components/annotator-stats";

type AssignmentStatus = "PENDING" | "APPROVED" | "REJECTED" | "ONGOING" | "RAW";

interface Assignment {
  annotatorId: string;
  annotatorName: string;
  genes: string[];
  timestamp: string;
  status: AssignmentStatus;
}

const MAX_SELECTED_GENES = 10;

const GeneAssignment = () => {
  // State declarations and hooks remain the same
  const [availableGenes, setAvailableGenes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [statsReloadTrigger, setStatsReloadTrigger] = useState(0);
  const pageSize = 20;
  const [assignmentProgress, setAssignmentProgress] = useState(0);
  const [assignmentResults, setAssignmentResults] = useState<{
    status: Record<string, boolean>;
    message: Record<string, string>;
  } | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedAnnotator, setSelectedAnnotator] = useState("");
  const [selectedGenes, setSelectedGenes] = useState<string[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSection, setActiveSection] = useState<"assign" | "review">(
    "assign"
  );
  const [showAssignmentConfirmation, setShowAssignmentConfirmation] =
    useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [totalGenes, setTotal] = useState<number>(0);
  const [annotators, setAnnotators] = useState([]);

  // Effects and handlers remain the same
  useEffect(() => {
    const fetchAnnotators = async () => {
      try {
        const data = await fetchUsers({ role: "ANNOTATOR" });
        const formattedUsers = data.map((user, index) => ({
          id: index,
          name: user.username,
          email: user.email,
          role: user.role,
        }));
        setAnnotators(formattedUsers);
      } catch (error) {
        console.error("Error fetching annotators:", error);
      }
    };

    fetchAnnotators();
  }, []);

  useEffect(() => {
    const fetchInitialGenes = async () => {
      setLoading(true);
      try {
        const data = await fetchRawGenes({ limit: pageSize });
        if ("error" in data) {
          throw new Error(data.error);
        }
        setAvailableGenes(data.genes);
        setNextPage(data.next);
        setTotal(data.count);
      } catch (error) {
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialGenes();
  }, []);

  const loadMoreGenes = async () => {
    if (!nextPage || isLoading) return;

    setIsLoading(true);
    try {
      const data = await fetchNextGenes(nextPage);
      if ("error" in data) {
        throw new Error(data.error);
      }
      setAvailableGenes((prevGenes) => [...prevGenes, ...data.genes]);
      setNextPage(data.next);
      setCurrentPage((prevPage) => prevPage + 1);
    } catch (error) {
      console.error("Error loading more genes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMoreGenes();
  }, []);

  const assignedGenes = useMemo(
    () => assignments.flatMap((a) => a.genes),
    [assignments]
  );

  const unassignedGenes = useMemo(
    () => availableGenes.filter((gene) => !assignedGenes.includes(gene)),
    [availableGenes, assignedGenes]
  );

  const filteredGenes = useMemo(
    () =>
      unassignedGenes.filter((gene) =>
        gene.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [unassignedGenes, searchTerm]
  );

  const handleGeneClick = (gene: string) => {
    setSelectedGenes((prev) => {
      if (prev.includes(gene)) {
        return prev.filter((g) => g !== gene);
      } else {
        const newSelection = [...prev, gene];
        return newSelection.slice(0, MAX_SELECTED_GENES); // Limit to 10 genes
      }
    });

    // Check if we need to load more genes
    const remainingUnselectedGenes = filteredGenes.filter(
      (g) => !selectedGenes.includes(g)
    ).length;

    if (remainingUnselectedGenes <= 5 && !isLoading && nextPage) {
      loadMoreGenes();
    }
  };

  const handleQuickSelect = () => {
    const availableForSelection = unassignedGenes.filter(
      (gene) => !selectedGenes.includes(gene)
    );
    const genesToSelect = availableForSelection.slice(
      0,
      MAX_SELECTED_GENES - selectedGenes.length
    );

    setSelectedGenes((prev) => {
      const newSelection = [...prev, ...genesToSelect];
      // Check if we need to load more
      if (
        availableForSelection.length <= MAX_SELECTED_GENES &&
        nextPage &&
        !isLoading
      ) {
        loadMoreGenes();
      }
      return newSelection;
    });
  };

  const handleAssignment = async () => {
    if (!selectedAnnotator || selectedGenes.length === 0) return;

    const selectedUser = annotators.find(
      (a) => a.id.toString() === selectedAnnotator
    );
    if (!selectedUser) return;

    setIsAssigning(true);
    setAssignmentResults(null);

    try {
      const result = await assignGeneToUser({
        user: selectedUser.name,
        genes: selectedGenes,
      });

      // Process results
      const successfulGenes = selectedGenes.filter(
        (gene) => result.status[gene]
      );
      const failedGenes = selectedGenes.filter((gene) => !result.status[gene]);

      // Update assignments with successful genes
      if (successfulGenes.length > 0) {
        setAssignments((prev) => [
          ...prev,
          {
            annotatorId: selectedAnnotator,
            annotatorName: selectedUser.name,
            genes: successfulGenes,
            timestamp: new Date().toISOString(),
            status: "PENDING",
          },
        ]);
      }

      // Store results for display
      setAssignmentResults(result);
      setShowResults(true);
      setStatsReloadTrigger((prev) => prev + 1);
      // Clear selection only for successful assignments
      setSelectedGenes(failedGenes);
    } catch (error) {
      setAssignmentResults({
        status: {},
        message: { error: "Failed to assign genes. Please try again." },
      });
      setShowResults(true);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleUndo = () => {
    if (assignments.length > 0) {
      setAssignments(assignments.slice(0, -1));
    }
  };

  const AssignmentResults = ({ results }) => {
    if (!results) return null;

    useEffect(() => {
      const timer = setTimeout(() => {
        setShowResults(false);
      }, 5000);

      return () => clearTimeout(timer);
    }, []);

    const successCount = Object.values(results.status).filter(
      (status) => status
    ).length;
    const failureCount = Object.values(results.status).filter(
      (status) => !status
    ).length;

    return (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-4 right-4 max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
      >
        <div className="p-4 border-l-4 border-indigo-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Assignment Results
            </h3>
            <button
              onClick={() => setShowResults(false)}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            >
              ×
            </button>
          </div>
          <div className="space-y-2">
            {successCount > 0 && (
              <p className="text-sm text-green-600 dark:text-green-400">
                ✓ {successCount} gene(s) assigned successfully
              </p>
            )}
            {failureCount > 0 && (
              <p className="text-sm text-red-600 dark:text-red-400">
                ✗ {failureCount} gene(s) failed to assign
              </p>
            )}
            <div className="text-xs text-gray-600 dark:text-gray-300 mt-2 space-y-1">
              {Object.entries(results.message).map(([gene, message]) => (
                <div
                  key={gene}
                  className={`flex items-start gap-2 ${
                    results.status[gene]
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  <span className="font-mono">{gene}:</span>
                  <span>{message}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const EmptyStateGuide = () => (
    <div className="p-6 bg-slate-50 dark:bg-gray-800/50 rounded-lg border border-slate-200/60 dark:border-gray-700/60">
      <div className="flex flex-col items-center text-center">
        {/* Icon with pulse effect */}
        <div className="relative mb-4">
          <div className="absolute -top-1 -right-1">
            <span className="flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-violet-500"></span>
            </span>
          </div>
          <div className="h-12 w-12 rounded-lg bg-white dark:bg-gray-800 border border-slate-200/60 dark:border-gray-700/60 flex items-center justify-center">
            <UserRound className="h-6 w-6 text-slate-400 dark:text-slate-500" />
          </div>
        </div>
  
        {/* Title and description */}
        <h4 className="text-base font-medium text-slate-900 dark:text-white mb-1.5">
          Select an Annotator
        </h4>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          View performance stats and activity
        </p>
  
        {/* Stats preview */}
        <div className="w-full grid grid-cols-3 gap-2 mb-3">
          {[
            { icon: Clock, label: "Pending" },
            { icon: CheckCircle2, label: "Approved" },
            { icon: XCircle, label: "Rejected" }
          ].map((item, index) => (
            <div 
              key={index} 
              className="flex items-center gap-1.5 p-2 bg-white dark:bg-gray-800 rounded-md border border-slate-200/60 dark:border-gray-700/60"
            >
              <item.icon className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
              <span className="text-xs text-slate-500 dark:text-slate-400">{item.label}</span>
            </div>
          ))}
        </div>
  
        {/* Selection hint */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
          <ArrowUp className="h-3.5 w-3.5 animate-bounce" />
          <span>Choose from the dropdown above</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-5 dark:from-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8 md:px-8 md:py-12">
        <AnimatePresence mode="wait">
          {activeSection === "assign" ? (
            <motion.div
              key="assign"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Assignment Controls */}
              <div className="mb-8 rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm border border-slate-200/60 dark:border-gray-700/60">
                {/* Header with improved visual hierarchy */}
                <div className="p-8 bg-gradient-to-r from-slate-50/50 to-white dark:from-gray-800 dark:to-gray-800/50 border-b border-slate-200/60 dark:border-gray-700/60">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="h-8 w-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                      <Dna className="h-5 w-5 text-violet-500 dark:text-violet-400" />
                    </div>
                    <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                      New Assignment
                    </h2>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 ml-11">
                    Select an annotator and choose genes to assign
                  </p>
                </div>

                <div className="p-8">
                  <div className="grid md:grid-cols-3 gap-8">
                    {/* Annotator Selection Section */}
                    <div className="md:col-span-2 space-y-6">
                      <div className="space-y-4">
                        <label className="inline-flex items-center text-sm font-medium text-slate-700 dark:text-slate-300">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/30 mr-2">
                            <span className="text-violet-600 dark:text-violet-400 text-xs">
                              1
                            </span>
                          </span>
                          Select Annotator
                        </label>

                        <Select
                          value={selectedAnnotator}
                          onValueChange={setSelectedAnnotator}
                        >
                          <SelectTrigger
                            className="w-full border-slate-200 dark:border-gray-600 dark:bg-gray-800/50 
                         hover:border-violet-200 dark:hover:border-violet-800/50 transition-colors"
                          >
                            <SelectValue placeholder="Choose annotator..." />
                          </SelectTrigger>
                          <SelectContent>
                            {annotators.map((annotator) => (
                              <SelectItem
                                key={annotator.id}
                                value={annotator.id.toString()}
                                className="dark:text-white dark:hover:bg-gray-700"
                              >
                                <div className="flex items-center space-x-2">
                                  <div
                                    className="h-6 w-6 rounded-full bg-violet-100 dark:bg-violet-900/30 
                                  flex items-center justify-center text-xs text-violet-600 dark:text-violet-400"
                                  >
                                    {annotator.name.charAt(0).toUpperCase()}
                                  </div>
                                  <span>{annotator.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {/* Stats Card */}
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={selectedAnnotator ? "stats" : "empty"}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="mt-4"
                          >
                            {selectedAnnotator && annotators.length > 0 ? (
                              <div className="rounded-lg border border-slate-200/60 dark:border-gray-700/60 bg-slate-50 dark:bg-gray-800/50">
                                <AnnotatorStats
                                  username={
                                    annotators.find(
                                      (a) =>
                                        a.id.toString() === selectedAnnotator
                                    )?.name || ""
                                  }
                                  reloadTrigger={statsReloadTrigger}
                                />
                              </div>
                            ) : (
                              <EmptyStateGuide />
                            )}
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Selected Genes Section */}
                    <div className="space-y-6">
                      <div>
                        <label className="inline-flex items-center text-sm font-medium text-slate-700 dark:text-slate-300">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/30 mr-2">
                            <span className="text-violet-600 dark:text-violet-400 text-xs">
                              2
                            </span>
                          </span>
                          Selected Genes
                        </label>

                        <div
                          className="mt-4 bg-slate-50 dark:bg-gray-800/50 border border-slate-200/60 
                        dark:border-gray-700/60 rounded-lg p-4 min-h-[200px] max-h-[300px] 
                        overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 
                        dark:scrollbar-thumb-gray-700"
                        >
                          {selectedGenes.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {selectedGenes.map((gene) => (
                                <Badge
                                  key={gene}
                                  variant="secondary"
                                  className="group bg-white dark:bg-gray-800 text-slate-700 dark:text-slate-200 
                             border border-slate-200 dark:border-gray-700 hover:border-violet-200 
                             dark:hover:border-violet-800/50 transition-all duration-200"
                                >
                                  <span className="font-mono">{gene}</span>
                                  <button
                                    onClick={() => handleGeneClick(gene)}
                                    className="ml-1 text-slate-400 group-hover:text-rose-500 
                               dark:text-slate-500 dark:group-hover:text-rose-400 
                               opacity-0 group-hover:opacity-100 transition-all duration-200"
                                  >
                                    <Minus className="h-3 w-3" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-6">
                              <div
                                className="h-12 w-12 rounded-full bg-slate-100 dark:bg-gray-700 
                              flex items-center justify-center mb-3"
                              >
                                <Dna className="h-6 w-6 text-slate-400 dark:text-slate-500" />
                              </div>
                              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                                No genes selected yet
                              </p>
                              <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">
                                Use the search below to find and select genes
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Assignment Button */}
                      <div>
                      <Button
                        onClick={handleAssignment}
                        disabled={
                          !selectedAnnotator ||
                          selectedGenes.length === 0 ||
                          isAssigning
                        }
                        className={`w-full transition-all duration-200 ${
                          !selectedAnnotator || selectedGenes.length === 0
                            ? "bg-slate-100 dark:bg-gray-700 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                            : "bg-violet-500 hover:bg-violet-600 dark:bg-violet-600 dark:hover:bg-violet-500 text-white shadow-sm"
                        }`}
                      >
                        {isAssigning ? (
                          <span className="flex items-center justify-center">
                            <Loader2 className="animate-spin mr-2 h-4 w-4" />
                            Assigning...
                          </span>
                        ) : selectedAnnotator && selectedGenes.length > 0 ? (
                          <span className="flex items-center justify-center">
                            <Check className="mr-2 h-4 w-4" />
                            Assign {selectedGenes.length} Gene
                            {selectedGenes.length !== 1 ? "s" : ""}
                          </span>
                        ) : (
                          <span>Select annotator and genes to continue</span>
                        )}
                      </Button>
                      {selectedGenes.length > 0 && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-2"
    >
      <Info className="h-3.5 w-3.5" />
      <span>Hover over selected genes to remove them from selection</span>
    </motion.div>
  )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gene Selection */}
              <div className="rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm border border-slate-200/60 dark:border-gray-700/60">
                {/* Header Section */}
                <div className="p-6 border-b border-slate-200/60 dark:border-gray-700/60 bg-gradient-to-r from-slate-50 to-white dark:from-gray-800 dark:to-gray-800/50">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start space-x-3">
                      <div className="h-10 w-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                        <Dna className="h-5 w-5 text-violet-500 dark:text-violet-400" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                          Available Genes
                        </h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {totalGenes} genes available for assignment
                        </p>
                      </div>
                    </div>

                    {/* Search and Quick Select */}
                    <div className="flex items-center gap-3">
                      <div className="relative group flex-1 md:flex-none">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 transition-transform group-focus-within:text-violet-500">
                          <Search className="h-4 w-4" />
                        </div>
                        <Input
                          type="text"
                          placeholder="Search genes..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full md:w-64 pl-9 border-slate-200 dark:border-slate-700 
                     bg-white dark:bg-gray-800 text-slate-900 dark:text-slate-200 
                     placeholder:text-slate-400 dark:placeholder:text-slate-500
                     focus:border-violet-300 dark:focus:border-violet-700
                     focus:ring-violet-300/20 dark:focus:ring-violet-700/20"
                        />
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          onClick={handleQuickSelect}
                          variant="outline"
                          size="sm"
                          className="whitespace-nowrap bg-white dark:bg-gray-800 border-slate-200 
                     dark:border-slate-700 text-slate-700 dark:text-slate-300 
                     hover:bg-slate-50 dark:hover:bg-slate-700/50 
                     hover:text-violet-600 dark:hover:text-violet-400
                     hover:border-violet-300 dark:hover:border-violet-700"
                        >
                          Quick Select (10)
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* Genes Grid */}
                <div className="p-6">
                  {filteredGenes.length > 0 ? (
                    <>
                      <motion.div
                        className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ staggerChildren: 0.05 }}
                      >
                        {filteredGenes.map((gene, index) => (
                          <motion.button
                            key={index}
                            onClick={() => handleGeneClick(gene)}
                            className={`group relative px-3 py-2.5 border rounded-lg font-mono text-sm 
                         transition-all duration-200 hover:shadow-sm ${
                           selectedGenes.includes(gene)
                             ? "bg-violet-50 dark:bg-violet-900/30 border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300"
                             : "bg-white dark:bg-gray-800 border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-700 text-slate-700 dark:text-slate-300"
                         }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            <div className="flex items-center justify-center space-x-1.5">
                              <Dna
                                className={`h-4 w-4 ${
                                  selectedGenes.includes(gene)
                                    ? "text-violet-500 dark:text-violet-400"
                                    : "text-slate-400 dark:text-slate-500 group-hover:text-violet-500 dark:group-hover:text-violet-400"
                                }`}
                              />
                              <span>{gene}</span>
                              <span
                                className={`absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity ${
                                  selectedGenes.includes(gene)
                                    ? "text-violet-500 dark:text-violet-400"
                                    : "text-slate-400 dark:text-slate-500"
                                }`}
                              >
                                {selectedGenes.includes(gene) ? (
                                  <Minus className="h-3 w-3" />
                                ) : (
                                  <Plus className="h-3 w-3" />
                                )}
                              </span>
                            </div>
                          </motion.button>
                        ))}
                      </motion.div>

                      {/* Load More Section */}
                      {!isLoading && nextPage && (
                        <div className="flex justify-center mt-8">
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Button
                              onClick={loadMoreGenes}
                              variant="outline"
                              className="group px-6 py-2 bg-white dark:bg-gray-800 border-slate-200 
                         dark:border-slate-700 text-slate-600 dark:text-slate-400
                         hover:bg-slate-50 dark:hover:bg-slate-700/50
                         hover:border-violet-300 dark:hover:border-violet-700"
                            >
                              {isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin text-violet-500" />
                              ) : (
                                <ChevronDown
                                  className="mr-2 h-4 w-4 text-slate-400 group-hover:text-violet-500 
                                      dark:text-slate-500 dark:group-hover:text-violet-400 
                                      group-hover:animate-bounce"
                                />
                              )}
                              Load More Genes
                            </Button>
                          </motion.div>
                        </div>
                      )}
                    </>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="py-12 px-4"
                    >
                      <div className="max-w-sm mx-auto text-center">
                        <div
                          className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-700 
                         flex items-center justify-center mx-auto mb-4"
                        >
                          <Dna className="h-6 w-6 text-slate-400 dark:text-slate-500" />
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 font-medium mb-1">
                          {searchTerm
                            ? "No genes match your search"
                            : "No genes available"}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {searchTerm
                            ? "Try adjusting your search terms or clear the search"
                            : "Check back later for new genes to assign"}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <></>
          )}
        </AnimatePresence>

        {/* Assignment Results Toast */}
        <AnimatePresence>
          {showResults && assignmentResults && (
            <AssignmentResults results={assignmentResults} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GeneAssignment;
