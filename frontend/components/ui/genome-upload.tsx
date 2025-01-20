import { useState } from 'react';
import { Upload, Loader2, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function UploadGenomeModal({ open, onOpenChange }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    description: '',
    sequence: ''
  });
  const [file, setFile] = useState(null);

  const resetForm = () => {
    setFormData({
      name: '',
      species: '',
      description: '',
      sequence: ''
    });
    setFile(null);
    setError('');
  };

  const handleOpenChange = (newOpen) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  
  const isValid = () => {
    return formData.name.trim() && formData.species.trim() && formData.sequence.trim();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setError('');
    
    try {
      const text = await file.text();
      const lines = text.split('\n');
      const sequence = lines.filter(line => !line.startsWith('>')).join('').trim();
      const header = lines.find(line => line.startsWith('>'));
      
      if (header) {
        const [name, ...speciesParts] = header.slice(1).split(' ');
        setFormData(prev => ({
          ...prev,
          name: name || '',
          species: speciesParts.join(' ') || '',
          sequence
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          sequence
        }));
      }
    } catch (err) {
      setError('Could not read the file. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid()) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/data/api/genome/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to upload genome');
      
      onOpenChange(false);
    } catch (err) {
      setError('Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-purple-600 dark:text-purple-400">
            Upload Genome
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload Section */}
          <div className="relative group">
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-purple-50/50 hover:bg-purple-50 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 border-purple-200 dark:border-purple-800 transition-colors">
              <div className="flex flex-col items-center justify-center p-4 text-center">
                <Upload className="w-8 h-8 mb-2 text-purple-500 dark:text-purple-400" />
                <p className="text-sm text-purple-600 dark:text-purple-400">
                  Drop FASTA file or click to browse
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                accept=".fasta,.fa,.txt"
                onChange={handleFileChange}
                disabled={loading}
              />
            </label>
          </div>

          {/* Quick Input Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter genome name"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="species">Species</Label>
              <Input
                id="species"
                value={formData.species}
                onChange={(e) => setFormData(prev => ({ ...prev, species: e.target.value }))}
                placeholder="Enter species name"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="sequence">Sequence</Label>
              <Textarea
                id="sequence"
                value={formData.sequence}
                onChange={(e) => setFormData(prev => ({ ...prev, sequence: e.target.value }))}
                placeholder="Paste DNA sequence"
                className="mt-1 font-mono"
                rows={6}
              />
            </div>
          </div>

          {/* Sequence Stats */}
          {formData.sequence && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-purple-50/50 dark:bg-purple-900/20 rounded-lg">
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400">Length</p>
                <p className="text-lg font-semibold">{formData.sequence.length} bp</p>
              </div>
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400">GC Content</p>
                <p className="text-lg font-semibold">
                  {((formData.sequence.match(/[GC]/gi)?.length || 0) / formData.sequence.length * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              className="border-purple-200 dark:border-purple-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !isValid()}
              className="bg-purple-600 hover:bg-purple-700 text-white min-w-[120px]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading
                </>
              ) : (
                'Upload'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}