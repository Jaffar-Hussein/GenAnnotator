"use client";
import SearchFilters from "@/components/gene-search";
import GeneCard from "@/components/gene-card";
import GeneListView from "@/components/gene-list";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

import {
 Upload,
  Database,
  AlertCircle,
  Dna,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { Alert, AlertDescription } from "@/components/ui/alert";

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: RawGene[];
}

export default function GenesPage() {
  const [genes, setGenes] = useState<Gene[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const ITEMS_PER_PAGE = 12;

  // Filter and sort genes
  const filteredGenes = genes
    .filter((gene) => {
      const matchesSearch =
        gene.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gene.genome.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ||
        gene.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "length":
          return a.length - b.length;
        case "position":
          return (
            parseInt(a.position.split("-")[0]) -
            parseInt(b.position.split("-")[0])
          );
        default:
          return 0;
      }
    });

  useEffect(() => {
    async function fetchGenes() {
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
      setLoading(true);
      try {
        const response = await fetch(
          `${backendUrl}/data/api/gene/?limit=${ITEMS_PER_PAGE}&offset=${
            (currentPage - 1) * ITEMS_PER_PAGE
          }`
        );
        if (!response.ok) {
          throw new Error(
            `Failed to fetch gene data: ${response.status} ${response.statusText}`
          );
        }
        const data: PaginatedResponse = await response.json();

        const transformedData: Gene[] = data.results.map((item) => ({
          id: item.name,
          name: item.name,
          position: `${item.start}-${item.end}`,
          length: item.length,
          gcPercentage: (item.gc_content * 100).toFixed(2) + "%",
          status: item.annotated ? "Annotated" : "Pending",
          genome: item.genome,
          sequence: item.sequence,
        }));

        setGenes(transformedData);
        setTotalCount(data.count);
        setTotalPages(Math.ceil(data.count / ITEMS_PER_PAGE));
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchGenes();
  }, [currentPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Header with Stats */}
          <div className="rounded-2xl bg-white dark:bg-gray-800 border dark:border-gray-700 shadow-sm p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
                    Genes
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
                    Explore and analyze genetic sequences with comprehensive
                    genomic annotations and insights.
                  </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-4">
                  <div className="p-6 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-900/50 dark:to-indigo-800/30 border border-indigo-100/50 dark:border-indigo-700/20 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col">
                      <p className="text-sm font-medium text-indigo-600 dark:text-indigo-300">
                        Total Genes
                      </p>
                      <p className="mt-2 text-3xl font-semibold text-indigo-700 dark:text-indigo-200">
                        {totalCount.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/50 dark:to-emerald-800/30 border border-emerald-100/50 dark:border-emerald-700/20 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col">
                      <p className="text-sm font-medium text-emerald-600 dark:text-emerald-300">
                        Annotated
                      </p>
                      <p className="mt-2 text-3xl font-semibold text-emerald-700 dark:text-emerald-200">
                        {genes.filter((g) => g.status === "Annotated").length}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/50 dark:to-amber-800/30 border border-amber-100/50 dark:border-amber-700/20 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col">
                      <p className="text-sm font-medium text-amber-600 dark:text-amber-300">
                        Average Length
                      </p>
                      <p className="mt-2 text-3xl font-semibold text-amber-700 dark:text-amber-200">
                        {Math.round(
                          genes.reduce((acc, gene) => acc + gene.length, 0) /
                            Math.max(genes.length, 1)
                        ).toLocaleString()}
                        <span className="text-base ml-1">bp</span>
                      </p>
                    </div>
                  </div>

                  <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/50 dark:to-blue-800/30 border border-blue-100/50 dark:border-blue-700/20 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col">
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-300">
                        Avg GC Content
                      </p>
                      <p className="mt-2 text-3xl font-semibold text-blue-700 dark:text-blue-200">
                        {(
                          genes.reduce(
                            (acc, gene) => acc + parseFloat(gene.gcPercentage),
                            0
                          ) / Math.max(genes.length, 1)
                        ).toFixed(1)}
                        %
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <Button
                  className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                  onClick={() => {
                    /* Add gene upload handler */
                  }}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Gene
                </Button>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <SearchFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            sortBy={sortBy}
            onSortChange={setSortBy}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          {/* Loading and Error States */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4 animate-pulse">
                <Dna className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Loading genes...
              </h3>
            </div>
          ) : error ? (
            <Alert className="border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/20">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertDescription className="text-red-600 dark:text-red-400">
                {error}
              </AlertDescription>
            </Alert>
          ) : null}

          {/* Content Section */}
          {!loading && !error && (
            <>
              {filteredGenes.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                    <Database className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    No genes found
                  </h3>
                  <p className="mt-1 text-gray-500 dark:text-gray-400">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              ) : viewMode === "grid" ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredGenes.map((gene) => (
                    <GeneCard key={gene.id} gene={gene} />
                  ))}
                </div>
              ) : (
                <GeneListView genes={filteredGenes} />
              )}
            </>
          )}

          {/* Pagination Controls */}
          {!loading && !error && (
            <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
              <div className="flex items-center">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Showing{" "}
                  <span className="font-medium">
                    {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                  </span>{" "}
                  -{" "}
                  <span className="font-medium">
                    {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)}
                  </span>{" "}
                  of <span className="font-medium">{totalCount}</span> results
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
