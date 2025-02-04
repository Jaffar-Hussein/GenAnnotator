'use client'

import GenomeViewer from "@/components/genome-viewer";
import { use } from "react";

interface Params {
    genome: string;
}

export default function GenomesPage(
    { params }: { params: Promise<{ genome: string }> }
) {
    const { genome } = use(params);
    
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
            <div className="max-w-7xl mx-auto px-6 py-8">
                <GenomeViewer genomeName={genome} />
            </div>
        </div>
    );
}