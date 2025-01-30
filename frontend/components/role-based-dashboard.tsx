import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  ExternalLink,
  Search,
  Zap,
  Clock,
  MoveUpRight,
  ArrowRight,
  FileCheck,
  Database,
  Dna,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { format } from "path";
import { formatRelativeTime } from "@/lib/utils";

const ReaderDashboard = () => (
  <div className="lg:col-span-3 space-y-6">
    <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all border dark:border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Quick Actions
              <Badge
                variant="secondary"
                className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-0"
              >
                New
              </Badge>
            </CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              Access commonly used features
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <Button
          variant="outline"
          className="justify-start h-auto py-4 bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-full p-2 bg-blue-500/10 text-blue-500">
              <Search className="h-4 w-4" />
            </div>
            <div className="text-left">
              <div className="font-semibold">Sequence Search</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Search genome sequences
              </div>
            </div>
          </div>
        </Button>

        <Button
          variant="outline"
          className="justify-start h-auto py-4 bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-full p-2 bg-indigo-500/10 text-indigo-500">
              <Download className="h-4 w-4" />
            </div>
            <div className="text-left">
              <div className="font-semibold">Export Data</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Download selected data
              </div>
            </div>
          </div>
        </Button>

        <Button
          variant="outline"
          className="justify-start h-auto py-4 bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-full p-2 bg-yellow-500/10 text-yellow-500">
              <Zap className="h-4 w-4" />
            </div>
            <div className="text-left">
              <div className="font-semibold">BLAST Search</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Find similar sequences
              </div>
            </div>
          </div>
        </Button>

        <Button
          variant="outline"
          className="justify-start h-auto py-4 bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-full p-2 bg-green-500/10 text-green-500">
              <ExternalLink className="h-4 w-4" />
            </div>
            <div className="text-left">
              <div className="font-semibold">External Search</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Search external databases
              </div>
            </div>
          </div>
        </Button>
      </CardContent>
    </Card>
  </div>
);

const MyAnnotations = ({ data = [] }) => {
  const token = useAuthStore((state) => state.token);

  const getStatusColor = (status) => {
    switch (status) {
      case "ONGOING":
        return "bg-yellow-500/10 text-yellow-500";
      case "PENDING":
        return "bg-blue-500/10 text-blue-500";
      case "APPROVED":
        return "bg-green-500/10 text-green-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  return (
    <div className="space-y-4">
      {data.map((annotation) => (
        <div
          key={annotation.gene}
          className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-slate-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-4">
            <div
              className={`rounded-full p-2 ${getStatusColor(
                annotation.status
              )}`}
            >
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  You're working on {annotation.gene}
                </span>
                <Badge variant="outline" className="text-xs">
                  {annotation.status.toLowerCase()}
                </Badge>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                You last worked on this{" "}
                {formatRelativeTime(annotation.updated_at)}
              </div>
            </div>
          </div>
          <Link href={`/annotate/${annotation.gene}`} passHref>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm">
              Continue Working
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      ))}
      {data.length === 0 && (
        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
          You don't have any annotations in progress
        </div>
      )}
    </div>
  );
};

const AnnotatorDashboard = () => {
  const [pendingAnnotations, setPendingAnnotations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const token = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    const fetchAnnotations = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/data/api/status/?status=ONGOING&limit=3",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch annotations");
        const data = await response.json();
        setPendingAnnotations(data.results);
      } catch (error) {
        console.error("Failed to fetch annotations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnnotations();
  }, [token]);

  return (
    <div className="lg:col-span-3 space-y-6">
      <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all border dark:border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                In Progress
                <Badge
                  variant="secondary"
                  className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-0"
                >
                  Ongoing
                </Badge>
              </CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">
                Continue your active annotations
              </CardDescription>
            </div>
            <Link href="/my-annotations" passHref>
              <Button variant="outline" size="sm" className="gap-2">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((index) => (
                <div
                  key={index}
                  className="h-20 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg"
                />
              ))}
            </div>
          ) : (
            <MyAnnotations data={pendingAnnotations} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const ValidatorDashboard = () => (
  <div className="lg:col-span-3 space-y-6">
    <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all border dark:border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Pending Reviews
              <Badge
                variant="secondary"
                className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-0"
              >
                Priority
              </Badge>
            </CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              Annotations awaiting validation
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-slate-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="rounded-full p-2 bg-indigo-500/10 text-indigo-500">
              <Dna className="h-4 w-4" />
            </div>
            <div>
              <div className="font-medium">Gene DEF456</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Submitted for review
              </div>
            </div>
          </div>
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm">
            Review
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
);

const RoleDashboard = ({ role }) => {
  const dashboardComponents = {
    READER: <ReaderDashboard />,
    ANNOTATOR: <AnnotatorDashboard />,
    VALIDATOR: <ValidatorDashboard />,
  };

  return dashboardComponents[role] || null;
};

export default RoleDashboard;
