'use client'
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dna,
  Search,
  Database,
  BarChart,
  Share2,
  Download,
  ExternalLink,
  AlertCircle,
  Loader2,
  BellRingIcon
} from 'lucide-react';
import { useBlastTask } from '@/hooks/use-blast-task';
import BlastResultsComponent from '@/components/blast_results';


interface BlastAnalysisProps {
  gene: string;
}

const BlastAnalysis: React.FC<BlastAnalysisProps> = ({ gene }) => {
  const { runBlast, isLoading, error, results, isPolling } = useBlastTask();
  

  useEffect(() => {
    if (gene) {
      runBlast(gene);
    }
  }, [gene,runBlast]);

  if (!gene) {
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
            Please provide a gene sequence to perform BLAST analysis.
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading || isPolling) {
    return (
      <Card className="bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all border border-slate-200 dark:border-slate-700">
      <CardContent className="text-center py-8 px-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500 dark:text-blue-400" />
        <div className="text-slate-900 dark:text-slate-100 font-medium mb-1">
          {isPolling ? "BLAST Analysis Running" : "Starting BLAST Analysis"}
        </div>
        <div className="text-slate-500 dark:text-slate-400 text-sm">
          {isPolling ? "Analysis is continuing in the background" : "Searching sequence database"}
        </div>

        {isPolling && (
          <div className="mt-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 mx-auto max-w-md
                         border border-blue-100 dark:border-blue-800">
            <div className="flex items-center justify-center gap-2 text-blue-700 dark:text-blue-300">
              <BellRingIcon className="h-4 w-4" />
              <span className="text-sm">You can safely navigate away - we'll notify you when ready</span>
            </div>
          </div>
        )}
        
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2 text-sm text-slate-500 dark:text-slate-400">
            <span>Progress</span>
            <span>{isPolling ? "75%" : "25%"}</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-500 dark:bg-blue-400"
              initial={{ width: "0%" }}
              animate={{ width: isPolling ? "75%" : "25%" }}
              transition={{ duration: 1 }}
            />
          </div>
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

  const searchData = results?.BlastOutput2?.report?.results?.search;
  
  if (!searchData) {
    return (
      <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all border dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-center flex flex-col items-center gap-2">
            <div className="rounded-full bg-yellow-100 dark:bg-yellow-900/30 p-3">
              <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            No BLAST Hits Found
          </CardTitle>
          <CardDescription className="text-center">
            Your sequence didn't match any sequences in the database.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="rounded-full p-2 bg-blue-500/10 text-blue-500">
                    <Database className="h-4 w-4" />
                  </div>
                  <h3 className="font-medium">Novel Sequence</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    This could be a new, previously uncharacterized sequence
                  </p>
                </div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="rounded-full p-2 bg-indigo-500/10 text-indigo-500">
                    <Search className="h-4 w-4" />
                  </div>
                  <h3 className="font-medium">Try Different Parameters</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Adjust search parameters for broader results
                  </p>
                </div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="rounded-full p-2 bg-green-500/10 text-green-500">
                    <ExternalLink className="h-4 w-4" />
                  </div>
                  <h3 className="font-medium">Different Database</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Try searching against a different sequence database
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <BlastResultsComponent
      search={searchData}
      onShare={() => console.log('Sharing results...')}
      onExport={() => {
        const blob = new Blob([JSON.stringify(results, null, 2)], { 
          type: 'application/json' 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `blast_results_${gene}_${new Date().toISOString()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }}
      onOpenNCBI={() => window.open('https://blast.ncbi.nlm.nih.gov/Blast.cgi', '_blank')}
    />
  );
};

export default BlastAnalysis;