import React, { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ChevronDown, 
  Dna, 
  ArrowRight,
  ArrowUpDown,
  
  ArrowLeftRight,
  HelpCircle,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MotionTableRow = motion(TableRow);

const StrandIcon = ({ strand }) => {
  switch(strand) {
    case 'Plus':
      return <ArrowRight className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />;
    case 'Minus':
      return <ArrowLeft className="h-4 w-4 text-rose-500 dark:text-rose-400" />;
    case 'both':
      return <ArrowLeftRight className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />;
    default:
      return <HelpCircle className="h-4 w-4 text-slate-400 dark:text-slate-500" />;
  }
};

const BlastResultsTable = ({ hits, showAllHits, setShowAllHits }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const totalHits = hits.length;

  // Sort hits based on current configuration
  const sortedHits = useMemo(() => {
    const sortedData = [...(showAllHits ? hits : hits.slice(0, 10))];
    if (!sortConfig.key) return sortedData;

    return sortedData.sort((a, b) => {
      let aValue, bValue;
      
      switch(sortConfig.key) {
        case 'identity':
          aValue = (a.hsps[0].identity/a.hsps[0].align_len) * 100;
          bValue = (b.hsps[0].identity/b.hsps[0].align_len) * 100;
          break;
        case 'evalue':
          aValue = a.hsps[0].evalue;
          bValue = b.hsps[0].evalue;
          break;
        case 'bitscore':
          aValue = a.hsps[0].bit_score;
          bValue = b.hsps[0].bit_score;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [hits, sortConfig, showAllHits]);

  const requestSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction: 
        prevConfig.key === key && prevConfig.direction === 'asc' 
          ? 'desc' 
          : 'asc',
    }));
  };

  const SortableHeader = ({ column, label }) => (
    <TableHead 
      onClick={() => requestSort(column)}
      className="cursor-pointer group text-slate-700 dark:text-slate-300 text-sm font-semibold py-4"
    >
      <div className="flex items-center gap-1">
        {label}
        <ArrowUpDown className={`h-4 w-4 transition-colors ${
          sortConfig.key === column
            ? 'text-indigo-500 dark:text-indigo-400'
            : 'text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400'
        }`} />
      </div>
    </TableHead>
  );

  const RegularHeader = ({ label }) => (
    <TableHead className="text-slate-700 dark:text-slate-300 text-sm font-semibold py-4">
      {label}
    </TableHead>
  );

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-sm border border-slate-200/60 dark:border-gray-700/60 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-slate-200/60 dark:border-gray-700/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <Dna className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                BLAST Hits
              </h3>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Showing {sortedHits.length} of {totalHits}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200 dark:border-slate-700">
                <RegularHeader label="Organism" />
                <SortableHeader column="identity" label="Identity" />
                <SortableHeader column="evalue" label="E-value" />
                <SortableHeader column="bitscore" label="Bit Score" />
                <RegularHeader label="Strand" />
                <RegularHeader label="Query Range" />
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="wait">
                {sortedHits.map((hit, index) => {
                  const hsp = hit.hsps[0];
                  const desc = hit.description[0];
                  const identity = ((hsp.identity/hsp.align_len) * 100);
                  
                  return (
                    <MotionTableRow
                      key={desc.id}
                      className="border-slate-200/60 dark:border-slate-700/60 
                        hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                      <TableCell className="font-medium text-slate-900 dark:text-slate-200">
                        {desc.sciname}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary"
                          className={`
                            ${identity >= 90 
                              ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800' 
                              : identity >= 70
                                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                                : 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800'
                            }
                            font-medium
                          `}
                        >
                          {identity.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-700 dark:text-slate-300 font-mono">
                        {hsp.evalue.toExponential(2)}
                      </TableCell>
                      <TableCell className="text-slate-700 dark:text-slate-300">
                        {hsp.bit_score.toFixed(1)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-start gap-1.5">
                          <StrandIcon strand={hsp.hit_strand} />
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {hsp.hit_strand || 'unknown'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-slate-700 dark:text-slate-300">
                        {hsp.query_from}-{hsp.query_to}
                      </TableCell>
                    </MotionTableRow>
                  );
                })}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>

        {hits.length > 10 && (
          <div className="mt-4 flex justify-center">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={() => setShowAllHits(!showAllHits)}
                variant="outline"
                className="group px-6 py-2 bg-white dark:bg-gray-800 border-slate-200 
                  dark:border-slate-700 text-slate-600 dark:text-slate-400
                  hover:bg-slate-50 dark:hover:bg-slate-700/50
                  hover:border-indigo-300 dark:hover:border-indigo-700
                  shadow-sm hover:shadow transition-all duration-200"
              >
                <ChevronDown 
                  className={`h-4 w-4 mr-2 text-slate-400 group-hover:text-indigo-500 
                    dark:text-slate-500 dark:group-hover:text-indigo-400 
                    transition-transform duration-200 ${showAllHits ? 'rotate-180' : ''}`}
                />
                {showAllHits ? 'Show Less' : `Show All ${totalHits} Hits`}
              </Button>
            </motion.div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default BlastResultsTable;