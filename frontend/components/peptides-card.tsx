import React from "react";
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { 
  Hammer, 
  ChevronRight, 
  Copy,
  FlaskConical,
  Dna,
  CircleDot,
  MapPin
} from "lucide-react";

const PeptideCard = ({ peptide }) => {
  const copySequence = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(peptide.sequence);
  };

  // Parse header information
  const parseHeader = (header) => {
    const parts = header.split(':');
    return {
      id: parts[0],
      assembly: parts[1],
      chromosome: parts[2],
      start: parseInt(parts[3]),
      end: parseInt(parts[4])
    };
  };

  const getCompositionScore = (sequence) => {
    const uniqueAminoAcids = new Set(sequence).size;
    return (uniqueAminoAcids / sequence.length) * 100;
  };

  const headerInfo = parseHeader(peptide.header);
  const compositionScore = getCompositionScore(peptide.sequence);
  const length = headerInfo.end - headerInfo.start;

  return (
    <Link href={`/peptides/${peptide.name}`} className="group block">
      <Card className="relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border  bg-white dark:bg-gray-800">
        {/* Enhanced gradient effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-transparent to-transparent dark:from-indigo-950/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-indigo-50/30 dark:to-indigo-950/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-75" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent dark:via-indigo-400/10" />

        <CardContent className="relative p-6">
          {/* Header Section - Enhanced hierarchy */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <CircleDot className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                  <div className="absolute inset-0 bg-indigo-500/20 dark:bg-indigo-400/20 rounded-full blur-sm group-hover:blur-md transition-all" />
                </div>
                <CardTitle className="text-lg font-semibold text-indigo-700 dark:text-indigo-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-200 transition-colors truncate">
                  {peptide.name}
                </CardTitle>
              </div>
              <CardDescription className="text-gray-600 dark:text-gray-400 truncate pl-7">
                Gene: {peptide.gene}
              </CardDescription>
            </div>
            <Badge
              variant="secondary"
              className="shrink-0 bg-gradient-to-r from-indigo-100 to-indigo-50 text-indigo-700 
                       dark:from-indigo-900/50 dark:to-indigo-800/50 dark:text-indigo-300
                       border border-indigo-200 dark:border-indigo-700/50 shadow-sm"
            >
              {peptide.length} aa
            </Badge>
          </div>

          {/* Main Content - Improved visual rhythm */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
              {/* Location Panel */}
              <div className="group/panel space-y-2.5 p-3.5 rounded-lg bg-gradient-to-br from-indigo-50/80 to-indigo-50/30 
                          dark:from-indigo-950/80 dark:to-indigo-950/30 backdrop-blur-sm
                          border border-indigo-100/30 dark:border-indigo-800/30
                          hover:from-indigo-100/80 hover:to-indigo-50/50 
                          dark:hover:from-indigo-900/80 dark:hover:to-indigo-950/50
                          transition-all duration-300">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Location</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Position</span>
                    <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400 tabular-nums">
                      {headerInfo.start.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Length</span>
                    <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400 tabular-nums">
                      {length.toLocaleString()} bp
                    </span>
                  </div>
                </div>
              </div>

              {/* Structure Panel */}
              <div className="group/panel space-y-2.5 p-3.5 rounded-lg bg-gradient-to-br from-indigo-50/80 to-indigo-50/30 
                          dark:from-indigo-950/80 dark:to-indigo-950/30 backdrop-blur-sm
                          border border-indigo-100/30 dark:border-indigo-800/30
                          hover:from-indigo-100/80 hover:to-indigo-50/50 
                          dark:hover:from-indigo-900/80 dark:hover:to-indigo-950/50
                          transition-all duration-300">
                <div className="flex items-center gap-2">
                  <Hammer className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Structure</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Complexity</span>
                  <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400 tabular-nums">
                    {compositionScore.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Sequence Section - Enhanced interaction */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Dna className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Sequence</span>
                </div>
                <button
                  onClick={copySequence}
                  className="p-1.5 rounded-md text-gray-500 hover:text-indigo-600 
                           hover:bg-indigo-50 dark:hover:bg-indigo-950/50 
                           dark:text-gray-400 dark:hover:text-indigo-300
                           transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <div className="relative">
                <div className="overflow-hidden rounded-md bg-gradient-to-r from-indigo-50 to-indigo-50/50 
                            dark:from-indigo-950/50 dark:to-indigo-950/30 
                            border border-indigo-100/30 dark:border-indigo-800/30 
                            group-hover:border-indigo-200/50 dark:group-hover:border-indigo-700/50
                            transition-colors duration-300 p-2.5">
                  <p className="text-sm font-mono text-gray-700 dark:text-gray-300 truncate">
                    {peptide.sequence}
                  </p>
                </div>
                <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white via-white to-transparent 
                            dark:from-gray-800 dark:via-gray-800" />
              </div>
            </div>
          </div>

          {/* Footer - Enhanced movement */}
          <div className="mt-6 pt-4 border-t border-indigo-100/30 dark:border-indigo-800/30">
            <div className="flex items-center justify-between group/footer">
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">
                  {headerInfo.assembly}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">•</span>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">
                  {headerInfo.chromosome}
                </span>
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