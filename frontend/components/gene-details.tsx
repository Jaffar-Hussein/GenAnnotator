import React from 'react';
import { Check, Copy } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
// import AnnotationButtons from './AnnotationButtons';
import  SequenceTrackViewer from '@/components/sequence-viewer';
const GeneDetails = ({ 
  selectedGene, 
  onClose, 
  onCopySequence,
  isCopied = false,
  viewportStart,
  viewportSize 
}) => {
  if (!selectedGene) return null;

  return (
    <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-indigo-800 dark:to-indigo-900">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {selectedGene.name}
            </h2>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm text-white">
                ID: {selectedGene.gene_instance || "AAN78502"}
              </span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm text-white">
                Type: {selectedGene.gene_biotype || "protein_coding"}
              </span>
              <div className="flex items-center gap-2">
                {selectedGene.annotated ? (
                  <span className="px-3 py-1 bg-green-500/20 rounded-full text-sm text-white flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    Annotated
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-yellow-500/20 rounded-full text-sm text-white flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    Annotation Pending
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 text-white transition-colors"
            aria-label="Close gene details"
          >
            <span className="text-xl">×</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Key Information Panel */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-indigo-500 rounded-full"></span>
                  Key Information
                </h3>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Gene Symbol</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {selectedGene.gene_symbol || "No gene symbol provided."}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Transcript Biotype</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {selectedGene.transcript_biotype || "protein_coding"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {selectedGene.description || "Hypothetical protein"}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="lg:col-span-2">
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-indigo-500 rounded-full"></span>
                Location & Metrics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Start Position</span>
                    <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                      {selectedGene.start?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">End Position</span>
                    <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                      {selectedGene.end?.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Length</span>
                    <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                      {((selectedGene.end || 0) - (selectedGene.start || 0) + 1).toLocaleString()} bp
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Feature Type</span>
                    <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                      {selectedGene.header?.split(" ")[1] || "Unknown"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sequence Information */}
            <div className="mt-6 bg-gray-900 dark:bg-black rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-white">Sequence Information</h4>
                <button
                  onClick={onCopySequence}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg
                  bg-indigo-600 hover:bg-indigo-700 text-white transition-colors duration-200"
                >
                  {isCopied ? (
                    <>
                      <Check size={16} />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      <span>Copy Sequence</span>
                    </>
                  )}
                </button>
              </div>
              <div className="bg-gray-800 dark:bg-gray-900 rounded-lg p-4">
                <div className="overflow-x-auto max-h-48">
                  <code className="text-sm leading-relaxed text-gray-200 dark:text-gray-300 font-mono whitespace-pre-wrap break-all block">
                    {selectedGene.sequence}
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Annotation Buttons */}
        {/* <AnnotationButtons selectedGene={selectedGene} /> */}

        {/* Sequence Track Viewer */}
        <div className="mt-6">
          <SequenceTrackViewer
            sequence={selectedGene.sequence}
            title={selectedGene.name}
          />
        </div>
      </div>
    </div>
  );
};

export default GeneDetails;