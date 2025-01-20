import React from "react";
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import { 
  Hammer, 
  ChevronRight, 
  Copy,
  FlaskConical,
  Dna,
  CircleDot,
  HelpCircle
} from "lucide-react";

const InfoTooltip = ({ content, children }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="inline-flex items-center cursor-help">
          {children}
          <HelpCircle className="h-3 w-3 ml-1 text-gray-400" />
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p className="max-w-xs text-sm">{content}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const PeptideCard = ({ peptide }) => {
  const copySequence = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(peptide.sequence);
  };

  // Calculate a simple composition score based on sequence
  const getCompositionScore = (sequence) => {
    const uniqueAminoAcids = new Set(sequence).size;
    return (uniqueAminoAcids / sequence.length) * 100;
  };

  const compositionScore = getCompositionScore(peptide.sequence);

  return (
    <Link href={`/peptides/${peptide.name}`} className="group block">
      <Card className="relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border border-indigo-200/50 dark:border-indigo-800/50 bg-white dark:bg-gray-800">
        {/* Layered gradients for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-transparent to-transparent dark:from-indigo-950/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-indigo-50/30 dark:to-indigo-950/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <CardContent className="relative p-6">
          {/* Header Section */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2">
                <CircleDot className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                <CardTitle className="text-lg font-semibold text-indigo-700 dark:text-indigo-300 group-hover:text-indigo-800 dark:group-hover:text-indigo-200 transition-colors truncate">
                  {peptide.name}
                </CardTitle>
              </div>
              <CardDescription className="text-gray-600 dark:text-gray-400 truncate pl-6">
                Gene: {peptide.gene}
              </CardDescription>
            </div>
            <InfoTooltip content="Number of amino acids in the peptide sequence">
              <Badge
                variant="secondary"
                className="shrink-0 bg-gradient-to-r from-indigo-100 to-indigo-50 text-indigo-700 
                           dark:from-indigo-900/50 dark:to-indigo-800/50 dark:text-indigo-300
                           border border-indigo-200 dark:border-indigo-700/50"
              >
                {peptide.length} aa
              </Badge>
            </InfoTooltip>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2 p-3 rounded-lg bg-gradient-to-br from-indigo-50/80 to-indigo-50/30 
                            dark:from-indigo-950/80 dark:to-indigo-950/30 backdrop-blur-sm
                            border border-indigo-100/30 dark:border-indigo-800/30">
                <div className="flex items-center gap-2">
                  <Hammer className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <InfoTooltip content="Structural characteristics and complexity metrics of the peptide">
                    <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Structure</span>
                  </InfoTooltip>
                </div>
                <div className="flex items-center justify-between">
                  <InfoTooltip content="Measure of sequence complexity based on amino acid diversity">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Complexity</span>
                  </InfoTooltip>
                  <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                    {compositionScore.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="space-y-2 p-3 rounded-lg bg-gradient-to-br from-indigo-50/80 to-indigo-50/30 
                            dark:from-indigo-950/80 dark:to-indigo-950/30 backdrop-blur-sm
                            border border-indigo-100/30 dark:border-indigo-800/30">
                <div className="flex items-center gap-2">
                  <FlaskConical className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <InfoTooltip content="Physical and chemical properties of the peptide">
                    <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Properties</span>
                  </InfoTooltip>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Length</span>
                  <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                    {peptide.length} aa
                  </span>
                </div>
              </div>
            </div>

            {/* Sequence Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Dna className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <InfoTooltip content="The amino acid sequence of the peptide">
                    <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Sequence</span>
                  </InfoTooltip>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={copySequence}
                        className="p-1.5 rounded-md text-gray-500 hover:text-indigo-600 
                                 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 
                                 dark:text-gray-400 dark:hover:text-indigo-300
                                 transition-colors"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Copy sequence</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="relative">
                <div className="overflow-hidden rounded-md bg-gradient-to-r from-indigo-50 to-indigo-50/50 
                              dark:from-indigo-950/50 dark:to-indigo-950/30 
                              border border-indigo-100/30 dark:border-indigo-800/30 p-2">
                  <p className="text-sm font-mono text-gray-700 dark:text-gray-300 truncate">
                    {peptide.sequence}
                  </p>
                </div>
                <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white via-white to-transparent 
                              dark:from-gray-800 dark:via-gray-800" />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-indigo-100/30 dark:border-indigo-800/30">
            <div className="flex items-center justify-between group/footer">
              <div className="flex-1">
                <InfoTooltip content="Full identifier and location information">
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {peptide.header}
                  </p>
                </InfoTooltip>
              </div>
              <ChevronRight className="h-5 w-5 text-indigo-400 group-hover/footer:text-indigo-500 
                                     dark:text-indigo-600 dark:group-hover/footer:text-indigo-400 
                                     transform group-hover:translate-x-1 transition-all duration-300" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default PeptideCard;