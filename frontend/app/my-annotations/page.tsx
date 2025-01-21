'use client';
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Clock, ClipboardCheck, AlertCircle, RefreshCcw, Inbox, Dna } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAssignments } from "@/hooks/useAnnotations";

const EmptyState = ({ message, icon: Icon }) => (
  <div className="text-center py-12">
    <div className="flex justify-center">
      <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-gray-700 flex items-center justify-center">
        <Icon className="h-6 w-6 text-slate-400 dark:text-slate-500" />
      </div>
    </div>
    <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-white">No assignments found</h3>
    <p className="mt-2 text-slate-500 dark:text-slate-400">{message}</p>
  </div>
);

const ErrorAlert = ({ error, onRetry, isNetworkError }) => (
  <Alert variant="destructive" className="mb-6">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Error Loading Assignments</AlertTitle>
    <AlertDescription className="flex items-center justify-between">
      <span>{error}</span>
      {isNetworkError && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRetry} 
          className="ml-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-violet-600 dark:hover:text-violet-400"
        >
          <RefreshCcw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      )}
    </AlertDescription>
  </Alert>
);

const AnnotationDashboard = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const router = useRouter();
  const { 
    assignments, 
    loading, 
    error, 
    networkError,
    refetchAssignments,
    hasAssignments 
  } = useAssignments();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status) => {
    const colors = {
      ONGOING: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300",
      SUBMITTED: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300",
      VALIDATED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
      REJECTED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    };
    return colors[status] || "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300";
  };

  const startAnnotation = (gene) => {
    router.push(`/annotate/${gene}`);
  };

  const pendingAssignments = assignments.filter(a => a.status === "ONGOING");
  const submittedAssignments = assignments.filter(a => a.status === "PENDING");

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto p-6 max-w-7xl">
          <ErrorAlert 
            error={error} 
            onRetry={refetchAssignments} 
            isNetworkError={networkError}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="h-8 w-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
              <Dna className="h-5 w-5 text-violet-500 dark:text-violet-400" />
            </div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
              My Annotations Dashboard
            </h1>
          </div>
          <p className="mt-2 text-slate-600 dark:text-slate-400 ml-11">
            Manage your assigned sequences and annotations
          </p>
        </div>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 border border-slate-200/60 dark:border-gray-700/60">
            <TabsTrigger value="pending" className="data-[state=active]:bg-violet-100/50 dark:data-[state=active]:bg-violet-900/30">
              Pending Assignments
              {pendingAssignments.length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-800 dark:text-violet-300">
                  {pendingAssignments.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="submitted" className="data-[state=active]:bg-violet-100/50 dark:data-[state=active]:bg-violet-900/30">
              Submitted for Validation
              {submittedAssignments.length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-800 dark:text-violet-300">
                  {submittedAssignments.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card className="border border-slate-200/60 dark:border-gray-700/60 shadow-sm">
              <CardContent className="p-6 bg-gradient-to-r from-slate-50/50 to-white dark:from-gray-800 dark:to-gray-800/50">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                    Sequences Awaiting Annotation
                  </h2>
                  {hasAssignments && (
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {pendingAssignments.length} assignments pending
                    </span>
                  )}
                </div>

                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-violet-500 dark:text-violet-400" />
                  </div>
                ) : !hasAssignments ? (
                  <EmptyState 
                    message="You currently have no pending assignments."
                    icon={Inbox}
                  />
                ) : pendingAssignments.length === 0 ? (
                  <EmptyState 
                    message="All your assignments have been submitted."
                    icon={ClipboardCheck}
                  />
                ) : (
                  <div className="space-y-4">
                    {pendingAssignments.map((assignment) => (
                      <div
                        key={assignment.gene}
                        className="rounded-lg border border-slate-200/60 dark:border-gray-700/60 bg-white dark:bg-gray-800 p-4 hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                              Gene: {assignment.gene}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                Assigned: {formatDate(assignment.created_at)}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-3 items-center">
                            <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(assignment.status)}`}>
                              {assignment.status}
                            </span>
                            <Button
                              onClick={() => startAnnotation(assignment.gene)}
                              className="flex items-center gap-2 bg-violet-500 hover:bg-violet-600 dark:bg-violet-600 dark:hover:bg-violet-500 text-white"
                            >
                              <ClipboardCheck className="h-4 w-4" />
                              Start Annotation
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="submitted">
            <Card className="border border-slate-200/60 dark:border-gray-700/60 shadow-sm">
              <CardContent className="p-6 bg-gradient-to-r from-slate-50/50 to-white dark:from-gray-800 dark:to-gray-800/50">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                    Annotations Under Review
                  </h2>
                </div>

                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-violet-500 dark:text-violet-400" />
                  </div>
                ) : !hasAssignments ? (
                  <EmptyState 
                    message="You haven't received any assignments yet."
                    icon={Inbox}
                  />
                ) : submittedAssignments.length === 0 ? (
                  <EmptyState 
                    message="You haven't submitted any assignments for review yet."
                    icon={Clock}
                  />
                ) : (
                  <div className="space-y-4">
                    {submittedAssignments.map((assignment) => (
                      <div
                        key={assignment.gene}
                        className="rounded-lg border border-slate-200/60 dark:border-gray-700/60 bg-white dark:bg-gray-800 p-4 hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                              Gene: {assignment.gene}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                Submitted: {formatDate(assignment.updated_at)}
                              </div>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(assignment.status)}`}>
                            {assignment.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AnnotationDashboard;