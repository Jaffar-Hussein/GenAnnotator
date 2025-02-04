import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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
} from 'lucide-react';
import BlastResultsTable from '@/components/blast-results-table';

interface BlastHsp {
  bit_score?: number;
  score?: number;
  evalue: number;
  identity: number;
  align_len: number;
  gaps?: number;
  query_from?: number;
  query_to?: number;
  hit_from?: number;
  hit_to?: number;
  hit_strand?: string;
}

interface BlastDescription {
  id?: string;
  accession?: string;
  title?: string;
  taxid?: number;
  sciname: string;
}

interface BlastHit {
  num?: number;
  description: BlastDescription[];
  len?: number;
  hsps: BlastHsp[];
}

interface BlastSearch {
  query_len: number;
  hits: BlastHit[];
}

interface BlastResultsProps {
  search: BlastSearch;
  onShare?: () => void;
  onExport?: () => void;
  onOpenNCBI?: () => void;
  className?: string;
}

const BlastResultsComponent: React.FC<BlastResultsProps> = ({
  search,
  onShare,
  onExport,
  onOpenNCBI,
  className = '',
}) => {
  const [showAllHits, setShowAllHits] = useState(false);

  const firstHit = search.hits[0]?.hsps[0];
  const totalHits = search.hits.length;

  // Calculate organism distribution
  const organismData = search.hits
    .reduce((acc: { name: string; value: number }[], hit) => {
      const organism = hit.description[0].sciname;
      const existingItem = acc.find((item) => item.name === organism);
      if (existingItem) {
        existingItem.value++;
      } else {
        acc.push({ name: organism, value: 1 });
      }
      return acc;
    }, [])
    .sort((a, b) => b.value - a.value);

  const formatEValue = (evalue: number) => {
    return evalue === 0 ? '0.0' : evalue.toExponential(2);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex justify-between items-start gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                BLAST Analysis Results
              </h1>
              <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                Analyzing {search.query_len} base pairs sequence match results
              </p>
            </div>
            <div className="flex gap-2">
              {onShare && (
                <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={onShare}>
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              )}
              {onExport && (
                <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={onExport}>
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              )}
              {onOpenNCBI && (
                <Button variant="default" size="sm" className="flex items-center gap-2" onClick={onOpenNCBI}>
                  <ExternalLink className="h-4 w-4" />
                  Open in NCBI
                </Button>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[
              {
                icon: Dna,
                label: 'Sequence Length',
                value: `${search.query_len} bp`,
              },
              {
                icon: Database,
                label: 'Best Match',
                value: firstHit ? `${((firstHit.identity / firstHit.align_len) * 100).toFixed(1)}%` : 'N/A',
              },
              {
                icon: Search,
                label: 'E-value',
                value: firstHit ? formatEValue(firstHit.evalue) : 'N/A',
              },
              {
                icon: BarChart,
                label: 'Total Matches',
                value: totalHits,
              },
            ].map((stat, index) => (
              <Card key={index} className="bg-white dark:bg-gray-800">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                      <stat.icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            {/* Top Section: Table and Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* BLAST Results Table */}
              <div className="lg:col-span-7">
                <BlastResultsTable
                  hits={search.hits}
                  showAllHits={showAllHits}
                  setShowAllHits={setShowAllHits}
                />
              </div>

              {/* Distribution Section */}
              <div className="lg:col-span-5">
                <Card className="bg-white dark:bg-gray-800">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                        <Database className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                      </div>
                      <div>
                        <CardTitle>Species Distribution</CardTitle>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Top matches by organism
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {organismData.slice(0, 5).map((item, index) => (
                        <div key={item.name} className="relative">
                          <div className="flex items-start justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                                {index + 1}
                              </span>
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {item.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {((item.value / totalHits) * 100).toFixed(1)}% of total hits
                                </p>
                              </div>
                            </div>
                            <Badge
                              variant="secondary"
                              className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                            >
                              {item.value} hits
                            </Badge>
                          </div>
                          <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(item.value / totalHits) * 100}%` }}
                              transition={{ duration: 0.5, delay: index * 0.1 }}
                              className="h-full bg-indigo-500 dark:bg-indigo-400 rounded-full"
                            />
                          </div>
                        </div>
                      ))}
                      {organismData.length > 5 && (
                        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                            <span>Other organisms</span>
                            <span>
                              {organismData.slice(5).reduce((sum, item) => sum + item.value, 0)} hits
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlastResultsComponent;