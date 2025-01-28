"use client";
import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  HelpCircle, 
  Save, 
  ArrowLeft, 
  Send, 
  Loader2, 
  ChevronRight, 
  Dna,
  AlertCircle 
} from 'lucide-react';
import { useAuth } from '@/store/useAuthStore';

const FormField = ({ 
  label, 
  name, 
  tooltip, 
  children,
  error = null
}) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2">
      <Label 
        htmlFor={name} 
        className="text-sm font-medium text-slate-700 dark:text-slate-200"
      >
        {label}
      </Label>
      {tooltip && (
        <div className="group relative">
          <HelpCircle className="h-4 w-4 text-slate-400 hover:text-violet-500 transition-colors dark:text-slate-500" />
          <span className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 rounded-lg bg-slate-800 px-3 py-2 text-sm text-white shadow-lg group-hover:block w-48 z-50">
            {tooltip}
          </span>
        </div>
      )}
    </div>
    {children}
    {error && (
      <div className="flex items-center gap-2 mt-1 text-red-500 text-sm">
        <AlertCircle className="h-4 w-4" />
        <span>{error}</span>
      </div>
    )}
  </div>
);

interface Params {
  gene: string;
}

export default function AnnotationForm({ params }: { params: Params }) {
  const router = useRouter();
  const { gene } = use(params);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('details');
  const [formData, setFormData] = useState({
    gene_instance: '',
    strand: 1,
    gene: '',
    gene_biotype: '',
    transcript_biotype: '',
    gene_symbol: '',
    description: '',
    status: '',
    is_current: true
  });
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const { accessToken } = useAuth((state) => state);
  useEffect(() => {
    const fetchGeneData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`http://127.0.0.1:8000/data/api/annotation/?gene_instance=${gene}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch gene data');
        }
        const data = await response.json();
        console.log('🚀 Gene data:', data);
        // Extract the first gene object from the array
        const geneData = data.gene[0] || {};
        
        setFormData({
          gene_instance: geneData.gene_instance || '',
          strand: geneData.strand || 1,
          gene: geneData.gene === 'No gene provided.' ? '' : geneData.gene,
          gene_biotype: geneData.gene_biotype === 'No gene biotype provided.' ? '' : geneData.gene_biotype,
          transcript_biotype: geneData.transcript_biotype === 'No transcript biotype provided.' ? '' : geneData.transcript_biotype,
          gene_symbol: geneData.gene_symbol === 'No gene symbol provided.' ? '' : geneData.gene_symbol,
          description: geneData.description === 'No description provided.' ? '' : geneData.description,
          status: geneData.status || '',
          is_current: geneData.is_current ?? true
        });
      } catch (err) {
        setError('Failed to load gene data. Starting with empty form.');
        console.error('Error fetching gene data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (gene) {
      fetchGeneData();
    }
  }, [gene]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBiotypeChange = (value) => {
    setFormData(prev => ({
      ...prev,
      gene_biotype: value
    }));
  };

  const handleDraftSave = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`http://127.0.0.1:8000/data/api/annotation/${gene}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to save draft');
      }

      setSuccessMessage('Draft saved successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Failed to save draft. Please try again.');
      console.error('Error saving draft:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderGeneDetails = () => (
    <div className="space-y-6 rounded-xl bg-white dark:bg-gray-800/80 p-8 border border-slate-200/60 dark:border-gray-700/60 shadow-lg">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 rounded-lg bg-violet-100 dark:bg-violet-900/30">
          <Dna className="h-6 w-6 text-violet-600 dark:text-violet-400" />
        </div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Gene Details</h2>
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        <FormField 
          label="Gene Instance" 
          name="gene_instance" 
          tooltip="Unique identifier for the gene instance"
        >
          <Input
            id="gene_instance"
            name="gene_instance"
            value={formData.gene_instance}
            onChange={handleInputChange}
            className="border-slate-200 dark:border-gray-700 focus:ring-2 focus:ring-violet-500 transition-all"
            placeholder="e.g., ABG68774"
          />
        </FormField>
        <FormField 
          label="Gene" 
          name="gene" 
          tooltip="Gene identifier"
        >
          <Input
            id="gene"
            name="gene"
            value={formData.gene}
            onChange={handleInputChange}
            className="border-slate-200 dark:border-gray-700 focus:ring-2 focus:ring-violet-500 transition-all"
            placeholder="Enter gene identifier"
          />
        </FormField>
        <FormField 
          label="Gene Symbol" 
          name="gene_symbol" 
          tooltip="Common name or symbol used to refer to this gene"
        >
          <Input
            id="gene_symbol"
            name="gene_symbol"
            value={formData.gene_symbol}
            onChange={handleInputChange}
            className="border-slate-200 dark:border-gray-700 focus:ring-2 focus:ring-violet-500 transition-all"
            placeholder="Enter gene symbol"
          />
        </FormField>
        <FormField 
          label="Description" 
          name="description" 
          tooltip="Description of the gene"
        >
          <Input
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="border-slate-200 dark:border-gray-700 focus:ring-2 focus:ring-violet-500 transition-all"
            placeholder="Enter gene description"
          />
        </FormField>
      </div>
    </div>
  );

  
  const renderTypeInformation = () => (
    <div className="space-y-6 rounded-xl bg-white dark:bg-gray-800/80 p-8 border border-slate-200/60 dark:border-gray-700/60 shadow-lg">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
          <HelpCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Type Information</h2>
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        <FormField 
          label="Gene Biotype" 
          name="gene_biotype" 
          tooltip="Biological classification of the gene"
        >
          <Select 
            value={formData.gene_biotype} 
            onValueChange={handleBiotypeChange}
          >
            <SelectTrigger className="border-slate-200 dark:border-gray-700 focus:ring-2 focus:ring-violet-500 transition-all">
              <SelectValue placeholder="Select gene biotype" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="protein_coding">Protein Coding</SelectItem>
              <SelectItem value="non_coding">Non Coding</SelectItem>
              <SelectItem value="pseudogene">Pseudogene</SelectItem>
              <SelectItem value="rRNA">rRNA</SelectItem>
              <SelectItem value="tRNA">tRNA</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
        <FormField 
          label="Transcript Biotype" 
          name="transcript_biotype"
          tooltip="Biological classification of the transcript"
        >
          <Select 
            value={formData.transcript_biotype} 
            onValueChange={(value) => handleInputChange({ target: { name: 'transcript_biotype', value }})}
          >
            <SelectTrigger className="border-slate-200 dark:border-gray-700 focus:ring-2 focus:ring-violet-500 transition-all">
              <SelectValue placeholder="Select transcript biotype" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="protein_coding">Protein Coding</SelectItem>
              <SelectItem value="processed_transcript">Processed Transcript</SelectItem>
              <SelectItem value="nonsense_mediated_decay">Nonsense Mediated Decay</SelectItem>
              <SelectItem value="retained_intron">Retained Intron</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
        <FormField 
          label="Strand" 
          name="strand"
          tooltip="DNA strand orientation (1 for forward, -1 for reverse)"
        >
          <Select 
            value={formData.strand.toString()} 
            onValueChange={(value) => handleInputChange({ target: { name: 'strand', value: parseInt(value) }})}
          >
            <SelectTrigger className="border-slate-200 dark:border-gray-700 focus:ring-2 focus:ring-violet-500 transition-all">
              <SelectValue placeholder="Select strand" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Forward (+1)</SelectItem>
              <SelectItem value="-1">Reverse (-1)</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
        <FormField 
          label="Status" 
          name="status"
          tooltip="Current status of the gene annotation"
        >
          <Input
            id="status"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="border-slate-200 dark:border-gray-700 focus:ring-2 focus:ring-violet-500 transition-all"
            placeholder="Enter status"
          />
        </FormField>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <nav className="flex items-center justify-between mb-12">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/annotations')}
            className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors text-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Annotations
          </Button>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Editing</span>
            <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded">
              {gene}
            </code>
          </div>
        </nav>

        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Gene Annotation
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Add or modify gene annotations
          </p>
        </header>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/20">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert className="mb-6 border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-900/20">
            <AlertCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm">
          <CardContent className="p-8">
            {isLoading ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
              </div>
            ) : (
              <form className="space-y-8">
                {renderGeneDetails()}
                {renderTypeInformation()}
                
                <div className="flex justify-between items-center pt-8 border-t border-slate-200 dark:border-gray-700">
                  <Button
                    variant="outline"
                    onClick={handleDraftSave}
                    type="button"
                    className="border-2 hover:bg-slate-50 dark:hover:bg-gray-700 transition-all"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Draft
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}