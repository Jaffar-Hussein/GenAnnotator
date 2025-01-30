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
  FileCheckIcon,
  Dna,
  FileCheck2Icon,
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

const ValidatorDashboard = () => {
  const [pendingAnnotations, setPendingAnnotations] = useState([]);
  const [ongoingAnnotations, setOngoingAnnotations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const token = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user?.username);

  useEffect(() => {
    const fetchAnnotations = async () => {
      try {
        // Fetch both PENDING and ONGOING annotations
        const [pendingResponse, ongoingResponse] = await Promise.all([
          fetch(
            "http://127.0.0.1:8000/data/api/status/?status=PENDING&limit=3",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
          fetch(
            "http://127.0.0.1:8000/data/api/status/?status=ONGOING&limit=3",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
        ]);

        if (!pendingResponse.ok || !ongoingResponse.ok) {
          throw new Error("Failed to fetch annotations");
        }

        const pendingData = await pendingResponse.json();
        const ongoingData = await ongoingResponse.json();
        // removing my own annotations
        pendingData.results = pendingData.results.filter(
          (annotation) => annotation.annotator !== user
        );
        setPendingAnnotations(pendingData.results);
        setOngoingAnnotations(ongoingData.results);
      } catch (error) {
        console.error("Failed to fetch annotations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnnotations();
  }, [token]);

  const getStatusColor = (status) => {
    switch (status) {
      case "ONGOING":
        return "bg-yellow-500/10 text-yellow-500";
      case "PENDING":
        return "bg-blue-500/10 text-blue-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  const renderLoadingSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((index) => (
        <div
          key={index}
          className="h-20 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg"
        />
      ))}
    </div>
  );

  return (
    <div className="lg:col-span-3 space-y-6">
      <Link href="/gene-assignment" className="block">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border border-blue-100 dark:border-blue-900 rounded-lg p-4 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-full p-2 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
                <Dna className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium text-blue-900 dark:text-blue-100">
                  Manage Gene Assignments
                </h3>
                <p className="text-sm text-blue-600 dark:text-blue-300">
                  Distribute genes to available annotators across the platforms
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900"
            >
              Assign Genes <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Link>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pending Reviews Section */}
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
              <Link href="/gene-validation" passHref>
                <Button variant="outline" size="sm" className="gap-2">
                  View All <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              renderLoadingSkeleton()
            ) : (
              <div className="space-y-4">
                {pendingAnnotations.length > 0 ? (
                  pendingAnnotations.map((annotation) => (
                    <div
                      key={annotation.gene}
                      className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-slate-200 dark:border-gray-700"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`rounded-full p-2 ${getStatusColor(
                            "PENDING"
                          )}`}
                        >
                          <Dna className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium">
                            Gene {annotation.gene}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Submitted for review
                          </div>
                        </div>
                      </div>
                      <Link href="/gene-validation" passHref>
                        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm">
                          Review
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 px-4">
                    <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                      <FileCheck2Icon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div className="text-gray-900 dark:text-gray-100 font-medium mb-1">
                      All caught up!
                    </div>
                    <div className="text-gray-500 dark:text-gray-400 text-sm">
                      There are no annotations waiting for review. Check back
                      later or help assign new genes.
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ongoing Annotations Section */}
        <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all border dark:border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Your Annotations
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
              renderLoadingSkeleton()
            ) : (
              <div className="space-y-4">
                {ongoingAnnotations.length > 0 ? (
                  ongoingAnnotations.map((annotation) => (
                    <div
                      key={annotation.gene}
                      className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-slate-200 dark:border-gray-700"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`rounded-full p-2 ${getStatusColor(
                            "ONGOING"
                          )}`}
                        >
                          <Clock className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              You're annotating {annotation.gene}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            You last worked on this{" "}
                            {formatRelativeTime(annotation.updated_at)}
                          </div>
                        </div>
                      </div>
                      <Link href={`/annotate/${annotation.gene}`} passHref>
                        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm">
                          Continue
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 px-4">
                    <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                      <Database className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div className="text-gray-900 dark:text-gray-100 font-medium mb-1">
                      No annotations in progress
                    </div>
                    <div className="text-gray-500 dark:text-gray-400 text-sm">
                      Ready to contribute? Start annotating genes by picking one
                      from the available pool.
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const RoleDashboard = ({ role }) => {
  const dashboardComponents = {
    READER: <ReaderDashboard />,
    ANNOTATOR: <AnnotatorDashboard />,
    VALIDATOR: <ValidatorDashboard />,
  };

  return dashboardComponents[role] || null;
};

export default RoleDashboard;
