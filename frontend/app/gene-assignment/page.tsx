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
  ArrowRight,
  Undo2,
  Info,
  Loader2,
  ChevronDown,
  Plus,
  Minus,
  Dna,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  fetchRawGenes,
  fetchNextGenes,
  fetchUsers,
  fetchUsersStats,
  assignGeneToUser,
} from "@/services/api";

import AnnotatorStats from "@/components/annotator-stats";

// Types for assignment status
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
  // const totalGenes = 100;
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
      } catch (error) {}
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
  };

  const handleQuickSelect = () => {
    const genesToSelect = filteredGenes.slice(0, MAX_SELECTED_GENES);
    setSelectedGenes((prev) => {
      const newSelection = [...new Set([...prev, ...genesToSelect])];
      return newSelection.slice(0, MAX_SELECTED_GENES); // Limit to 10 genes
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
        className="fixed bottom-4 right-4 max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden"
      >
        <div className="p-4 border-l-4 border-indigo-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium">Assignment Results</h3>
            <button
              onClick={() => setShowResults(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          <div className="space-y-2">
            {successCount > 0 && (
              <p className="text-sm text-green-600">
                ✓ {successCount} gene(s) assigned successfully
              </p>
            )}
            {failureCount > 0 && (
              <p className="text-sm text-red-600">
                ✗ {failureCount} gene(s) failed to assign
              </p>
            )}
            <div className="text-xs text-gray-600 mt-2 space-y-1">
              {Object.entries(results.message).map(([gene, message]) => (
                <div
                  key={gene}
                  className={`flex items-start gap-2 ${
                    results.status[gene] ? "text-green-600" : "text-red-600"
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
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-5 dark:from-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8 md:px-8 md:py-12">
        {/* Navigation */}
        <nav className="mb-8 border-b border-indigo-200 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <motion.button
                onClick={() => setActiveSection("assign")}
                className={`pb-4 -mb-4 text-sm font-medium transition-colors relative ${
                  activeSection === "assign"
                    ? "text-slate-900 dark:text-white"
                    : "text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Assign Genes
                {activeSection === "assign" && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
                    layoutId="activeSection"
                  />
                )}
              </motion.button>
              <motion.button
                onClick={() => setActiveSection("review")}
                className={`pb-4 -mb-4 text-sm font-medium transition-colors relative ${
                  activeSection === "review"
                    ? "text-slate-900 dark:text-white"
                    : "text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Review Assignments
                {activeSection === "review" && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
                    layoutId="activeSection"
                  />
                )}
              </motion.button>
            </div>
            <div className="flex items-center space-x-4">
              <Progress
                value={(assignedGenes.length / availableGenes.length) * 100}
                className="w-32 bg-indigo-200"
              />
              <span className="text-sm text-indigo-700">
                {assignedGenes.length}/{availableGenes.length} Assigned
              </span>
            </div>
          </div>
        </nav>

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
              <div className="mb-8  rounded-lg overflow-hidden">
                <div className="p-6">
                  <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                    New Assignment
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    Select an annotator and choose genes to assign
                  </p>
                </div>
                <div className="p-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Select Annotator
                      </label>
                      <div className="space-y-4">
                        <Select
                          value={selectedAnnotator}
                          onValueChange={(newValue) => {
                            setSelectedAnnotator(newValue);
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Choose annotator" />
                          </SelectTrigger>
                          <SelectContent>
                            {annotators.map((annotator) => (
                              <SelectItem
                                key={annotator.id}
                                value={annotator.id.toString()}
                              >
                                <div className="flex justify-between items-center w-full">
                                  <span>{annotator.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {/* Annotator Statistics */}
                        <AnimatePresence>
                          {selectedAnnotator && annotators.length > 0 && (
                            <AnnotatorStats
                              username={
                                annotators.find(
                                  (a) => a.id.toString() === selectedAnnotator
                                )?.name || ""
                              }
                              reloadTrigger={statsReloadTrigger}
                            />
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-indigo-700 mb-2">
                          Selected Genes
                        </label>
                        <div className="bg-white border border-indigo-200 rounded-md p-2 min-h-[100px] max-h-[200px] overflow-y-auto">
                          <AnimatePresence>
                            {selectedGenes.length > 0 ? (
                              <motion.div
                                className="flex flex-wrap gap-2"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                              >
                                {selectedGenes.map((gene, index) => (
                                  <motion.div
                                    key={gene}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <Badge
                                      variant="secondary"
                                      className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200 transition-colors flex items-center gap-1"
                                    >
                                      {gene}
                                      <button
                                        onClick={() => handleGeneClick(gene)}
                                        className="ml-1 text-indigo-600 hover:text-indigo-800"
                                      >
                                        <Minus className="h-3 w-3" />
                                      </button>
                                    </Badge>
                                  </motion.div>
                                ))}
                              </motion.div>
                            ) : (
                              <motion.p
                                className="text-indigo-500 text-sm"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                              >
                                No genes selected
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>
                        {selectedGenes.length === MAX_SELECTED_GENES && (
                          <motion.p
                            className="text-sm text-yellow-600 mt-2"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            Maximum number of genes selected (
                            {MAX_SELECTED_GENES})
                          </motion.p>
                        )}
                      </div>

                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          onClick={handleAssignment}
                          disabled={
                            !selectedAnnotator ||
                            selectedGenes.length === 0 ||
                            isAssigning
                          }
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white relative"
                        >
                          {isAssigning ? (
                            <span className="flex items-center justify-center">
                              <Loader2 className="animate-spin mr-2 h-4 w-4" />
                              Assigning...
                            </span>
                          ) : (
                            `Assign ${selectedGenes.length} Gene${
                              selectedGenes.length !== 1 ? "s" : ""
                            }`
                          )}
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Available Genes */}
              <div className="rounded-lg overflow-hidden ">
                <div className="p-6 flex flex-col md:flex-row md:items-center justify-between border border-indigo-100/20 dark:border-indigo-900/20 shadow-sm ">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-50">
                      Available Genes
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {totalGenes} genes available for assignment
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 mt-4 md:mt-0">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                      <Input
                        type="text"
                        placeholder="Search genes..."
                        className="pl-9 w-64 border-slate-200 focus:border-slate-300 focus:ring-slate-400 dark:border-slate-700 dark:focus:border-slate-600 dark:focus:ring-slate-500 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        onClick={handleQuickSelect}
                        variant="outline"
                        size="sm"
                        className="whitespace-nowrap border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                      >
                        Quick Select (10)
                      </Button>
                    </motion.div>
                  </div>
                </div>
                <div className="p-6">
                  {filteredGenes.length > 0 ? (
                    <>
                      <motion.div
                        className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ staggerChildren: 0.05 }}
                      >
                        {filteredGenes.map((gene, index) => (
                          <motion.button
                            key={index}
                            onClick={() => handleGeneClick(gene)}
                            className={`px-3 py-2 border rounded-md font-mono text-sm text-center transition-all duration-200 ${
                              selectedGenes.includes(gene)
                                ? "bg-indigo-100 border-indigo-300 text-indigo-700"
                                : "bg-white hover:bg-indigo-50 hover:border-indigo-300 text-indigo-600 hover:text-indigo-800"
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            <Dna className="inline-block mr-1 h-4 w-4" />
                            {gene}
                            {selectedGenes.includes(gene) ? (
                              <Minus className="inline-block ml-1 h-3 w-3" />
                            ) : (
                              <Plus className="inline-block ml-1 h-3 w-3" />
                            )}
                          </motion.button>
                        ))}
                      </motion.div>
                      {!isLoading && unassignedGenes.length < totalGenes && (
                        <div className="flex justify-center mt-6">
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button
                              onClick={loadMoreGenes}
                              variant="outline"
                              className="group border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                            >
                              {isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <ChevronDown className="mr-2 h-4 w-4 group-hover:animate-bounce" />
                              )}
                              Load More Genes
                            </Button>
                          </motion.div>
                        </div>
                      )}
                    </>
                  ) : (
                    <motion.div
                      className="text-center py-12"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <p className="text-indigo-500">
                        {searchTerm
                          ? "No genes match your search"
                          : "No genes available"}
                      </p>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            /* Assignment History */
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="p-6 border-b border-indigo-100">
                  <h2 className="text-2xl font-semibold text-indigo-900">
                    Assignment History
                  </h2>
                  <p className="text-indigo-600">
                    Review and manage gene assignments
                  </p>
                </div>
                <div className="p-6">
                  {assignments.length > 0 ? (
                    <motion.div
                      className="space-y-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ staggerChildren: 0.1 }}
                    >
                      {assignments
                        .slice()
                        .reverse()
                        .map((assignment, index) => (
                          <motion.div
                            key={index}
                            className="group hover:bg-indigo-50 p-4 rounded-lg -mx-4 transition-colors"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="space-y-1">
                                <h3 className="font-medium text-indigo-900">
                                  {assignment.annotatorName}
                                </h3>
                                <p className="text-sm text-indigo-600">
                                  {assignment.genes.length} genes assigned •{" "}
                                  <time
                                    dateTime={assignment.timestamp}
                                    className="font-mono"
                                  >
                                    {new Date(
                                      assignment.timestamp
                                    ).toLocaleDateString()}
                                  </time>
                                </p>
                              </div>
                              {index === 0 && (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.2 }}
                                >
                                  <Button
                                    onClick={handleUndo}
                                    variant="ghost"
                                    size="sm"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100"
                                  >
                                    <Undo2 className="h-4 w-4 mr-2" />
                                    Undo
                                  </Button>
                                </motion.div>
                              )}
                            </div>
                            <motion.div
                              className="flex flex-wrap gap-1.5"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.1, staggerChildren: 0.03 }}
                            >
                              {assignment.genes.map((gene, gIndex) => (
                                <motion.span
                                  key={gIndex}
                                  className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-mono"
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                >
                                  {gene}
                                </motion.span>
                              ))}
                            </motion.div>
                            {index !== assignments.length - 1 && (
                              <Separator className="mt-6 border-indigo-200" />
                            )}
                          </motion.div>
                        ))}
                    </motion.div>
                  ) : (
                    <motion.div
                      className="text-center py-12"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <p className="text-indigo-500">No assignments made yet</p>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Assignment Confirmation */}
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
