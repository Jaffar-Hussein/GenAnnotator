"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Database,
  Edit,
  FileText,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Dna,
  Clock,
  Users,
  BarChart2,
  Layout,
  Info,
} from "lucide-react";
import useStatsStore from "@/store/useStatsStore";
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

import {  useEffect,  } from "react";
import RoleBasedContent from "@/components/role-based-dashboard";
import { useUser } from "@/store/useAuthStore";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface GenomeStats {
  genome: {
    count: number;
    average_length: number;
    total_nt: number;
    fully_annotated: number;
    in_progress: number;
    new: number;
    overview: Array<{
      genome: string;
      total: number;
      annotated: number;
      ratio: number;
    }>;
  };
  gene: {
    count: number;
    average_length: number;
    average_gc_content: number;
  };
  peptide: {
    count: number;
    average_length: number;
  };
  annotation: Array<{
    status: string;
    count: number;
    ratio: number;
  }>;
}

const defaultStats: GenomeStats = {
  genome: {
    count: 0,
    average_length: 0,
    total_nt: 0,
    fully_annotated: 0,
    in_progress: 0,
    new: 0,
    overview: [],
  },
  gene: {
    count: 0,
    average_length: 0,
    average_gc_content: 0,
  },
  peptide: {
    count: 0,
    average_length: 0,
  },
  annotation: [],
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
      stat: stats.genome.count,
      icon: Database,
      href: "/genomes",
      change: `${stats.genome.overview.length} ready to explore`,
      color: "bg-blue-500/10 text-blue-500",
    },
  ];

  const roleSpecificStats = {
    READER: [
      ...baseStats,
      {
        name: "Searchable Genes",
        stat: stats.gene.count,
        icon: Dna,
        href: "/genes",
        change: "Available for Exploration",
        color: "bg-indigo-500/10 text-indigo-500",
      },
      {
        name: "Validated Annotations",
        stat: stats.annotation.find((a) => a.status === "APPROVED")?.count || 0,
        icon: CheckCircle,
        href: "/annotations",
        change: "Verified sequences",
        color: "bg-green-500/10 text-green-500",
      },
      {
        name: "Pending Review",
        stat: stats.annotation.find((a) => a.status === "PENDING")?.count || 0,
        icon: Clock,
        href: "/pending",
        change: "Awaiting validation",
        color: "bg-yellow-500/10 text-yellow-500",
      },
    ],
    ANNOTATOR: [
      ...baseStats,
      {
        name: "Assignments",
        stat: stats.annotation.find((a) => a.status === "PENDING")?.count || 0,
        icon: FileText,
        href: "/assignments",
        change: "Awaiting review",
        color: "bg-purple-500/10 text-purple-500",
      },
      {
        name: "Completed",
        stat: stats.annotation.find((a) => a.status === "APPROVED")?.count || 0,
        icon: CheckCircle,
        href: "/completed",
        change: "Successfully validated",
        color: "bg-green-500/10 text-green-500",
      },
      {
        name: "Pending Review",
        stat: stats.annotation.find((a) => a.status === "ONGOING")?.count || 0,
        icon: Clock,
        href: "/review",
        change: "In progress",
        color: "bg-yellow-500/10 text-yellow-500",
      },
    ],
    VALIDATOR: [
      ...baseStats,
      {
        name: "Pending Validation",
        stat: stats.annotation.find((a) => a.status === "PENDING")?.count || 0,
        icon: AlertCircle,
        href: "/pending-validation",
        change: "Need review",
        color: "bg-yellow-500/10 text-yellow-500",
      },
      {
        name: "Validated Annotations",
        stat: stats.annotation.find((a) => a.status === "APPROVED")?.count || 0,
        icon: CheckCircle,
        href: "/validated",
        change: "Completed reviews",
        color: "bg-green-500/10 text-green-500",
      },
      {
        name: "Active Annotations",
        stat: stats.annotation.find((a) => a.status === "ONGOING")?.count || 0,
        icon: Users,
        href: "/annotators",
        change: "Currently in progress",
        color: "bg-blue-500/10 text-blue-500",
      },
    ],
    ADMIN: [
      ...baseStats,
      {
        name: "Active Projects",
        stat: stats.genome.in_progress,
        icon: Layout,
        href: "/projects",
        change: "Ongoing annotations",
        color: "bg-purple-500/10 text-purple-500",
      },
      {
        name: "System Status",
        stat: `${(
          (stats.genome.fully_annotated / stats.genome.count) *
          100
        ).toFixed(0)}%`,
        icon: BarChart2,
        href: "/status",
        change: "Overall completion",
        color: "bg-green-500/10 text-green-500",
      },
      {
        name: "Pending Approval",
        stat: stats.annotation.find((a) => a.status === "PENDING")?.count || 0,
        icon: AlertCircle,
        href: "/pending",
        change: "Needs attention",
        color: "bg-yellow-500/10 text-yellow-500",
      },
    ],
  };

  return roleSpecificStats[role] || roleSpecificStats.READER;
};

const GenomeProgressCard = ({ genomeStats = defaultStats }) => (
  <div className="space-y-6">
    {genomeStats.genome.overview.map((genome) => (
      <div key={genome.genome} className="space-y-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {genome.genome.replace(/_/g, " ")}
            </p>
            <Badge
              variant={
                genome.ratio >= 90
                  ? "success"
                  : genome.ratio >= 50
                  ? "warning"
                  : "secondary"
              }
            >
              {genome.ratio >= 90
                ? "Complete"
                : genome.ratio >= 50
                ? "In Progress"
                : "New"}
            </Badge>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {genome.ratio.toFixed(1)}%
          </span>
        </div>
        <Progress
          value={genome.ratio}
          className={`h-2 ${
            genome.ratio >= 90
              ? "bg-green-500"
              : genome.ratio >= 50
              ? "bg-yellow-500"
              : "bg-gray-200"
          }`}
        />
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <p>
            {genome.annotated} of {genome.total} genes annotated
          </p>
          <p>Average length: {(genome.ratio * 1000).toFixed(0)} bp</p>
        </div>
      </div>
    ))}
  </div>
);

const StatsCard = ({ item }) => (
  <Link href={item.href}>
    <Card className="hover:shadow-lg transition-all duration-200 group bg-white dark:bg-gray-800 border dark:border-gray-700">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div
            className={`rounded-full p-2.5 ${item.color} transition-all group-hover:scale-110 flex-shrink-0`}
          >
            <item.icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100">
              {item.name}
            </p>
            <div className="flex items-baseline gap-1.5">
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

const ProgressSection = ({ stats }) => {
  const progressSections = [
    {
      title: "Genome Completion",
      value: stats?.genome?.fully_annotated || 0,
      total: stats?.genome?.count || 0,
      percentage:
        stats?.genome?.count > 0
          ? Math.floor(
              (stats.genome.fully_annotated / stats.genome.count) * 100
            )
          : 0,
      tooltip: `${
        stats?.genome?.fully_annotated || 0
      } genomes fully annotated out of ${
        stats?.genome?.count || 0
      } total genomes`,
    },
    {
      title: "Gene Annotation",
      value:
        stats?.annotation?.find((a) => a.status === "APPROVED")?.count || 0,
      total: stats?.gene?.count || 0,
      percentage:
        stats?.annotation?.find((a) => a.status === "APPROVED")?.ratio || 0,
      tooltip: `${
        stats?.annotation?.find((a) => a.status === "APPROVED")?.count || 0
      } genes annotated out of ${stats?.gene?.count || 0} total genes`,
    },
    {
      title: "Peptide Processing",
      value: stats?.peptide?.count || 0,
      total: stats?.gene?.count || 0,
      percentage:
        stats?.annotation?.find((a) => a.status === "APPROVED")?.ratio || 0,
      tooltip: `Average peptide length: ${
        stats?.peptide?.average_length?.toFixed(1) || 0
      } amino acids`,
    },
  ];

  return (
    <div className="space-y-6">
      {progressSections.map((section) => (
        <div key={section.title} className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
              {section.title}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{section.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {section.percentage.toFixed(1)}%
            </span>
          </div>
          <div className="relative">
            <Progress
              value={section.percentage}
              className={`h-2 ${
                section.percentage > 80
                  ? "bg-green-500"
                  : section.percentage > 50
                  ? "bg-yellow-500"
                  : "bg-gray-200"
              }`}
            />
            {section.percentage > 80 && (
              <CheckCircle className="h-4 w-4 text-green-500 absolute -right-1 -top-1" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const { stats, isLoading, error, fetchStats } = useStatsStore();
  const user = useUser();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

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

  const dashboardStats = getDashboardStats(user?.role, stats || defaultStats);

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
                        <Link href="/gene-validation">
                          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm">
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Review Pending Annotations
                          </Button>
                        </Link>
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

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {isLoading
              ? Array(4)
                  .fill(null)
                  .map((_, index) => <LoadingCard key={index} />)
              : dashboardStats.map((item) => (
                  <StatsCard key={item.name} item={item} />
                ))}
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="lg:col-span-3">
              {user && <RoleBasedContent role={user?.role} />}
            </div>

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
                  <Link href={user.role === 'READER' ? '/genomes' : '/my-annotations'}>
                    <button className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-400 dark:hover:text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                      View All
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </Link>
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
                    <ProgressSection stats={stats || defaultStats} />
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
