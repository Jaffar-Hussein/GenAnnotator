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
import BiotypeSearch from "@/components/biotype-inputs";
import StrandSelector from "@/components/strand-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAnnotationForm } from "@/hooks/useSubmitAnnotations";
import { useBanner } from "@/components/Banner";
const GeneAnnotationPage = ({
  params,
}: {
  params: Promise<{ gene: string }>;
}) => {
  const { gene } = use(params);
  const { showBanner } = useBanner();
  const [annotationStatus, setAnnotationStatus] = useState("draft");
  const { geneData, annotation } = useGeneData(gene);
  const currentAnnotation = annotation?.gene?.[0] || {
    gene_instance: "",
    strand: 1,
    gene: "No gene provided.",
    gene_biotype: "No gene biotype provided.",
    transcript_biotype: "No transcript biotype provided.",
    gene_symbol: "No gene symbol provided.",
    description: "No description provided.",
  };

  const {
    formData,
    setFormData,
    loading,
    saving,
    error,
    success,
    saveDraft,
    submitForReview,
  } = useAnnotationForm(gene);

  // Handle form field changes
  const handleFormChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle draft save
  const handleSaveDraft = async () => {
    try {
      await saveDraft();
      showBanner("Draft saved successfully", "success", 3000);
      setAnnotationStatus("draft");
    } catch (err) {
      showBanner(
        err instanceof Error ? err.message : "Failed to save draft",
        "error",
        5000
      );
    }
  };

  // Handle submission
  const handleSubmit = async () => {
    try {
      await submitForReview();
      showBanner(
        "Annotation submitted for review successfully",
        "success",
        3000
      );
      setAnnotationStatus("pending_review");
    } catch (err) {
      showBanner(
        err instanceof Error ? err.message : "Failed to submit annotation",
        "error",
        5000
      );
    }
  };

  // Update your buttons section
  const renderActionButtons = () => (
    <div className="space-x-4">
      <Button
        variant="outline"
        onClick={handleSaveDraft}
        disabled={saving || loading}
        className="gap-2 border-slate-200 dark:border-slate-700 
                   bg-white hover:bg-slate-100 
                   dark:bg-slate-800 dark:hover:bg-slate-700
                   text-slate-700 dark:text-slate-300
                   hover:text-slate-900 dark:hover:text-slate-100
                   transition-colors duration-200"
      >
        <Save
          size={16}
          className={`${saving ? "animate-pulse" : ""} 
                      transition-colors duration-200`}
        />
        {saving ? "Saving..." : "Save Draft"}
      </Button>

      <Button
        onClick={handleSubmit}
        disabled={saving || loading}
        className="gap-2 
                   bg-gradient-to-r from-indigo-600 to-indigo-600 
                   hover:from-indigo-700 hover:to-indigo-700
                   dark:from-indigo-500 dark:to-indigo-500
                   dark:hover:from-indigo-600 dark:hover:to-indigo-600
                   text-white
                   shadow-sm hover:shadow
                   transition-all duration-200
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Send
          size={16}
          className={`${loading ? "animate-pulse" : ""}
                      transition-transform group-hover:translate-x-0.5
                      duration-200`}
        />
        {loading ? "Submitting..." : "Submit Annotation"}
      </Button>
    </div>
  );
  const renderFormInputs = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Gene Instance</Label>
          <Input
            value={currentAnnotation.gene_instance || ""}
            onChange={(e) => handleFormChange("gene_instance", e.target.value)}
            placeholder={currentAnnotation.gene_instance}
            disabled
          />
        </div>
        <div>
          <Label>Gene</Label>
          <Input
            value={formData.gene || ""}
            onChange={(e) => handleFormChange("gene", e.target.value)}
            placeholder={currentAnnotation.gene}
          />
        </div>
        <div>
          <Label>Gene Symbol</Label>
          <Input
            value={formData.gene_symbol || ""}
            onChange={(e) => handleFormChange("gene_symbol", e.target.value)}
            placeholder={currentAnnotation.gene_symbol}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <BiotypeSearch
            value={formData.gene_biotype || ""}
            onChange={(value) => handleFormChange("gene_biotype", value)}
            label="Gene Biotype"
            required={true}
          />
        </div>
        <div>
          <BiotypeSearch
            value={formData.transcript_biotype || ""}
            onChange={(value) => handleFormChange("transcript_biotype", value)}
            label="Transcript Biotype"
            required={true}
          />
        </div>
        <div>
          <StrandSelector
            value={formData.strand}
            onChange={(value) => handleFormChange("strand", value)}
            label="Strand"
            required={true}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={formData.description || ""}
          onChange={(e) => handleFormChange("description", e.target.value)}
          placeholder={currentAnnotation.description}
          className="h-24"
        />
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-4 max-w-6xl space-y-6">
      {/* Header with gene info and actions */}

      <div
        className="bg-white dark:bg-slate-800 rounded-xl p-6 
                shadow-sm hover:shadow-md
                border border-slate-200 dark:border-slate-700
                transition-all duration-200"
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            {/* Icon container with gradient background */}
            <div
              className="rounded-full p-3
                      bg-gradient-to-br from-indigo-50 to-indigo-100 
                      dark:from-indigo-900/50 dark:to-indigo-900/50 
                      text-indigo-600 dark:text-indigo-400
                      shadow-sm"
            >
              <Dna className="h-6 w-6" />
            </div>

            {/* Text content */}
            <div className="space-y-1">
              <h1
                className="text-2xl font-bold 
                       text-slate-900 dark:text-slate-100
                       flex items-center gap-2"
              >
                Gene:
                <span className="text-indigo-700 dark:text-indigo-400">
                  {geneData?.name}
                </span>
              </h1>

              <div className="flex items-center gap-3">
                <Badge
                  variant="secondary"
                  className={`px-3 py-1 rounded-full font-medium
              ${
                annotationStatus === "draft"
                  ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
                  : annotationStatus === "pending_review"
                  ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                  : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
              } border-0`}
                >
                  {annotationStatus}
                </Badge>

                <span className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Clock className="h-4 w-4" />
                  Last updated 2 hours ago
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-x-4">{renderActionButtons()}</div>
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
                  <PfamAnalysis peptide={geneData?.name} />
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
          {/* <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Gene Instance
                </Label>
                <Input
                  type="text"
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                  name="gene_instance"
                  placeholder={currentAnnotation.gene_instance}
                />
              </div>
              <div>
                <Label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Gene
                </Label>
                <Input
                  type="text"
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                  name="gene"
                  placeholder={currentAnnotation.gene}
                />
              </div>
              <div>
                <Label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Gene Symbol
                </Label>
                <Input
                  type="text"
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                  name="gene_symbol"
                  placeholder={currentAnnotation.gene_symbol}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Transcript Biotype
              </label>
              <select
                className="w-full p-2 rounded-lg border border-slate-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                name="transcript_biotype"
                placeholder={currentAnnotation.transcript_biotype}
              >
                <option value="">Select Biotype</option>
                <option value="protein_coding">Protein Coding</option>
                <option value="pseudogene">Pseudogene</option>
                <option value="ncRNA">ncRNA</option>
              </select>

              <div>
                <BiotypeSearch
                  value={geneBiotype}
                  onChange={setGeneBiotype}
                  label="Gene Biotype"
                  required={true}
                />
              </div>
              <div>
                <BiotypeSearch
                  value={transcriptBiotype}
                  onChange={setTranscriptBiotype}
                  label="Transcript Biotype"
                  required={true}
                />
              </div>

              <div>
                <StrandSelector
                  value={strand}
                  onChange={setStrand}
                  label="Strand"
                  required={true}
                />
              </div>
            </div>

            <div>
              <Label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Description
              </Label>
              <Textarea
                className="w-full p-2 rounded-lg border border-slate-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 h-24"
                name="description"
                placeholder={currentAnnotation.description}
              ></Textarea>
            </div>
          </div> */}
          {renderFormInputs()}
        </CardContent>
      </Card>
    </div>
  );
};

export default GeneAnnotationPage;
