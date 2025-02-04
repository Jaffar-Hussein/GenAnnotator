'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeftRight, 
  HeartPulse, 
  Database,
  FileText,
  Dna as DnaIcon
} from 'lucide-react';

interface GeneAnnotation {
  gene_instance: string;
  strand: number;
  gene: string;
  gene_biotype: string;
  transcript_biotype: string;
  gene_symbol: string;
  description: string;
  is_current: boolean;
  status: string;
}

interface PeptideAnnotation {
  peptide: string;
  transcript: string;
  annotation: string;
}

interface AnnotationDetails {
  gene: GeneAnnotation[];
  peptide: PeptideAnnotation[];
}

interface GeneDetailsProps {
  annotation: AnnotationDetails | null;
  className?: string;
}

const SectionTitle = ({ icon: Icon, title }) => (
  <div className="flex items-center space-x-2 mb-4">
    <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
      <Icon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
    </div>
    <h3 className="font-medium text-slate-900 dark:text-white">
      {title}
    </h3>
  </div>
);

const DataField = ({ label, value, className = '', monospace = false }) => (
  <div className={className}>
    <dt className="text-sm font-medium text-slate-600 dark:text-slate-400">
      {label}
    </dt>
    <dd className={`mt-1 text-slate-900 dark:text-slate-200 ${monospace ? 'font-mono text-sm' : ''}`}>
      {value}
    </dd>
  </div>
);

export function GeneDetails({ annotation, className = '' }: GeneDetailsProps) {
  if (!annotation?.gene?.[0]) return null;
  const geneInfo = annotation.gene[0];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      {/* Primary Information Card */}
      <Card className="p-6 mb-6 bg-white dark:bg-gray-800 border border-slate-200/60 dark:border-slate-700/60">
        <SectionTitle icon={DnaIcon} title="Gene Overview" />
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {geneInfo.gene_symbol}
            </h2>
            <p className="mt-1 text-slate-600 dark:text-slate-400">
              Gene ID: {geneInfo.gene_instance}
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-3">
            <Badge variant="outline" className="text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-900/30">
              {geneInfo.gene_biotype}
            </Badge>
            <Badge variant="outline" className="text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-900/30">
              Strand: {geneInfo.strand}
            </Badge>
          </div>
        </div>

        <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
          {geneInfo.description}
        </p>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="mb-4 bg-slate-100 dark:bg-slate-800">
            <TabsTrigger 
              value="details" 
              className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white dark:data-[state=active]:bg-indigo-600"
            >
              Technical Details
            </TabsTrigger>
            <TabsTrigger 
              value="peptides"
              className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white dark:data-[state=active]:bg-indigo-600"
            >
              Associated Peptides
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DataField 
                label="Gene Instance"
                value={geneInfo.gene_instance}
                monospace
              />
              <DataField 
                label="Gene Biotype"
                value={geneInfo.gene_biotype}
              />
              <DataField 
                label="Transcript Biotype"
                value={geneInfo.transcript_biotype}
              />
              <div className="flex items-center">
                <DataField 
                  label="Strand Direction"
                  value={
                    <div className="flex items-center mt-1">
                      <ArrowLeftRight className="h-4 w-4 mr-2 text-slate-500" />
                      {geneInfo.strand}
                    </div>
                  }
                />
              </div>
              <DataField 
                label="Current Status"
                value={geneInfo.status}
                className="col-span-2"
              />
            </dl>
          </TabsContent>

          <TabsContent value="peptides">
            {annotation.peptide && annotation.peptide.length > 0 ? (
              <div className="space-y-4">
                {annotation.peptide.map((peptide, index) => (
                  <Card
                    key={index}
                    className="p-4 border border-slate-200/60 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/50"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900 dark:text-white mb-1">
                          Peptide Sequence
                        </h4>
                        <code className="text-sm bg-white dark:bg-slate-900 p-2 rounded block font-mono text-slate-900 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60">
                          {peptide.peptide}
                        </code>
                      </div>
                      <Badge className="ml-4 shrink-0 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800">
                        {peptide.transcript}
                      </Badge>
                    </div>
                    {peptide.annotation && (
                      <div className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                        <h4 className="font-medium text-slate-900 dark:text-white mb-1">
                          Annotation Notes
                        </h4>
                        <p>{peptide.annotation}</p>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-slate-600 dark:text-slate-400 text-center py-4">
                No peptide annotations available
              </p>
            )}
          </TabsContent>
        </Tabs>
      </Card>
    </motion.div>
  );
}