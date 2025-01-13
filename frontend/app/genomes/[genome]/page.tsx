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
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <GenomeViewer genomeName={genome} />
        </div>
    );
}