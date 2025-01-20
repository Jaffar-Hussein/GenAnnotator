import React from 'react';
import { Card } from "@/components/ui/card";
import Link from 'next/link';
import { 
  Dna, 
  ArrowRight, 
  Hammer,
  FlaskConical,
  Copy,
  Database,
  Map
} from 'lucide-react';

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

const PeptideList = ({ peptides }) => {
  return (
    <Card className="border-indigo-200/20 dark:border-indigo-800/20 bg-white dark:bg-gray-800">
      <div className="divide-y divide-indigo-100 dark:divide-indigo-800/20">
        {peptides.map((peptide) => (
          <PeptideListItem key={peptide.name} peptide={peptide} />
        ))}
      </div>
    </Card>
  );
};

const PeptideListItem = ({ peptide }) => {
  const copySequence = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(peptide.sequence);
  };

  const getCompositionScore = (sequence) => {
    const uniqueAminoAcids = new Set(sequence).size;
    return (uniqueAminoAcids / sequence.length) * 100;
  };

  const compositionScore = getCompositionScore(peptide.sequence);
  const headerInfo = peptide.header ? parseHeader(peptide.header) : null;

  return (
    <Link 
      href={`/peptides/${peptide.name}`}
      className="block group focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-lg"
    >
      <div className="flex items-center gap-6 p-6 transition-colors hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20">
        {/* Icon Section */}
        <div className="shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-50 dark:from-indigo-900/50 dark:to-indigo-800/30 flex items-center justify-center shadow-sm group-hover:shadow transition-shadow">
          <Dna className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
        </div>

        {/* Content Section */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors truncate">
                {peptide.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
                {peptide.gene}
              </p>
            </div>
            
            {/* Sequence with Copy Button */}
            <div className="flex items-center gap-2">
              <div className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                {peptide.sequence.substring(0, 15)}...
              </div>
              <button
                onClick={copySequence}
                className="p-1.5 rounded-md text-gray-500 hover:text-indigo-600 
                         hover:bg-indigo-50 dark:hover:bg-indigo-900/50 
                         dark:text-gray-400 dark:hover:text-indigo-300
                         transition-colors"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <Hammer className="h-4 w-4 text-indigo-500" />
              <span>Composition: {compositionScore.toFixed(1)}%</span>
            </div>

            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <FlaskConical className="h-4 w-4 text-indigo-500" />
              <span>{peptide.length} aa</span>
            </div>

            {headerInfo && (
              <>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <Database className="h-4 w-4 text-indigo-500" />
                  <span>{headerInfo.id}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <Map className="h-4 w-4 text-indigo-500" />
                  <span>
                    {headerInfo.chromosome} ({headerInfo.start.toLocaleString()} - {headerInfo.end.toLocaleString()})
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Arrow Section */}
        <div className="shrink-0 flex items-center self-center">
          <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-500 dark:text-gray-600 dark:group-hover:text-indigo-400 transform group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </Link>
  );
};

export default PeptideList;