'use client';
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Clock, ClipboardCheck, AlertCircle, RefreshCcw, Inbox, Dna } from "lucide-react";
import Link from "next/link";
import { useAssignments } from "@/hooks/useAnnotations";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
const EmptyState = ({ message, icon: Icon }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="text-center py-12"
  >
    <div className="flex justify-center">
      <motion.div 
        whileHover={{ scale: 1.1 }}
        className="h-12 w-12 rounded-full bg-slate-100 dark:bg-gray-700 flex items-center justify-center"
      >
        <Icon className="h-6 w-6 text-slate-400 dark:text-slate-500" />
      </motion.div>
    </div>
    <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-white">No assignments found</h3>
    <p className="mt-2 text-slate-500 dark:text-slate-400">{message}</p>
  </motion.div>
);

const ErrorAlert = ({ error, onRetry, isNetworkError }) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error Loading Assignments</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>{error}</span>
        {isNetworkError && (
          <button 
            onClick={onRetry} 
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ml-4"
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Retry
          </button>
        )}
      </AlertDescription>
    </Alert>
  </motion.div>
);

const AnnotationCard = ({ assignment, formatDate, getStatusColor, showActionButton }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.01 }}
    transition={{ duration: 0.2 }}
    className="rounded-lg border border-slate-200/60 dark:border-gray-700/60 bg-white dark:bg-gray-800 p-4"
  >
    <div className="flex justify-between items-start">
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-slate-900 dark:text-white">
          Gene: {assignment.gene}
        </h3>
        <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {showActionButton ? `Assigned: ${formatDate(assignment.created_at)}` : `Submitted: ${formatDate(assignment.updated_at)}`}
          </div>
        </div>
      </div>
      <div className="flex gap-3 items-center">
        <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(assignment.status)}`}>
          {assignment.status}
        </span>
        {showActionButton && (
          <Link
            href={`/annotate/${assignment.gene}`}
            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-violet-500 hover:bg-violet-600 dark:bg-violet-600 dark:hover:bg-violet-500 transition-colors"
          >
            <ClipboardCheck className="h-4 w-4 mr-2" />
            Start Annotation
          </Link>
        )}
      </div>
    </div>
  </motion.div>
);

const AnnotationDashboard = () => {

  // At the top of your AnnotationDashboard component
const store = useAuthStore.getState();
console.log('Dashboard Auth State:', {
  isAuthenticated: store.isAuthenticated,
  hasUser: !!store.user,
  hasToken: !!store.accessToken
});
  const [activeTab, setActiveTab] = useState("pending");
  
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
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-3 mb-2">
            <motion.div 
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="h-8 w-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center"
            >
              <Dna className="h-5 w-5 text-violet-500 dark:text-violet-400" />
            </motion.div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
              My Annotations Dashboard
            </h1>
          </div>
          <p className="mt-2 text-slate-600 dark:text-slate-400 ml-11">
            Manage your assigned sequences and annotations
          </p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 border border-slate-200/60 dark:border-gray-700/60">
            <TabsTrigger value="pending" className="data-[state=active]:bg-violet-100/50 dark:data-[state=active]:bg-violet-900/30">
              Pending Assignments
              {pendingAssignments.length > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-2 px-2 py-0.5 text-xs rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-800 dark:text-violet-300"
                >
                  {pendingAssignments.length}
                </motion.span>
              )}
            </TabsTrigger>
            <TabsTrigger value="submitted" className="data-[state=active]:bg-violet-100/50 dark:data-[state=active]:bg-violet-900/30">
              Submitted for Validation
              {submittedAssignments.length > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-2 px-2 py-0.5 text-xs rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-800 dark:text-violet-300"
                >
                  {submittedAssignments.length}
                </motion.span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card className="border border-slate-200/60 dark:border-gray-700/60 shadow-sm">
              <CardContent className="p-6  bg-white/80  dark:bg-gray-800/90">
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
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-center py-8"
                  >
                    <Loader2 className="h-8 w-8 animate-spin text-violet-500 dark:text-violet-400" />
                  </motion.div>
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
                    {pendingAssignments.map((assignment, index) => (
                      <motion.div
                        key={assignment.gene}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <AnnotationCard 
                          assignment={assignment}
                          formatDate={formatDate}
                          getStatusColor={getStatusColor}
                          showActionButton={true}
                        />
                      </motion.div>
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
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-center py-8"
                  >
                    <Loader2 className="h-8 w-8 animate-spin text-violet-500 dark:text-violet-400" />
                  </motion.div>
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
                    {submittedAssignments.map((assignment, index) => (
                      <motion.div
                        key={assignment.gene}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <AnnotationCard 
                          assignment={assignment}
                          formatDate={formatDate}
                          getStatusColor={getStatusColor}
                          showActionButton={false}
                        />
                      </motion.div>
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


