"use client";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

import {
  Database,
  ArrowRight,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Info,
  Download,
  ExternalLink,
  Maximize2,
  Minimize2,
  FileCheck,
  Loader2,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePfamTask } from "@/hooks/use-pfamTask";
import PfamAlignment from "@/components/alignment-viewer";
import PfamLoader from "./pfamLoader";

interface PfamAnalysisProps {
  peptide: string;
}

const PfamDomainCard = ({ domain }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFullAlignment, setShowFullAlignment] = useState(false);
  
  const toggleExpand = () => setIsExpanded(!isExpanded);
  const toggleAlignment = () => setShowFullAlignment(!showFullAlignment);

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all border dark:border-gray-700">
      <CardHeader className="cursor-pointer" onClick={toggleExpand}>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {domain.name}
              <Badge
                variant="secondary"
                className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-0"
              >
                {domain.type}
              </Badge>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-gray-400 hover:text-gray-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>PFAM ID: {domain.acc}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              {domain.desc}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="text-xs bg-gradient-to-r from-indigo-50 to-indigo-50 dark:from-indigo-900/50 dark:to-indigo-900/50"
            >
              E-value: {domain.evalue}
            </Badge>
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6">
          {/* Domain Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Accession
              </div>
              <div className="text-lg font-semibold">{domain.acc}</div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Bit Score
              </div>
              <div className="text-lg font-semibold">{domain.bits}</div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Position
              </div>
              <div className="text-lg font-semibold">
                {domain.seq.from}-{domain.seq.to}
              </div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Length
              </div>
              <div className="text-lg font-semibold">{domain.model_length}</div>
            </div>
          </div>

          {/* Sequence Alignment Section */}
          <PfamAlignment align={domain.align} />
          

          {/* Domain Visualization */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Domain Position</div>
            {/* Main bar */}
            <div className="relative h-8">
              {/* Background track */}
              <div className="absolute inset-0 bg-gray-100 dark:bg-gray-900 rounded-full" />
              {/* Domain indicator */}
              <div
                className="absolute h-full bg-indigo-600 dark:bg-indigo-500 rounded-full 
                 transition-all duration-200 hover:bg-indigo-500"
                style={{
                  left: `${Math.max(
                    0,
                    Math.min(
                      100,
                      ((parseInt(domain.seq.from) - 1) /
                        parseInt(domain.model_length)) *
                        100
                    )
                  )}%`,
                  width: `${Math.max(
                    2,
                    Math.min(
                      100,
                      ((parseInt(domain.seq.to) -
                        parseInt(domain.seq.from) +
                        1) /
                        parseInt(domain.model_length)) *
                        100
                    )
                  )}%`,
                }}
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="w-full h-full" />
                    <TooltipContent className="p-2">
                      <p className="text-sm">
                        Position: {domain.seq.from}-{domain.seq.to}
                      </p>
                      <p className="text-sm">
                        Length:{" "}
                        {parseInt(domain.seq.to) -
                          parseInt(domain.seq.from) +
                          1}{" "}
                        aa
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            {/* Scale numbers */}
            <div className="flex justify-between text-sm text-gray-500">
              <span>1</span>
              <span>{domain.model_length}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() =>
                window.open(
                  `https://pfam.xfam.org/family/${domain.acc}`,
                  "_blank"
                )
              }
            >
              <ExternalLink className="h-4 w-4" />
              View in Pfam
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Download Data
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

const PfamAnalysis: React.FC<PfamAnalysisProps> = ({ peptide }) => {
  const { runPfamScan, isLoading, error, results, isPolling } = usePfamTask();

  useEffect(() => {
    if (peptide) {
      runPfamScan(peptide);
    }
  }, [peptide]);

  if (!peptide) {
    return (
      <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all border dark:border-gray-700">
        <CardContent className="text-center py-8 px-4">
          <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
            <Database className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          </div>
          <div className="text-gray-900 dark:text-gray-100 font-medium mb-1">
            No sequence provided
          </div>
          <div className="text-gray-500 dark:text-gray-400 text-sm">
            Please provide a protein sequence to search for PFAM domains.
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading || isPolling) {
    return (
      // <Card className="">
      //   <CardContent className="text-center py-12 px-6">
      //     {/* Loading Indicator */}
      //     <div
      //       className="inline-flex items-center justify-center p-3 mb-6 
      //                 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl"
      //     >
      //       <Loader2 className="h-8 w-8 animate-spin text-indigo-500 dark:text-indigo-400" />
      //     </div>

      //     {/* Status Text */}
      //     <div className="space-y-2 mb-6">
      //       <div className="text-gray-900 dark:text-gray-100 text-lg font-medium">
      //         {isPolling ? "PFAM Analysis Running" : "Analyzing Sequence"}
      //       </div>
      //       <div className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mx-auto">
      //         {isPolling
      //           ? "We're searching through protein family databases to identify domains"
      //           : "Searching for PFAM domains and analyzing sequence patterns"}
      //       </div>
      //     </div>

      //     {/* Progress Indicator */}
      //     {isPolling && (
      //       <div className="max-w-md mx-auto">
      //         <div className="w-full bg-gray-100 dark:bg-gray-700 h-1 rounded-full overflow-hidden">
      //           <motion.div
      //             className="h-full bg-indigo-500 dark:bg-indigo-400"
      //             initial={{ width: "0%" }}
      //             animate={{
      //               width: ["20%", "80%"],
      //               transition: {
      //                 duration: 2,
      //                 repeat: Infinity,
      //                 repeatType: "reverse",
      //                 ease: "easeInOut",
      //               },
      //             }}
      //           />
      //         </div>
      //       </div>
      //     )}
      //   </CardContent>
      // </Card>
      <PfamLoader />
    );
  }

  if (error) {
    return (
      <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all border dark:border-gray-700">
        <CardContent className="text-center py-8 px-4">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-500" />
          <div className="text-gray-900 dark:text-gray-100 font-medium mb-1">
            Analysis Error
          </div>
          <div className="text-red-500 dark:text-red-400 text-sm">{error}</div>
        </CardContent>
      </Card>
    );
  }

  // Display results
  return (
    <div className="space-y-6">
      {/* Query Information */}
      <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all border dark:border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Query Sequence
                <Badge
                  variant="secondary"
                  className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-0"
                >
                  COMPLETED
                </Badge>
              </CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">
                Sequence length: {peptide.length} aa
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <FileCheck className="h-4 w-4" />
              E-value threshold: 0.001
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Results */}
      {results && results.length === 0 ? (
        <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all border dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-center flex flex-col items-center gap-2">
              <div className="rounded-full bg-yellow-100 dark:bg-yellow-900/30 p-3">
                <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              No PFAM Domains Found
            </CardTitle>
            <CardDescription className="text-center">
              Your sequence didn't match any known PFAM domains. Here's what
              this could mean:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                {/* Novel Family */}
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="rounded-full p-2 bg-indigo-500/10 text-indigo-500">
                      <Database className="h-4 w-4" />
                    </div>
                    <h3 className="font-medium">Novel Protein Family</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      This could be a new, uncharacterized protein family not
                      yet in PFAM
                    </p>
                  </div>
                </div>

                {/* Divergent Member */}
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="rounded-full p-2 bg-indigo-500/10 text-indigo-500">
                      <ExternalLink className="h-4 w-4" />
                    </div>
                    <h3 className="font-medium">Divergent Sequence</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      May be a distant relative of known families, falling below
                      detection threshold
                    </p>
                  </div>
                </div>

                {/* No Domains */}
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="rounded-full p-2 bg-green-500/10 text-green-500">
                      <AlertCircle className="h-4 w-4" />
                    </div>
                    <h3 className="font-medium">No Known Domains</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      The sequence might not contain any currently recognized
                      protein domains
                    </p>
                  </div>
                </div>
              </div>

              {/* Suggestions */}
              <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-indigo-50 dark:from-indigo-950/50 dark:to-indigo-950/50 rounded-lg border border-indigo-100 dark:border-indigo-900">
                <h3 className="font-medium mb-2 text-indigo-900 dark:text-indigo-100">
                  What you can try:
                </h3>
                <ul className="space-y-2 text-sm text-indigo-600 dark:text-indigo-300">
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4" />
                    Try adjusting the E-value threshold for more permissive
                    matching
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4" />
                    Search against other protein family databases
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4" />
                    Consider running sequence-based similarity searches (BLAST)
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {results?.map((domain, index) => (
            <PfamDomainCard key={index} domain={domain} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PfamAnalysis;
