"use client";

import { useState, useEffect, use } from "react";
import { motion } from "framer-motion";
import { FlickeringGrid } from "@/components/ui/flickering-grid";
import {
  Search,
  Filter,
  Grid,
  List,
  SlidersHorizontal,
  Database,
  AlertCircle,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import GenomeCard from "@/components/genome-card";
import GenomeListView from "@/components/genome-list";
import UploadGenomeModal from "@/components/ui/genome-upload";
import  useStatsStore  from "@/store/useStatsStore";

interface RawGenome {
  name: string;
  species: string;
  description: string;
  header: string;
  length: number;
  gc_content: number;
  annotation: boolean;
  sequence: string;
}

/**
 * Transformed Genome object for the UI
 */
interface Genome {
  id: string;
  name: string;
  species: string;
  strain: string;
  basePairs: number;
  gcPercentage: string;
  coverage: string;
  status: string;
  completeness: string;
  header: string;
  lastModified: string;
  sequence: string;
}

export default function Genomes() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [genomes, setGenomes] = useState<Genome[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const { stats, isLoading, fetchStats } = useStatsStore();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  useEffect(() => {
    fetchStats();
  } , [fetchStats,refreshTrigger]);

  // Fetch Genomes
  useEffect(() => {
    async function fetchGenomes() {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      setLoading(true);
      try {
        const response = await fetch(`${backendUrl}/data/api/genome/?all=true`);
        if (!response.ok) {
          throw new Error(
            `Failed to fetch genome data: ${response.status} ${response.statusText}`
          );
        }
        const data: RawGenome[] = await response.json();

        const transformedData: Genome[] = data.map((item) => ({
          id: item.name,
          name: item.name,
          species: item.species,
          strain: item.description || "Unknown",
          basePairs: item.length,
          gcPercentage: (item.gc_content * 100).toFixed(2) + "%",
          coverage: item.annotation ? "Full Coverage" : "No Coverage",
          status: item.annotation ? "Annotated" : "Pending",
          completeness: item.annotation ? "100%" : "0%",
          header: item.header,
          lastModified: "N/A", 
          sequence: item.sequence,
        }));

        setGenomes(transformedData);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchGenomes();
  }, [refreshTrigger]);

  // Filter & Sort
  const filteredGenomes = genomes
    .filter((genome) => {
      const matchesSearch =
        genome.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        genome.species.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ||
        genome.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "size":
          return a.basePairs - b.basePairs;
        default:
          return 0;
      }
    });

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-5 dark:from-gray-800 dark:to-gray-900">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Scientific Header with Stats */}
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

              {/* Content */}
              <div className="relative z-10 p-6 lg:p-8">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
                        Genomes
                      </h1>
                      <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
                        Advanced genomic data analysis platform with
                        comprehensive annotation tools.
                      </p>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-4">
                      <div className="p-6 rounded-xl bg-gradient-to-br from-indigo-50/90 to-indigo-100/80 dark:from-indigo-900/90 dark:to-indigo-800/80 backdrop-blur-sm border border-indigo-100/50 dark:border-indigo-700/20 shadow-sm hover:shadow-md transition-all">
                        <div className="flex flex-col">
                          <p className="text-sm font-medium text-indigo-600 dark:text-indigo-300">
                            Total Genomes
                          </p>
                          <p className="mt-2 text-3xl font-semibold text-indigo-700 dark:text-indigo-200">
                          {stats?.genome.count || 0}
                          </p>
                        </div>
                      </div>

                      <div className="p-6 rounded-xl bg-gradient-to-br from-emerald-50/90 to-emerald-100/80 dark:from-emerald-900/90 dark:to-emerald-800/80 backdrop-blur-sm border border-emerald-100/50 dark:border-emerald-700/20 shadow-sm hover:shadow-md transition-all">
                        <div className="flex flex-col">
                          <p className="text-sm font-medium text-emerald-600 dark:text-emerald-300">
                            Annotated
                          </p>
                          <p className="mt-2 text-3xl font-semibold text-emerald-700 dark:text-emerald-200">
                          {stats?.genome.fully_annotated || 0}
                          </p>
                        </div>
                      </div>

                      <div className="p-6 rounded-xl bg-gradient-to-br from-amber-50/90 to-amber-100/80 dark:from-amber-900/90 dark:to-amber-800/80 backdrop-blur-sm border border-amber-100/50 dark:border-amber-700/20 shadow-sm hover:shadow-md transition-all">
                        <div className="flex flex-col">
                          <p className="text-sm font-medium text-amber-600 dark:text-amber-300">
                            Pending
                          </p>
                          <p className="mt-2 text-3xl font-semibold text-amber-700 dark:text-amber-200">
                          {(stats?.genome?.count ?? 0) - (stats?.genome?.fully_annotated ?? 0)}
                          </p>
                        </div>
                      </div>

                      <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50/90 to-blue-100/80 dark:from-blue-900/90 dark:to-blue-800/80 backdrop-blur-sm border border-blue-100/50 dark:border-blue-700/20 shadow-sm hover:shadow-md transition-all">
                        <div className="flex flex-col">
                          <p className="text-sm font-medium text-blue-600 dark:text-blue-300">
                            Total Base Pairs
                          </p>
                          <p className="mt-2 text-3xl font-semibold text-blue-700 dark:text-blue-200">
                          {((stats?.genome.total_nt || 0) / 1e6).toFixed(1)}M
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3">
                    <Button
                      className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                      onClick={() => setIsUploadModalOpen(true)}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Genome
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Search & Filters  */}
            <Card className="bg-white dark:bg-gray-800 border border-indigo-100/20 dark:border-indigo-900/20 shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4 items-stretch">
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search by name, species, or strain..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-900 w-full"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 lg:w-auto">
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="w-[180px] bg-white dark:bg-gray-700">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="annotated">Annotated</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[180px] bg-white dark:bg-gray-700">
                        <SlidersHorizontal className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="size">Base Pairs</SelectItem>
                        <SelectItem value="gc">GC Content</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex items-center rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700">
                      <Button
                        variant={viewMode === "grid" ? "secondary" : "ghost"}
                        size="icon"
                        onClick={() => setViewMode("grid")}
                        className="rounded-none rounded-l-md"
                      >
                        <Grid className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === "list" ? "secondary" : "ghost"}
                        size="icon"
                        onClick={() => setViewMode("list")}
                        className="rounded-none rounded-r-md"
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Loading State */}
            {loading ? (
              <div className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card
                      key={i}
                      className="border-indigo-100/20 dark:border-indigo-900/20 hover:shadow-lg transition-all duration-300"
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                          </div>
                          <Skeleton className="h-5 w-12 rounded-full" />
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Skeleton className="h-3 w-1/2" />
                        <Skeleton className="h-3 w-1/3" />
                        <Skeleton className="h-3 w-2/3" />
                        <Skeleton className="h-3 w-1/2" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : error ? (
              <Alert className="border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/20">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <AlertDescription className="text-red-600 dark:text-red-400">
                  {error}
                </AlertDescription>
              </Alert>
            ) : filteredGenomes.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                  <Database className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  No genomes found
                </h3>
                <p className="mt-1 text-gray-500 dark:text-gray-400">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredGenomes.map((genome) => (
                  <GenomeCard key={genome.id} genome={genome} />
                ))}
              </div>
            ) : (
              <GenomeListView genomes={filteredGenomes} />
            )}
          </motion.div>
        </div>
      </div>
      <UploadGenomeModal
        open={isUploadModalOpen}
        onOpenChange={setIsUploadModalOpen}
        onSuccess={() => {
          setRefreshTrigger(prev => prev + 1);
        }}
      />
    </>
  );
}
