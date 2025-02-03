'use client'
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  Loader2
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePfamTask } from '@/hooks/use-pfamTask';

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
                className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-0"
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
              className="text-xs bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/50 dark:to-indigo-900/50"
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
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Accession</div>
              <div className="text-lg font-semibold">{domain.acc}</div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Bit Score</div>
              <div className="text-lg font-semibold">{domain.bits}</div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Position</div>
              <div className="text-lg font-semibold">{domain.seq.from}-{domain.seq.to}</div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Length</div>
              <div className="text-lg font-semibold">{domain.model_length}</div>
            </div>
          </div>

          {/* Sequence Alignment */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Sequence Alignment</div>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleAlignment}
                className="gap-2"
              >
                {showFullAlignment ? (
                  <>
                    <Minimize2 className="h-4 w-4" />
                    Collapse
                  </>
                ) : (
                  <>
                    <Maximize2 className="h-4 w-4" />
                    Expand
                  </>
                )}
              </Button>
            </div>
            <div className={`bg-gray-50 dark:bg-gray-900 p-4 rounded-lg transition-all ${showFullAlignment ? '' : 'max-h-48 overflow-y-auto'}`}>
              <pre className="font-mono text-sm overflow-x-auto">
                {domain.align.map((line, i) => (
                  <div key={i} className="whitespace-pre">
                    {line}
                  </div>
                ))}
              </pre>
            </div>
          </div>

          {/* Domain Visualization */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Domain Position</div>
            <div className="relative h-8">
              <div className="absolute inset-0 bg-gray-100 dark:bg-gray-900 rounded-full" />
              <div
                className="absolute h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"
                style={{
                  left: `${(parseInt(domain.seq.from) - 1) / parseInt(domain.model_length) * 100}%`,
                  width: `${(parseInt(domain.seq.to) - parseInt(domain.seq.from) + 1) / parseInt(domain.model_length) * 100}%`
                }}
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="w-full h-full" />
                    <TooltipContent>
                      <p>Position: {domain.seq.from}-{domain.seq.to}</p>
                      <p>Length: {parseInt(domain.seq.to) - parseInt(domain.seq.from) + 1} aa</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
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
              onClick={() => window.open(`https://pfam.xfam.org/family/${domain.acc}`, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
              View in Pfam
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
            >
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
      <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all border dark:border-gray-700">
        <CardContent className="text-center py-8 px-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-500 dark:text-gray-400" />
          <div className="text-gray-900 dark:text-gray-100 font-medium mb-1">
            Analyzing sequence...
          </div>
          <div className="text-gray-500 dark:text-gray-400 text-sm">
            Searching for PFAM domains
          </div>
        </CardContent>
      </Card>
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
          <div className="text-red-500 dark:text-red-400 text-sm">
            {error}
          </div>
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
              Your sequence didn't match any known PFAM domains. Here's what this could mean:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                {/* Novel Family */}
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="rounded-full p-2 bg-blue-500/10 text-blue-500">
                      <Database className="h-4 w-4" />
                    </div>
                    <h3 className="font-medium">Novel Protein Family</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      This could be a new, uncharacterized protein family not yet in PFAM
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
                      May be a distant relative of known families, falling below detection threshold
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
                      The sequence might not contain any currently recognized protein domains
                    </p>
                  </div>
                </div>
              </div>

              {/* Suggestions */}
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 rounded-lg border border-blue-100 dark:border-blue-900">
                <h3 className="font-medium mb-2 text-blue-900 dark:text-blue-100">What you can try:</h3>
                <ul className="space-y-2 text-sm text-blue-600 dark:text-blue-300">
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4" />
                    Try adjusting the E-value threshold for more permissive matching
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