"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  Database,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Grid,
  List,
  SlidersHorizontal,
  Dna,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FlickeringGrid } from "@/components/ui/flickering-grid";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PeptideCard from "@/components/peptides-card";
import PeptideList from "@/components/peptides-list";

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: RawPeptide[];
}

interface RawPeptide {
  name: string;
  header: string;
  sequence: string;
  length: number;
  gene: string;
}

interface Peptide {
  id: string;
  name: string;
  header: string;
  sequence: string;
  length: number;
  gene: string;
}

const SearchFilters = ({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
}) => (
  <Card className="bg-white dark:bg-gray-800 border border-indigo-100/20 dark:border-indigo-900/20">
    <CardContent className="p-6">
      <div className="flex flex-col lg:flex-row gap-4 items-stretch">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search peptides by name, gene, or sequence..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-white dark:bg-gray-700"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-[180px] bg-white dark:bg-gray-700">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="length">Length</SelectItem>
              <SelectItem value="gene">Gene</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => onViewModeChange("grid")}
              className="rounded-none rounded-l-md"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => onViewModeChange("list")}
              className="rounded-none rounded-r-md"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function PeptidesPage() {
  const [peptides, setPeptides] = useState<Peptide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const ITEMS_PER_PAGE = 12;

  // Filter and sort peptides
  const filteredPeptides = peptides
    .filter((peptide) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        peptide.name.toLowerCase().includes(searchLower) ||
        peptide.gene.toLowerCase().includes(searchLower) ||
        peptide.sequence.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "length":
          return a.length - b.length;
        case "gene":
          return a.gene.localeCompare(b.gene);
        default:
          return 0;
      }
    });

  // Calculate average sequence length
  const averageLength = peptides.length
    ? Math.round(
        peptides.reduce((acc, p) => acc + p.length, 0) / peptides.length
      )
    : 0;

  // Calculate unique genes count
  const uniqueGenes = new Set(peptides.map((p) => p.gene)).size;

  useEffect(() => {
    async function fetchPeptides() {
      setLoading(true);
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/data/api/peptide/?limit=${ITEMS_PER_PAGE}&offset=${
            (currentPage - 1) * ITEMS_PER_PAGE
          }`
        );
        if (!response.ok) {
          throw new Error(
            `Failed to fetch peptide data: ${response.status} ${response.statusText}`
          );
        }
        const data: PaginatedResponse = await response.json();

        const transformedData: Peptide[] = data.results.map((item) => ({
          id: item.name,
          name: item.name,
          header: item.header,
          sequence: item.sequence,
          length: item.length,
          gene: item.gene,
        }));

        setPeptides(transformedData);
        setTotalCount(data.count);
        setTotalPages(Math.ceil(data.count / ITEMS_PER_PAGE));
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPeptides();
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
          <div className="relative rounded-2xl bg-white dark:bg-gray-800 border dark:border-gray-700 shadow-sm overflow-hidden">
            {/* Flickering Grid Background */}
            <div className="absolute inset-0">
              <FlickeringGrid
                className="absolute inset-0 z-0 size-full"
                squareSize={4}
                gridGap={6}
                color="rgb(99, 102, 241)"
                maxOpacity={0.2}
                flickerChance={0.3}
                height={800}
                width={1500}
              />
            </div>
            <div className="relative z-10 p-6 lg:p-8">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
                      Peptides
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
                      Explore and analyze peptide sequences with comprehensive
                      annotations and insights.
                    </p>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-4">
                    <div className="p-6 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-900/50 dark:to-indigo-800/30 border border-indigo-100/50 dark:border-indigo-700/20 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex flex-col">
                        <p className="text-sm font-medium text-indigo-600 dark:text-indigo-300">
                          Total Peptides
                        </p>
                        <p className="mt-2 text-3xl font-semibold text-indigo-700 dark:text-indigo-200">
                          {totalCount.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="p-6 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/50 dark:to-emerald-800/30 border border-emerald-100/50 dark:border-emerald-700/20 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex flex-col">
                        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-300">
                          Unique Genes
                        </p>
                        <p className="mt-2 text-3xl font-semibold text-emerald-700 dark:text-emerald-200">
                          {uniqueGenes}
                        </p>
                      </div>
                    </div>

                    <div className="p-6 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/50 dark:to-amber-800/30 border border-amber-100/50 dark:border-amber-700/20 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex flex-col">
                        <p className="text-sm font-medium text-amber-600 dark:text-amber-300">
                          Average Length
                        </p>
                        <p className="mt-2 text-3xl font-semibold text-amber-700 dark:text-amber-200">
                          {averageLength}
                          <span className="text-base ml-1">aa</span>
                        </p>
                      </div>
                    </div>

                    <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/50 dark:to-blue-800/30 border border-blue-100/50 dark:border-blue-700/20 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex flex-col">
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-300">
                          Sequences
                        </p>
                        <p className="mt-2 text-3xl font-semibold text-blue-700 dark:text-blue-200">
                          {peptides.length}
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
                      /* Add peptide upload handler */
                    }}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Peptide
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <SearchFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
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
                Loading peptides...
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
              {filteredPeptides.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                    <Database className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    No peptides found
                  </h3>
                  <p className="mt-1 text-gray-500 dark:text-gray-400">
                    Try adjusting your search criteria
                  </p>
                </div>
              ) : viewMode === "grid" ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredPeptides.map((peptide) => (
                    <PeptideCard key={peptide.id} peptide={peptide} />
                  ))}
                </div>
              ) : (
                <PeptideList peptides={filteredPeptides} />
              )}

              {/* Pagination Controls */}
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
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
