import React from 'react';
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { Database } from 'lucide-react';

const GenomeCard = ({ genome }) => {
    const getStatusColor = (status) => {
      switch (status.toLowerCase()) {
        case 'annotated':
          return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300';
        case 'pending':
          return 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300';
        default:
          return 'bg-slate-100 text-slate-700 dark:bg-slate-900/50 dark:text-slate-300';
      }
    };
  
    return (
      <Link href={`/genomes/${genome.id}`} className="group block">
        <Card className="relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border border-indigo-200/50 dark:border-indigo-800/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent dark:from-indigo-950/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <CardContent className="p-6 space-y-4 relative">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 min-w-0">
                <CardTitle className="text-lg font-semibold text-indigo-700 dark:text-indigo-300 group-hover:text-indigo-800 dark:group-hover:text-indigo-200 transition-colors truncate">
                  {genome.name}
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400 truncate">
                  {genome.species} • {genome.strain}
                </CardDescription>
              </div>
              <Badge variant="secondary" className={`shrink-0 ${getStatusColor(genome.status)}`}>
                {genome.status}
              </Badge>
            </div>
  
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 p-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/50">
                <div className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-300">
                  <Database className="h-4 w-4" />
                  <span className="font-medium">Base Pairs</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {genome.basePairs.toLocaleString()}
                </p>
              </div>
              <div className="space-y-2 p-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/50">
                <div className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-300">
                  <span className="font-medium">GC Content</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {genome.gcPercentage}
                </p>
              </div>
            </div>
  
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <span className={genome.coverage === 'Full Coverage' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
                  {genome.coverage}
                </span>
                <span>•</span>
                <span>{genome.completeness}</span>
              </div>
              <span className="text-xs">
                Modified {genome.lastModified}
              </span>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  };

export default GenomeCard;