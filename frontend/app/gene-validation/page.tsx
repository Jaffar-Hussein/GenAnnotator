"use client";

import { useState, useRef, SetStateAction } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  Dna,
  ChevronDown,
  Info,
  FileText,
} from "lucide-react";
import { useGeneValidation } from "@/hooks/useGeneValidation";
import { GeneDetails } from "@/components/gene-annot-details";

declare global {
  interface Window {
    _expandedCardRef?: HTMLElement;
    _rejectFormRef?: HTMLElement;
  }
}

export default function GeneValidationPage() {
  const {
    pendingAnnotations,
    totalCount,
    loading,
    error,
    success,
    selectedAnnotation,
    approveGene,
    rejectGene,
    fetchGeneDetails,
  } = useGeneValidation();

  const [expandedGene, setExpandedGene] = useState<string | null>(null);
  const [rejectingGene, setRejectingGene] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const AlertMessage = ({
    type,
    message,
    icon: Icon,
  }: {
    type: string;
    message: string;
    icon: React.ComponentType<{ className?: string }>;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      <Alert
        className={`
          mb-4 shadow-sm border 
          ${
            type === "success"
              ? "bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-800"
              : "bg-white dark:bg-slate-900 border-rose-200 dark:border-rose-800"
          }
        `}
      >
        <div className="flex gap-3 items-start">
          <div
            className={`
            shrink-0 mt-0.5
            ${
              type === "success"
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-600 dark:text-rose-400"
            }
          `}
          >
            <Icon className="h-5 w-5" />
          </div>
          <AlertDescription
            className={`
            py-0.5 flex-1
            ${
              type === "success"
                ? "text-emerald-950 dark:text-emerald-200"
                : "text-rose-950 dark:text-rose-200"
            }
          `}
          >
            {message}
          </AlertDescription>
        </div>
      </Alert>
    </motion.div>
  );

  const handleExpand = async (gene: string) => {
    if (expandedGene === gene) {
      setExpandedGene(null);
    } else {
      await fetchGeneDetails(gene);
      setExpandedGene(gene);
    }
  };

  const handleApprove = async (gene: string) => {
    await approveGene(gene);
    setExpandedGene(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReject = async (gene: string) => {
    if (rejectionReason) {
      await rejectGene(gene, rejectionReason);
      setRejectingGene(null);
      setRejectionReason("");
      setExpandedGene(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-5 dark:from-gray-800 dark:to-gray-900">
      <div className="container mx-auto py-6 px-4 max-w-5xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="h-14 w-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <Dna className="h-8 w-8 text-indigo-600 dark:text-indigo-300" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                Gene Validation
              </h1>
              <p className="mt-1 text-slate-600 dark:text-slate-300">
                {totalCount} annotations pending review
              </p>
            </div>
          </div>

          {/* Status Messages */}
          <AnimatePresence mode="sync">
            {error && (
              <AlertMessage type="error" message={error} icon={AlertCircle} />
            )}
            {success && (
              <AlertMessage
                type="success"
                message={success}
                icon={CheckCircle}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Gene List */}
        {loading && pendingAnnotations.length === 0 ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        ) : (
          <div className="space-y-4">
            {pendingAnnotations.map((status) => (
              <motion.div
                key={status.gene}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card
                  onClick={() => handleExpand(status.gene)}
                  className={`border transition-all duration-200 cursor-pointer dark:bg-gray-800
                    hover:border-indigo-500/50 hover:shadow-md dark:hover:border-indigo-400/30
                    ${
                      expandedGene === status.gene
                        ? "border-indigo-500/50 dark:border-indigo-400/30"
                        : "border-slate-200/60 dark:border-slate-700/60"
                    }
                  `}
                >
                  <CardContent className="p-6">
                    <div className="px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex flex-col items-start">
                          <div className="flex items-center space-x-3">
                            <span className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                              {status.gene}
                            </span>
                            <Badge
                              variant="secondary"
                              className="dark:bg-indigo-900/30 dark:text-slate-200"
                            >
                              Pending Review
                            </Badge>
                          </div>
                          <div className="mt-1 flex items-center text-sm text-slate-500 dark:text-slate-400">
                            <FileText className="h-4 w-4 mr-2" />
                            Created:{" "}
                            {new Date(status.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <motion.div
                        animate={{
                          rotate: expandedGene === status.gene ? 180 : 0,
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="h-5 w-5 text-slate-400" />
                      </motion.div>
                    </div>

                    <AnimatePresence>
                      {expandedGene === status.gene && (
                        <motion.div
                          ref={(el) => {
                            if (el) {
                              window._expandedCardRef = el;
                            }
                          }}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          onAnimationComplete={() => {
                            if (window._expandedCardRef) {
                              window._expandedCardRef.scrollIntoView({
                                behavior: "smooth",
                                block: "nearest",
                              });
                            }
                          }}
                          className="border-t border-slate-100 dark:border-slate-800"
                          onClick={(e) => e.stopPropagation()} // Prevent collapse when interacting with content
                        >
                          <div className="px-6 py-4">
                            {loading ? (
                              <div className="flex justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                              </div>
                            ) : selectedAnnotation ? (
                              <>
                                <GeneDetails
                                  annotation={selectedAnnotation}
                                  className="mb-6"
                                />

                                <AnimatePresence mode="wait">
                                  {rejectingGene === status.gene ? (
                                    <motion.div
                                      ref={(el) => {
                                        if (el) {
                                          window._rejectFormRef = el;
                                        }
                                      }}
                                      initial={{ opacity: 0, y: -10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -10 }}
                                      onAnimationComplete={() => {
                                        if (window._rejectFormRef) {
                                          window._rejectFormRef.scrollIntoView({
                                            behavior: "smooth",
                                            block: "nearest",
                                          });
                                        }
                                      }}
                                      className="space-y-4"
                                    >
                                      <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
                                        <h4 className="font-medium mb-2">
                                          Rejection Reason
                                        </h4>
                                        <Textarea
                                          ref={(textarea) => {
                                            if (textarea) {
                                              textarea.focus();
                                            }
                                          }}
                                          placeholder="Please provide a detailed explanation for rejecting this gene annotation..."
                                          value={rejectionReason}
                                          onChange={(e) =>
                                            setRejectionReason(e.target.value)
                                          }
                                          onKeyDown={(e) => {
                                            if (
                                              e.key === "Enter" &&
                                              !e.shiftKey
                                            ) {
                                              e.preventDefault();
                                              if (rejectionReason) {
                                                handleReject(status.gene);
                                              }
                                            }
                                          }}
                                          className="min-h-5 bg-white dark:bg-slate-900 dark:text-slate-200"
                                        />
                                        <div className="flex justify-end space-x-3 mt-4">
                                          <Button
                                            variant="outline"
                                            onClick={() => {
                                              setRejectingGene(null);
                                              setRejectionReason("");
                                            }}
                                            className="dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-200"
                                          >
                                            Cancel
                                          </Button>
                                          <Button
                                            variant="destructive"
                                            onClick={() =>
                                              handleReject(status.gene)
                                            }
                                            disabled={!rejectionReason}
                                            className="dark:bg-red-900 dark:hover:bg-red-800"
                                          >
                                            Confirm Rejection
                                          </Button>
                                        </div>
                                      </div>
                                    </motion.div>
                                  ) : (
                                    <motion.div
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      exit={{ opacity: 0 }}
                                      className="flex justify-end space-x-3"
                                    >
                                      <Button
                                        variant="destructive"
                                        onClick={() =>
                                          setRejectingGene(status.gene)
                                        }
                                        className="min-w-[120px] dark:bg-red-900 dark:hover:bg-red-800"
                                      >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Reject
                                      </Button>
                                      <Button
                                        onClick={() =>
                                          handleApprove(status.gene)
                                        }
                                        className="min-w-[120px] bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
                                      >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Approve
                                      </Button>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </>
                            ) : (
                              <div className="flex justify-center py-4 text-slate-500 dark:text-slate-400">
                                <Info className="h-5 w-5 mr-2" />
                                No details available
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
