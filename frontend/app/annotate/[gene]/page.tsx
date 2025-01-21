"use client";
import { use } from "react";
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { HelpCircle, Save, ArrowLeft, Send, Loader2, Dna, ChevronRight, Pencil } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAnnotationForm } from '@/hooks/useSubmitAnnotations';

interface FormFieldProps {
  label: string;
  name: string;
  tooltip?: string;
  children: React.ReactNode;
}

export default function AnnotationForm({ params }: { params: { gene: string } }) {
  const router = useRouter();
  const { gene } = use(params);
  
  const {
    formData,
    setFormData,
    loading,
    saving,
    error,
    success,
    saveDraft,
    submitAnnotation
  } = useAnnotationForm(gene);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (value: string, name: keyof typeof formData) => {
    setFormData(prev => ({
      ...prev,
      [name]: name === 'strand' ? parseInt(value) : value
    }));
  };

  const FormField = ({ label, name, tooltip, children }: FormFieldProps) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor={name} className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {label}
        </Label>
        {tooltip && (
          <div className="group relative">
            <HelpCircle className="h-4 w-4 text-slate-400 hover:text-slate-600 transition-colors dark:text-slate-500" />
            <span className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 rounded-lg bg-slate-800 px-3 py-2 text-sm text-white shadow-lg group-hover:block w-48 z-50">
              {tooltip}
            </span>
          </div>
        )}
      </div>
      {children}
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-violet-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Loader2 className="h-12 w-12 animate-spin text-violet-500 dark:text-violet-400" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto p-6 max-w-5xl">
        {/* Navigation breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center space-x-2 mb-8 text-sm text-slate-600 dark:text-slate-400"
        >
          <Button 
            variant="ghost" 
            onClick={() => router.push('/my-annotations')}
            className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            All Annotations
          </Button>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium">Gene Annotation</span>
        </motion.div>
  
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <motion.div 
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.5 }}
            className="h-16 w-16 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto mb-6"
          >
            <Pencil className="h-8 w-8 text-violet-500 dark:text-violet-400" />
          </motion.div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Annotate Gene: {gene}
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Add functional annotations and metadata for this sequence to contribute to our genomic database
          </p>
        </motion.div>
  
        {/* Main Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm">
            <CardContent className="p-8">
              <form onSubmit={(e) => e.preventDefault()} className="space-y-10">
                {/* Gene Details Section */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="rounded-xl bg-white dark:bg-gray-800/80 p-6 border border-slate-200/60 dark:border-gray-700/60 shadow-sm"
                >
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">Gene Details</h2>
                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField label="Gene" name="gene" required>
                      <Input
                        id="gene"
                        name="gene"
                        value={formData.gene || ''}
                        onChange={handleChange}
                        className="border-slate-200 dark:border-gray-700 dark:bg-gray-800/80"
                        required
                      />
                    </FormField>
  
                    <FormField label="Gene Symbol" name="gene_symbol" required>
                      <Input
                        id="gene_symbol"
                        name="gene_symbol"
                        value={formData.gene_symbol || ''}
                        onChange={handleChange}
                        className="border-slate-200 dark:border-gray-700 dark:bg-gray-800/80"
                        required
                      />
                    </FormField>
  
                    <FormField 
                      label="Strand" 
                      name="strand"
                      tooltip="DNA strand orientation"
                      required
                    >
                      <Select 
                        value={formData.strand.toString()} 
                        onValueChange={(value) => handleSelectChange(value, 'strand')}
                      >
                        <SelectTrigger className="border-slate-200 dark:border-gray-700 dark:bg-gray-800/80">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Forward (+1)</SelectItem>
                          <SelectItem value="-1">Reverse (-1)</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>
  
                    <FormField label="Peptide" name="peptide" required>
                      <Input
                        id="peptide"
                        name="peptide"
                        value={formData.peptide || ''}
                        onChange={handleChange}
                        className="border-slate-200 dark:border-gray-700 dark:bg-gray-800/80"
                        required
                      />
                    </FormField>
                  </div>
                </motion.div>
  
                {/* Type Information Section */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="rounded-xl bg-white dark:bg-gray-800/80 p-6 border border-slate-200/60 dark:border-gray-700/60 shadow-sm"
                >
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">Type Information</h2>
                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField 
                      label="Gene Biotype" 
                      name="gene_biotype"
                      tooltip="Biological type of the gene"
                      required
                    >
                      <Select 
                        value={formData.gene_biotype} 
                        onValueChange={(value) => handleSelectChange(value, 'gene_biotype')}
                      >
                        <SelectTrigger className="border-slate-200 dark:border-gray-700 dark:bg-gray-800/80">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="protein_coding">Protein Coding</SelectItem>
                          <SelectItem value="non_coding">Non Coding</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>
  
                    <FormField 
                      label="Transcript Biotype" 
                      name="transcript_biotype"
                      required
                    >
                      <Select 
                        value={formData.transcript_biotype} 
                        onValueChange={(value) => handleSelectChange(value, 'transcript_biotype')}
                      >
                        <SelectTrigger className="border-slate-200 dark:border-gray-700 dark:bg-gray-800/80">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="protein_coding">Protein Coding</SelectItem>
                          <SelectItem value="non_coding">Non Coding</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>
  
                    <FormField label="Transcript" name="transcript" required>
                      <Input
                        id="transcript"
                        name="transcript"
                        value={formData.transcript || ''}
                        onChange={handleChange}
                        className="border-slate-200 dark:border-gray-700 dark:bg-gray-800/80"
                        placeholder="Enter transcript ID"
                        required
                      />
                    </FormField>
                  </div>
                </motion.div>
  
                {/* Description Section */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="rounded-xl bg-white dark:bg-gray-800/80 p-6 border border-slate-200/60 dark:border-gray-700/60 shadow-sm"
                >
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">Description</h2>
                  <FormField 
                    label="Description" 
                    name="description"
                    tooltip="Detailed description of the annotation"
                    required
                  >
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description || ''}
                      onChange={handleChange}
                      className="min-h-[120px] border-slate-200 dark:border-gray-700 dark:bg-gray-800/80"
                      placeholder="Enter a detailed description of the annotation..."
                      required
                    />
                  </FormField>
                </motion.div>
  
                {/* Alerts */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Alert variant="destructive" className="rounded-xl border-2">
                      <AlertTitle className="font-semibold">Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}
  
                {success && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Alert className="rounded-xl border-2 border-green-200 bg-green-50/80 backdrop-blur-sm dark:bg-green-900/30 dark:border-green-900/30">
                      <AlertDescription className="text-green-800 dark:text-green-300">
                        {success}
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}
  
                {/* Action Buttons */}
                <motion.div 
                  className="flex justify-between items-center pt-6 border-t border-slate-200 dark:border-gray-700"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Button
                    type="button"
                    variant="outline"
                    onClick={saveDraft}
                    disabled={saving}
                    className="border-2 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Draft
                      </>
                    )}
                  </Button>
  
                  <Button
                    type="button"
                    onClick={submitAnnotation}
                    disabled={loading}
                    className="bg-violet-500 hover:bg-violet-600 dark:bg-violet-600 dark:hover:bg-violet-500 text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit for Validation
                      </>
                    )}
                  </Button>
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}