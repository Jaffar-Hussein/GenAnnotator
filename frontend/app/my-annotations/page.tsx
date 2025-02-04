'use client';
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Loader2, Clock, ClipboardCheck, AlertCircle, 
  RefreshCcw, Inbox, Dna, CheckCircle2 
} from "lucide-react";
import Link from "next/link";
import { useAssignments } from "@/hooks/useAnnotations";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import SubmittedTab from "@/components/submittedAnnotation";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { 
    opacity: 0,
    y: 20
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      mass: 0.5,
      damping: 20,
      stiffness: 100
    }
  }
};

const EmptyState = ({ message, icon: Icon, description, stateKey }) => (
  <motion.div 
    key={`empty-${stateKey}`}
    variants={containerVariants}
    initial="hidden"
    animate="visible"
    className="text-center py-16"
  >
    <motion.div 
      variants={itemVariants}
      className="flex justify-center"
    >
      <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-gray-700 flex items-center justify-center">
        <Icon className="h-8 w-8 text-slate-400 dark:text-slate-500" />
      </div>
    </motion.div>
    <motion.h3 
      variants={itemVariants}
      className="mt-4 text-lg font-medium text-slate-900 dark:text-white"
    >
      No assignments found
    </motion.h3>
    <motion.p 
      variants={itemVariants}
      className="mt-2 text-slate-500 dark:text-slate-400 max-w-sm mx-auto"
    >
      {message}
    </motion.p>
    {description && (
      <motion.p 
        variants={itemVariants}
        className="mt-1 text-sm text-slate-400 dark:text-slate-500"
      >
        {description}
      </motion.p>
    )}
  </motion.div>
);

const ErrorAlert = ({ error, onRetry, isNetworkError }) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ type: "spring", damping: 20, stiffness: 100 }}
  >
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error Loading Assignments</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>{error}</span>
        {isNetworkError && (
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onRetry} 
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Retry
          </motion.button>
        )}
      </AlertDescription>
    </Alert>
  </motion.div>
);

const AnnotationCard = ({ assignment, formatDate, getStatusColor, showActionButton }) => {
  const cardKey = `${assignment.gene}-${assignment.status}-${assignment.updated_at}`;
  
  return (
    <motion.div
      key={cardKey}
      variants={itemVariants}
      className="max-w-7xl rounded-lg border border-slate-200/60 dark:border-gray-700/60 bg-white dark:bg-gray-800 p-6 shadow-sm hover:shadow-md transition-all duration-200"
    >
      <div className="flex justify-between items-start">
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-slate-900 dark:text-white flex items-center gap-2">
            Gene: {assignment.gene}
            {assignment.status === "ONGOING" && (
              <span className="inline-flex items-center px-2 py-1 text-xs rounded-md bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                Active
              </span>
            )}
          </h3>
          <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {showActionButton ? `Assigned: ${formatDate(assignment.created_at)}` : `Submitted: ${formatDate(assignment.updated_at)}`}
            </div>
          </div>
        </div>
        <div className="flex gap-3 items-center">
          
          {showActionButton && (
            <Link
              href={`/annotate/${assignment.gene}`}
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500 transition-all shadow-sm hover:shadow"
            >
              <ClipboardCheck className="h-4 w-4 mr-2" />
              Start Annotation
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const TabCounter = ({ count, label }) => (
  <motion.span
    key={`counter-${label}-${count}`}
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{
      type: "spring",
      stiffness: 400,
      damping: 17
    }}
    className="ml-2 px-2 py-0.5 text-xs rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300"
  >
    {count}
  </motion.span>
);

const AnnotationDashboard = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const store = useAuthStore.getState();
  
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
      ONGOING: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
      SUBMITTED: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
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
          transition={{ type: "spring", damping: 20, stiffness: 100 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-3 mb-2">
            <motion.div 
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shadow-sm"
            >
              <Dna className="h-6 w-6 text-indigo-500 dark:text-indigo-400" />
            </motion.div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
              My Annotations Dashboard
            </h1>
          </div>
          <p className="mt-2 text-slate-600 dark:text-slate-400 ml-13">
            Manage your assigned sequences and annotations
          </p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 border border-slate-200/60 dark:border-gray-700/60 p-1">
            <TabsTrigger 
              value="pending" 
              className="data-[state=active]:bg-indigo-100/50 dark:data-[state=active]:bg-indigo-900/30 transition-all duration-200"
            >
              Pending Assignments
              {pendingAssignments.length > 0 && (
                <TabCounter count={pendingAssignments.length} label="pending" />
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="submitted" 
              className="data-[state=active]:bg-indigo-100/50 dark:data-[state=active]:bg-indigo-900/30 transition-all duration-200"
            >
              Submitted for Validation
              {submittedAssignments.length > 0 && (
                <TabCounter count={submittedAssignments.length} label="submitted" />
              )}
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <TabsContent value="pending" key="pending-tab">
              <Card className="border border-slate-200/60 dark:border-gray-700/60 shadow-sm">
                <CardContent className="p-6 bg-white/80 dark:bg-gray-800/90">
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                        Sequences Awaiting Annotation
                      </h2>
                      {hasAssignments && (
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          {pendingAssignments.length} assignments pending
                        </span>
                      )}
                    </div>

                    <AnimatePresence mode="wait">
                      {loading ? (
                        <motion.div 
                          key="pending-loader"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex justify-center py-12"
                        >
                          <Loader2 className="h-8 w-8 animate-spin text-indigo-500 dark:text-indigo-400" />
                        </motion.div>
                      ) : !hasAssignments ? (
                        <EmptyState 
                          message="You currently have no pending assignments."
                          description="New assignments will appear here when they are assigned to you."
                          icon={Inbox}
                          stateKey="no-assignments"
                        />
                      ) : pendingAssignments.length === 0 ? (
                        <EmptyState 
                          message="All your assignments have been submitted."
                          description="Great job! Check the 'Submitted for Validation' tab to see their status."
                          icon={ClipboardCheck}
                          stateKey="all-submitted"
                        />
                      ) : (
                        <motion.div 
                          key="pending-list"
                          className="space-y-4"
                          variants={containerVariants}
                          initial="hidden"
                          animate="visible"
                        >
                          {pendingAssignments.map((assignment) => (
                            <AnnotationCard 
                              key={`${assignment.gene}-${assignment.status}-${assignment.updated_at}`}
                              assignment={assignment}
                              formatDate={formatDate}
                              getStatusColor={getStatusColor}
                              showActionButton={true}
                            />
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="submitted" key="submitted-tab">
              <Card className="border border-slate-200/60 dark:border-gray-700/60 shadow-sm">
                <CardContent className="p-6 bg-white/80 dark:bg-gray-800/90">
                  <SubmittedTab />
                </CardContent>
              </Card>
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  );
};

export default AnnotationDashboard;