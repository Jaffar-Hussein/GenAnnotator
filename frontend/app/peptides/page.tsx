"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  Grid,
  List,
  SlidersHorizontal,
  Database,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

interface Peptide {
  name: string;
  header: string;
  sequence: string;
  length: number;
  gene: string;
}

import PeptideCard from '@/components/peptides-card';

const PeptideListView = ({ peptides }: { peptides: Peptide[] }) => (
  <div className="space-y-4">
    {peptides.map((peptide) => (
      <Card key={peptide.name} className="hover:shadow-md transition-all duration-300">
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h3 className="font-medium">{peptide.name}</h3>
              <p className="text-sm text-gray-500">{peptide.gene}</p>
              <p className="text-sm font-mono">{peptide.sequence}</p>
            </div>
            <Badge variant="outline">{peptide.length} aa</Badge>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

export default function Peptides() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("name");
  const [peptides, setPeptides] = useState<Peptide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPeptides() {
      setLoading(true);
      try {
        const response = await fetch('http://127.0.0.1:8000/data/api/peptide/?limit=10');
        if (!response.ok) {
          throw new Error(`Failed to fetch peptide data: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        setPeptides(data.results);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPeptides();
  }, []);

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
        default:
          return 0;
      }
    });

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
            <div className="space-y-4">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
                  Peptides
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
                  Comprehensive peptide sequence database and analysis platform.
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-4">
                <div className="p-6 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-900/50 dark:to-indigo-800/30 border border-indigo-100/50 dark:border-indigo-700/20">
                  <div className="flex flex-col">
                    <p className="text-sm font-medium text-indigo-600 dark:text-indigo-300">
                      Total Peptides
                    </p>
                    <p className="mt-2 text-3xl font-semibold text-indigo-700 dark:text-indigo-200">
                      {peptides.length}
                    </p>
                  </div>
                </div>

                <div className="p-6 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/50 dark:to-emerald-800/30 border border-emerald-100/50 dark:border-emerald-700/20">
                  <div className="flex flex-col">
                    <p className="text-sm font-medium text-emerald-600 dark:text-emerald-300">
                      Average Length
                    </p>
                    <p className="mt-2 text-3xl font-semibold text-emerald-700 dark:text-emerald-200">
                      {peptides.length > 0
                        ? Math.round(
                            peptides.reduce((acc, p) => acc + p.length, 0) / peptides.length
                          )
                        : 0}
                    </p>
                  </div>
                </div>

                <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/50 dark:to-blue-800/30 border border-blue-100/50 dark:border-blue-700/20">
                  <div className="flex flex-col">
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-300">
                      Unique Genes
                    </p>
                    <p className="mt-2 text-3xl font-semibold text-blue-700 dark:text-blue-200">
                      {new Set(peptides.map(p => p.gene)).size}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search & Filters */}
          <Card className="bg-white dark:bg-gray-800 border border-indigo-100/20 dark:border-indigo-900/20">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-stretch">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search by name, gene, or sequence..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-white dark:bg-gray-700"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px] bg-white dark:bg-gray-700">
                      <SlidersHorizontal className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="length">Length</SelectItem>
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

          {/* Content */}
          {loading ? (
            <div className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="border-indigo-100/20 dark:border-indigo-900/20">
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
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-2/3" />
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
          ) : filteredPeptides.length === 0 ? (
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
                <PeptideCard key={peptide.name} peptide={peptide} />
              ))}
            </div>
          ) : (
            <PeptideListView peptides={filteredPeptides} />
          )}
        </motion.div>
      </div>
    </div>
  );
}