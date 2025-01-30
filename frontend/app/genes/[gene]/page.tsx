'use client';

import { useState, useEffect,use } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import GeneDetails from "@/components/gene-details";
import { useGeneData } from '@/hooks/useGeneData';
import { Loader2, AlertCircle, XCircle } from 'lucide-react';
import Toast from '@/components/toast-component';

export default function Page(  { params }: { params: Promise<{ gene: string }> }
) {
    const { gene } = use(params);
    const selectedGene = gene
    const [toast, setToast] = useState({
        show: false,
        type: 'info',
        title: '',
        message: '',
        badges: []
    });
    
    const { 
        geneData, 
        annotation, 
        loading, 
        error 
    } = useGeneData(selectedGene);

    const showToast = (config) => {
        setToast({ show: true, ...config });
    };

    const handleCopySequence = async () => {
        if (geneData?.sequence) {
            try {
                await navigator.clipboard.writeText(geneData.sequence);
                showToast({
                    type: 'success',
                    title: 'Sequence Copied',
                    message: 'Gene sequence has been copied to clipboard',
                    badges: ['Copied', `${geneData.sequence.length} bp`]
                });
            } catch (err) {
                showToast({
                    type: 'error',
                    title: 'Copy Failed',
                    message: 'Failed to copy sequence to clipboard'
                });
            }
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                <div className="max-w-7xl mx-auto px-6 py-32">
                    <div className="flex flex-col items-center justify-center text-center">
                        <div className="h-12 w-12 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mb-4">
                            <Loader2 className="h-6 w-6 animate-spin text-violet-500 dark:text-violet-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                            Loading Gene Data
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400">
                            Please wait while we fetch the gene information
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                <div className="max-w-7xl mx-auto px-6 py-32">
                    <div className="flex flex-col items-center justify-center text-center">
                        <div className="h-12 w-12 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                            <XCircle className="h-6 w-6 text-red-500 dark:text-red-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                            Error Loading Gene
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-6">
                            {error}. Please try again later or contact support if the issue persists.
                        </p>
                        <Alert variant="destructive" className="max-w-md bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800/60">
                            <AlertDescription className="text-sm">
                                {error}
                            </AlertDescription>
                        </Alert>
                    </div>
                </div>
            </div>
        );
    }

    // No data state
    if (!geneData) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                <div className="max-w-7xl mx-auto px-6 py-32">
                    <div className="flex flex-col items-center justify-center text-center">
                        <div className="h-12 w-12 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
                            <AlertCircle className="h-6 w-6 text-amber-500 dark:text-amber-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                            No Gene Data Found
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-6">
                            No gene data available for {selectedGene}. Please verify the gene identifier.
                        </p>
                        <Alert className="max-w-md bg-white dark:bg-gray-800 border border-slate-200 dark:border-slate-700/60">
                            <AlertDescription className="text-sm text-slate-600 dark:text-slate-400">
                                The requested gene identifier could not be found in our database.
                            </AlertDescription>
                        </Alert>
                    </div>
                </div>
            </div>
        );
    }

    // Enrich gene data with annotations
    const enrichedGeneData = {
        ...geneData,
        gene_symbol: annotation?.gene[0]?.gene_symbol || 'No symbol available',
        transcript_biotype: annotation?.gene[0]?.transcript_biotype || 'Unknown biotype',
        description: annotation?.gene[0]?.description || 'No description available',
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
            {/* Toast Notifications */}
            <Toast
                show={toast.show}
                type={toast.type}
                title={toast.title}
                message={toast.message}
                badges={toast.badges}
                onClose={() => setToast(prev => ({ ...prev, show: false }))}
            />

            {/* Main Content */}
            <GeneDetails
                selectedGene={enrichedGeneData}
                onCopySequence={handleCopySequence}
                viewportStart={geneData.start}
                viewportSize={1000}
            />
        </div>
    );
}