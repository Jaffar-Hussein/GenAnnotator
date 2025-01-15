import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { Database, ArrowRight, Activity, Dna, Calendar } from 'lucide-react';

const GenomeListView = ({ genomes }) => {
  const getStatusStyles = (status) => {
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
    <Card className="border-indigo-200/20 dark:border-indigo-800/20">
      <div className="divide-y divide-indigo-100 dark:divide-indigo-800/20">
        {genomes.map((genome) => (
          <Link 
            key={genome.id} 
            href={`/genomes/${genome.id}`}
            className="block group focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-lg"
          >
            <div className="flex items-center gap-6 p-6 transition-colors hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20">
              {/* Icon Section */}
              <div className="shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-50 dark:from-indigo-900/50 dark:to-indigo-800/30 flex items-center justify-center shadow-sm group-hover:shadow transition-shadow">
                <Database className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              </div>

              {/* Content Section */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors truncate">
                      {genome.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
                      {genome.species} • {genome.header ? genome.header.split(' ')[0] : ''}
                    </p>
                  </div>
                  <Badge 
                    variant="secondary"
                    className={`shrink-0 ${getStatusStyles(genome.status)}`}
                  >
                    {genome.status}
                  </Badge>
                </div>

                {/* Stats Section */}
                <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <Dna className="h-4 w-4 text-indigo-500" />
                    <span>{genome.basePairs.toLocaleString()} bp</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <Activity className="h-4 w-4 text-indigo-500" />
                    <span>GC: {genome.gcPercentage}</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <span className={
                      genome.coverage === 'Full Coverage' 
                        ? 'text-emerald-600 dark:text-emerald-400' 
                        : 'text-amber-600 dark:text-amber-400'
                    }>
                      {genome.coverage}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <Calendar className="h-4 w-4" />
                                        <span className="text-xs">
                      Modified {genome.lastModified && genome.lastModified !== 'N/A' ? genome.lastModified : '0 days ago'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Arrow Section */}
              <div className="shrink-0 flex items-center self-center">
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-500 dark:text-gray-600 dark:group-hover:text-indigo-400 transform group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
};

export default GenomeListView;