import React, { useState } from 'react';
import { useSubmittedAnnotations } from '@/hooks/useSubmittedAnnotations';
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Clock, Loader2, CheckCircle2, XCircle, Clock4, FileText } from "lucide-react";

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  }
};

const cardVariants = {
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
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2
    }
  }
};

const FilterButton = ({ active, label, icon: Icon, onClick, color }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    transition={{ type: "spring", stiffness: 400, damping: 17 }}
    onClick={onClick}
    className={`
      flex items-center gap-2 px-4 py-2 rounded-full
      ${active ? 
        `${color} shadow-md` : 
        'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700'
      }
    `}
  >
    <Icon className={`h-4 w-4 ${active ? 'text-current' : 'text-slate-500 dark:text-slate-400'}`} />
    <span className={active ? 'text-current font-medium' : 'text-slate-600 dark:text-slate-300'}>
      {label}
    </span>
  </motion.button>
);

const SubmittedAnnotationCard = ({ assignment, formatDate, getStatusColor }) => {
  const cardMotion = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: {
      type: "spring",
      mass: 0.5,
      damping: 20,
      stiffness: 100
    }
  };

  return (
    <motion.div
      {...cardMotion}
      className="rounded-lg border border-slate-200/60 dark:border-gray-700/60 bg-white dark:bg-gray-800 p-6 shadow-sm"
    >
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white flex items-center gap-2">
              Gene: {assignment.gene}
              {assignment.status === 'APPROVED' && (
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              )}
            </h3>
            <div className="flex items-center gap-2 mt-2 text-sm text-slate-500 dark:text-slate-400">
              <Clock className="h-4 w-4" />
              {assignment.status === 'PENDING' ? 
                `Submitted: ${formatDate(assignment.updated_at)}` :
                assignment.status === 'APPROVED' ? 
                  `Validated: ${formatDate(assignment.validated_at)}` :
                  `Rejected: ${formatDate(assignment.updated_at)}`
              }
            </div>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(assignment.status)}`}>
            {assignment.status || 'PENDING'}
          </span>
        </div>
        
        {assignment.status === 'REJECTED' && assignment.rejection_reason && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="p-4 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-red-800 dark:text-red-200">Rejection Reason:</p>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1 break-words">
                  {assignment.rejection_reason}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

const SubmittedTab = () => {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const { 
    annotations, 
    loading, 
    error,
    hasAnnotations 
  } = useSubmittedAnnotations(statusFilter);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status) => {
    const colors = {
      ALL: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
      PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
      APPROVED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
      REJECTED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    };
    return colors[status || 'PENDING'] || colors['ALL'];
  };

  const filters = [
    {
      id: 'ALL',
      label: 'All Annotations',
      icon: FileText,
      color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
    },
    {
      id: 'PENDING',
      label: 'Pending Review',
      icon: Clock4,
      color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
    },
    {
      id: 'APPROVED',
      label: 'Validated',
      icon: CheckCircle2,
      color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
    },
    {
      id: 'REJECTED',
      label: 'Rejected',
      icon: XCircle,
      color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    }
  ];

  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="space-y-4"
      >
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          {filters.find(f => f.id === statusFilter)?.label}
        </h2>
        
        <div className="flex flex-wrap gap-2">
          {filters.map(filter => (
            <FilterButton
              key={filter.id}
              active={statusFilter === filter.id}
              label={filter.label}
              icon={filter.icon}
              onClick={() => setStatusFilter(filter.id)}
              color={filter.color}
            />
          ))}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center py-12"
          >
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500 dark:text-indigo-400" />
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-lg border border-red-200 dark:border-red-800 p-4 text-center"
          >
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </motion.div>
        ) : annotations.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-12"
          >
            <div className="flex justify-center mb-4">
              {statusFilter === 'ALL' && <FileText className="h-12 w-12 text-slate-400" />}
              {statusFilter === 'PENDING' && <Clock4 className="h-12 w-12 text-yellow-500/70" />}
              {statusFilter === 'APPROVED' && <CheckCircle2 className="h-12 w-12 text-emerald-500/70" />}
              {statusFilter === 'REJECTED' && <XCircle className="h-12 w-12 text-red-500/70" />}
            </div>
            <p className="text-slate-500 dark:text-slate-400">
              No {filters.find(f => f.id === statusFilter)?.label.toLowerCase()} found
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            variants={listVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            <AnimatePresence mode="wait">
              {annotations.map((annotation) => (
                <SubmittedAnnotationCard
                  key={`${annotation.gene}-${annotation.status || 'PENDING'}`}
                  assignment={annotation}
                  formatDate={formatDate}
                  getStatusColor={getStatusColor}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SubmittedTab;