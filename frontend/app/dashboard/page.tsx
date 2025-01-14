"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  BarChart2,
  Database,
  Edit,
  FileText,
  ArrowRight,
  Bell,
  Clock,
  Users,
  Search,
  CheckCircle,
  AlertCircle,
  Dna,
  FileQuestion,
  FileCheck,
  Layout,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuthStore } from "@/store/useAuthStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { RoleBasedContent } from "@/components/role-based-dashboard";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface GenomeStats {
  genome_count: number;
  genome_fully_annotated_count: number;
  genome_waiting_annotated_count: number;
  genome_incomplete_annotated_count: number;
  gene_by_genome: Array<{
    genome: string;
    total: number;
    annotated: number;
  }>;
  gene_count: number;
  peptide_count: number;
  gene_annotation_count: number;
  peptide_annotation_count: number;
}

// Default empty stats object
const defaultStats: GenomeStats = {
  genome_count: 0,
  genome_fully_annotated_count: 0,
  genome_waiting_annotated_count: 0,
  genome_incomplete_annotated_count: 0,
  gene_by_genome: [],
  gene_count: 0,
  peptide_count: 0,
  gene_annotation_count: 0,
  peptide_annotation_count: 0,
};

const LoadingCard = () => (
  <Card className="hover:shadow-lg transition-all duration-200 overflow-hidden">
    <CardContent className="p-6 relative">
      <div className="flex items-center gap-4">
        <div className="rounded-lg p-2.5 bg-gray-100">
          <div className="w-6 h-6 bg-gray-200 animate-pulse rounded" />
        </div>
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-gray-200 animate-pulse rounded w-24" />
          <div className="h-6 bg-gray-200 animate-pulse rounded w-16" />
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent -translate-x-full animate-shimmer" />
    </CardContent>
  </Card>
);

const getDashboardStats = (role: string, stats: GenomeStats = defaultStats) => {
  const baseStats = [
    {
      name: "Total Genomes",
      stat: stats.genome_count,
      icon: Database,
      href: "/genomes",
      change: `${stats.genome_fully_annotated_count} fully annotated`,
      color: "bg-blue-500/10 text-blue-500",
    },
    {
      name: "Total Genes",
      stat: stats.gene_count,
      icon: Dna,
      href: "/genes",
      change: `${
        stats.gene_count > 0
          ? ((stats.gene_annotation_count / stats.gene_count) * 100).toFixed(1)
          : 0
      }% annotated`,
      color: "bg-indigo-500/10 text-indigo-500",
    },
  ];

  const roleSpecificStats = {
    READER: [
      ...baseStats,
      {
        name: "Peptide Count",
        stat: stats.peptide_count,
        icon: FileText,
        href: "/peptides",
        change: `${
          stats.peptide_count > 0
            ? (
                (stats.peptide_annotation_count / stats.peptide_count) *
                100
              ).toFixed(1)
            : 0
        }% annotated`,
        color: "bg-violet-500/10 text-violet-500",
      },
    ],
    ANNOTATOR: [
      ...baseStats,
      {
        name: "Pending Annotations",
        stat: stats.genome_waiting_annotated_count,
        icon: FileQuestion,
        href: "/pending",
        change: "Waiting for annotation",
        color: "bg-yellow-500/10 text-yellow-500",
      },
      {
        name: "Completed Annotations",
        stat: stats.gene_annotation_count,
        icon: FileCheck,
        href: "/completed",
        change: `${
          stats.gene_count > 0
            ? ((stats.gene_annotation_count / stats.gene_count) * 100).toFixed(
                1
              )
            : 0
        }% of total`,
        color: "bg-green-500/10 text-green-500",
      },
    ],
    VALIDATOR: [
      ...baseStats,
      {
        name: "Pending Review",
        stat: stats.genome_waiting_annotated_count,
        icon: AlertCircle,
        href: "/review",
        change: "Needs validation",
        color: "bg-yellow-500/10 text-yellow-500",
      },
      {
        name: "Validated Genomes",
        stat: stats.genome_fully_annotated_count,
        icon: CheckCircle,
        href: "/validated",
        change: `${
          stats.genome_count > 0
            ? (
                (stats.genome_fully_annotated_count / stats.genome_count) *
                100
              ).toFixed(1)
            : 0
        }% complete`,
        color: "bg-green-500/10 text-green-500",
      },
    ],
    ADMIN: [
      ...baseStats,
      {
        name: "Pending Annotations",
        stat: stats.genome_waiting_annotated_count,
        icon: FileQuestion,
        href: "/pending",
        change: "Requires attention",
        color: "bg-yellow-500/10 text-yellow-500",
      },
      {
        name: "Complete Genomes",
        stat: stats.genome_fully_annotated_count,
        icon: CheckCircle,
        href: "/complete",
        change: `${
          stats.genome_count > 0
            ? (
                (stats.genome_fully_annotated_count / stats.genome_count) *
                100
              ).toFixed(1)
            : 0
        }% of total`,
        color: "bg-green-500/10 text-green-500",
      },
    ],
  };

  return roleSpecificStats[role] || roleSpecificStats.READER;
};

const GenomeProgressCard = ({ genomeStats = defaultStats }) => (
  <div className="space-y-6">
    {genomeStats.gene_by_genome.map((genome) => (
      <div key={genome.genome} className="space-y-2">
        <div className="flex justify-between items-center">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {genome.genome.replace(/_/g, ' ')}
          </p>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {genome.total > 0 ? ((genome.annotated / genome.total) * 100).toFixed(1) : 0}%
          </span>
        </div>
        <Progress 
          value={genome.total > 0 ? (genome.annotated / genome.total) * 100 : 0} 
          className="h-2 " 
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {genome.annotated} of {genome.total} genes annotated
        </p>
      </div>
    ))}
  </div>
);

const StatsCard = ({ item }) => (
  <Link href={item.href}>
    <Card className="hover:shadow-lg transition-all duration-200 group bg-white dark:bg-gray-800 border dark:border-gray-700">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div
            className={`rounded-full p-3 ${item.color} transition-all group-hover:scale-110`}
          >
            <item.icon className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100">
              {item.name}
            </p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {item.stat}
              </h3>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {item.change}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </Link>
);

const ProgressSection = ({ title, value, total, percentage }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
    <span className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
        {title}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p>{`${value} out of ${total} complete`}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </span>
      <span className="text-sm text-gray-500 dark:text-gray-400">{percentage}%</span>
    </div>
    <div className="relative">
      <Progress 
        value={percentage} 
        className="h-2 " 
      />
      {percentage > 80 && (
        <CheckCircle className="h-4 w-4 text-green-500 absolute -right-1 -top-1" />
      )}
    </div>
  </div>
);

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const [stats, setStats] = useState<GenomeStats>();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    // Fetch stats
    const fetchStats = async () => {
      try {
        const response = await fetch(`${backendUrl}/data/api/stats/`);
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96 p-6">
          <CardContent className="text-center space-y-4">
            <Layout className="h-12 w-12 mx-auto text-muted-foreground" />
            <h2 className="text-xl font-semibold">Loading Dashboard</h2>
            <Progress className="w-full" value={100} />
          </CardContent>
        </Card>
      </div>
    );
  }

  const dashboardStats = getDashboardStats(user.role, stats || defaultStats);

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 transition-colors duration-200">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Enhanced Welcome Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border dark:border-gray-700">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
                  Genome Annotation Dashboard
                </h1>
                <p className="text-muted-foreground dark:text-gray-400 mt-1">
                  Welcome back, {`${user.first_name} ${user.last_name}`} •{" "}
                  {user.role.toLowerCase()}
                </p>
              </div>
              <div className="flex gap-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Bell className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Notifications</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {user.role === "ANNOTATOR" && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm">
                          <Edit className="mr-2 h-4 w-4" />
                          Start New Annotation
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Begin a new genome annotation</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                {user.role === "VALIDATOR" && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm">
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Review Pending Annotations
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Review pending annotation requests</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Stats Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {isLoading
              ? Array(4)
                  .fill(null)
                  .map((_, index) => <LoadingCard key={index} />)
              : dashboardStats.map((item) => (
                  <StatsCard key={item.name} item={item} />
                ))}
          </div>

          {/* Enhanced Role Content Sections */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* <div className="lg:col-span-3">
              {user && <RoleBasedContent role={user?.role} />}
            </div> */}

            {/* Enhanced Progress Cards */}
            <Card className="lg:col-span-2 shadow-sm hover:shadow-md transition-all bg-white dark:bg-gray-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Genome Annotation Progress
                      <Badge variant="secondary" className="ml-2">
                        Active
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-gray-500 dark:text-gray-400">
                      Current status of genome annotations
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" className="gap-2">
                    View All <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {Array(3)
                      .fill(null)
                      .map((_, index) => (
                        <div key={index} className="space-y-2">
                          <div className="h-4 bg-gray-200 animate-pulse rounded w-full" />
                          <div className="h-2 bg-gray-200 animate-pulse rounded w-full" />
                          <div className="h-4 bg-gray-200 animate-pulse rounded w-1/3" />
                        </div>
                      ))}
                  </div>
                ) : (
                  <GenomeProgressCard genomeStats={stats || defaultStats} />
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm hover:shadow-md transition-all bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle>Overall Progress</CardTitle>
                <CardDescription>Annotation completion status</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-6">
                    {Array(3)
                      .fill(null)
                      .map((_, index) => (
                        <div key={index} className="space-y-2">
                          <div className="h-4 bg-gray-200 animate-pulse rounded w-full" />
                          <div className="h-2 bg-gray-200 animate-pulse rounded w-full" />
                        </div>
                      ))}
                  </div>
                ) : (
                    <div className="space-y-6">
                    {/* Enhanced Progress Sections */}
                    <ProgressSection
                      title="Genome Completion"
                      value={stats?.genome_fully_annotated_count || 0}
                      total={stats?.genome_count || 0}
                      percentage={
                      stats?.genome_count > 0
                        ? Math.floor(
                          (stats.genome_fully_annotated_count /
                          stats.genome_count) *
                          100
                        )
                        : 0
                      }
                    />
                    <ProgressSection
                      title="Gene Annotation"
                      value={stats?.gene_annotation_count || 0}
                      total={stats?.gene_count || 0}
                      percentage={
                      stats?.gene_count > 0
                        ? Math.floor(
                          (stats.gene_annotation_count / stats.gene_count) *
                          100
                        )
                        : 0
                      }
                    />
                    <ProgressSection
                      title="Peptide Annotation"
                      value={stats?.peptide_annotation_count || 0}
                      total={stats?.peptide_count || 0}
                      percentage={
                      stats?.peptide_count > 0
                        ? Math.floor(
                          (stats.peptide_annotation_count /
                          stats.peptide_count) *
                          100
                        )
                        : 0
                      }
                    />
                    </div>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
