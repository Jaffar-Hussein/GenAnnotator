import React, { useEffect, useState } from 'react';
import { Check, Copy, Dna, Info } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import SequenceTrackViewer from '@/components/sequence-viewer';
import SequenceDisplay from '@/components/sequence-display-text';

interface GeneDetailsProps {
  selectedGene: any;
  onCopySequence: () => void;
  isCopied?: boolean;
  viewportStart: number;
  viewportSize: number;
}

const GeneDetails: React.FC<GeneDetailsProps> = ({ 
  selectedGene, 
  onCopySequence,
  isCopied = false,
  viewportStart,
  viewportSize 
}) => {
  if (!selectedGene) return null;
  
  const { accessToken } = useAuthStore.getState();
  const [annotation, setAnnotation] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAnnotation = async () => {
      const gene = selectedGene.name;
      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/data/api/annotation/?gene_instance=${gene}/`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        const data = await response.json();
        if (!response.ok) throw new Error('Failed to fetch annotation');
        setAnnotation(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnotation();
  }, [selectedGene, accessToken]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
      {/* Hero Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-slate-200/60 dark:border-gray-700/60">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <Dna className="h-6 w-6 text-indigo-500 dark:text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
                  {selectedGene.name}
                </h1>
                {selectedGene.annotated && (
                  <span className="inline-flex items-center px-2 py-1 text-sm text-emerald-700 dark:text-emerald-400">
                    <Check size={14} className="mr-1.5" />
                    Annotated
                  </span>
                )}
              </div>
              <p className="text-slate-600 dark:text-slate-300 mt-1">
                {selectedGene.gene_symbol || 'No symbol available'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            ['Start Position', selectedGene.start?.toLocaleString()],
            ['End Position', selectedGene.end?.toLocaleString()],
            ['Sequence Length', `${((selectedGene.end || 0) - (selectedGene.start || 0) + 1).toLocaleString()} bp`],
            ['Gene Type', selectedGene.header?.split(" ")[1]]
          ].map(([label, value]) => (
            <div key={label} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-slate-200/60 dark:border-gray-700/60">
              <dt className="text-sm text-slate-500 dark:text-slate-400">{label}</dt>
              <dd className="mt-1 text-lg font-medium text-slate-900 dark:text-white">{value || 'N/A'}</dd>
            </div>
          ))}
        </div>

        {/* Interactive Sequence Viewer */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-slate-200/60 dark:border-gray-700/60">
          <div className="p-6 border-b border-slate-200/60 dark:border-gray-700/60 bg-gradient-to-r from-slate-50 to-white dark:from-gray-800 dark:to-gray-800/50">
            <div className="flex items-start space-x-3">
              <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <Dna className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Sequence Viewer</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">Interactive visualization of the gene sequence</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <SequenceTrackViewer
              sequence={selectedGene.sequence}
              title={selectedGene.name}
              startPosition={selectedGene.start}
            />
          </div>
        </div>

        {/* DNA Sequence */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-slate-200/60 dark:border-gray-700/60">
          <div className="p-6 border-b border-slate-200/60 dark:border-gray-700/60 bg-gradient-to-r from-slate-50 to-white dark:from-gray-800 dark:to-gray-800/50">
            <div className="flex justify-between items-center">
              <div className="flex items-start space-x-3">
                <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                  <Dna className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">DNA Sequence</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Full sequence data</p>
                </div>
              </div>
              <button
                onClick={onCopySequence}
                className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                {isCopied ? (
                  <>
                    <Check size={16} className="mr-1.5" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy size={16} className="mr-1.5" />
                    Copy Sequence
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="bg-slate-50 dark:bg-gray-800/50 rounded-lg p-4 w-full">
              <SequenceDisplay sequence={selectedGene.sequence || ''} />
            </div>
          </div>
        </div>

        {/* Description Section */}
        {selectedGene.description && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-slate-200/60 dark:border-gray-700/60">
            <div className="p-6">
              <div className="flex items-start space-x-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                  <Info className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Description</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-4">
                    {selectedGene.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeneDetails;