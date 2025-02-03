"use client";
import React, { useState, use } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Save, Send, Eye, Database, Dna, Clock } from "lucide-react";
import SequenceDisplay from "@/components/sequence-display-text";
import GenomeViewer from "@/components/genome-viewer";
import BlastAnalysis from "@/components/blast_results_wrapper";
import PfamAnalysis from "@/components/pfam_results";
import { useGeneData } from "@/hooks/useGeneData";
const GeneAnnotationPage = ({
  params,
}: {
  params: Promise<{ gene: string }>;
}) => {
  const { gene } = use(params);
  const [activeTab, setActiveTab] = useState("viewer");
  const [annotationStatus, setAnnotationStatus] = useState("draft");
  const { geneData, annotation, loading, error, refetch } =
    useGeneData(gene);


  return (
    <div className="container mx-auto p-4 max-w-6xl space-y-6">
      {/* Header with gene info and actions */}
      <div className=" rounded-lg p-6 shadow-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="rounded-full p-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
              <Dna className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">
                Gene: {geneData?.name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant="secondary"
                  className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-0"
                >
                  {annotationStatus}
                </Badge>
                <span className="text-indigo-600 dark:text-indigo-300">
                  Last updated 2 hours ago
                </span>
              </div>
            </div>
          </div>
          <div className="space-x-4">
            <Button
              variant="outline"
              className="gap-2 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900"
            >
              <Save size={16} />
              Save Draft
            </Button>
            <Button className="gap-2 bg-gradient-to-r from-indigo-600 to-indigo-600 hover:from-indigo-700 hover:to-indigo-700">
              <Send size={16} />
              Submit Annotation
            </Button>
          </div>
        </div>
      </div>

      {/* Main content area with tabs */}
      <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all border dark:border-gray-700">
        <CardHeader>
          <Tabs defaultValue="viewer" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="viewer" className="gap-2">
                <Eye size={16} />
                Sequence Viewer
              </TabsTrigger>
              <TabsTrigger value="genome" className="gap-2">
                <Dna size={16} />
                Genome Browser
              </TabsTrigger>
              <TabsTrigger value="pfam" className="gap-2">
                <Database size={16} />
                PFAM Analysis
              </TabsTrigger>
              <TabsTrigger value="blast" className="gap-2">
                <Database size={16} />
                BLAST Results
              </TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <TabsContent value="viewer">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-slate-200 dark:border-gray-700">
                  <SequenceDisplay sequence={geneData?.sequence} />
                </div>
              </TabsContent>

              <TabsContent value="genome">
                <GenomeViewer genomeName={geneData?.genome} />
              </TabsContent>

              <TabsContent value="pfam">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-slate-200 dark:border-gray-700">
                  <PfamAnalysis peptide={geneData?.name}/>
                </div>
              </TabsContent>

              <TabsContent value="blast">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-slate-200 dark:border-gray-700">
                  <BlastAnalysis gene={geneData?.name} />  
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardHeader>
      </Card>

      {/* Annotation form area */}
      <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all border dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Annotation Details
            <Badge
              variant="secondary"
              className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-0"
            >
              Required
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Gene Instance
                </label>
                <input
                  type="text"
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                  name="gene_instance"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Gene
                </label>
                <input
                  type="text"
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                  name="gene"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Gene Symbol
                </label>
                <input
                  type="text"
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                  name="gene_symbol"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Gene Biotype
                </label>
                <select
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                  name="gene_biotype"
                >
                  <option value="">Select Biotype</option>
                  <option value="protein_coding">Protein Coding</option>
                  <option value="pseudogene">Pseudogene</option>
                  <option value="ncRNA">ncRNA</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Transcript Biotype
                </label>
                <select
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                  name="transcript_biotype"
                >
                  <option value="">Select Biotype</option>
                  <option value="protein_coding">Protein Coding</option>
                  <option value="pseudogene">Pseudogene</option>
                  <option value="ncRNA">ncRNA</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Strand
                </label>
                <select
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                  name="strand"
                  defaultValue="1"
                >
                  <option value="1">Forward (+1)</option>
                  <option value="-1">Reverse (-1)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                className="w-full p-2 rounded-lg border border-slate-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 h-24"
                name="description"
              ></textarea>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeneAnnotationPage;
