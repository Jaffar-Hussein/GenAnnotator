import { useState, useEffect } from 'react';
import { Upload, Loader2, AlertCircle, Info, Check, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

export default function UploadGenomeModal({ open, onOpenChange }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    description: '',
    sequence: ''
  });
  const [file, setFile] = useState(null);
  const [validations, setValidations] = useState({
    name: { valid: false, message: '' },
    species: { valid: false, message: '' },
    sequence: { valid: false, message: '' }
  });

  const validateField = (field, value) => {
    switch (field) {
      case 'name':
        return {
          valid: value.length >= 3,
          message: value.length < 3 ? 'Name must be at least 3 characters' : ''
        };
      case 'species':
        return {
          valid: value.length >= 2,
          message: value.length < 2 ? 'Species name required' : ''
        };
      case 'sequence':
        const validBases = /^[ATCGatcg\s]+$/;
        return {
          valid: value.length >= 10 && validBases.test(value),
          message: !value.length ? 'Sequence is required' : 
                  !validBases.test(value) ? 'Invalid DNA sequence' : 
                  value.length < 10 ? 'Sequence too short' : ''
        };
      default:
        return { valid: true, message: '' };
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setValidations(prev => ({
      ...prev,
      [field]: validateField(field, value)
    }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      try {
        const text = await file.text();
        const lines = text.split('\n');
        const sequence = lines.filter(line => !line.startsWith('>')).join('').trim();
        const header = lines.find(line => line.startsWith('>'));
        
        if (header) {
          const name = header.slice(1).split(' ')[0];
          handleChange('name', name);
          handleChange('sequence', sequence);
          setStep(2);
        }
      } catch (err) {
        setError('Error reading file');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    try {
      const response = await fetch(`${backendUrl}/data/api/genome/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      setSuccess(true);
      setTimeout(() => {
        onOpenChange(false);
        setStep(1);
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    if (step === 1) return true;
    if (step === 2) {
      return validations.name.valid && validations.species.valid;
    }
    return validations.sequence.valid;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            Upload Genome
            <span className="text-sm font-normal text-muted-foreground">
              Step {step} of 3
            </span>
          </DialogTitle>
          <DialogDescription>
            {step === 1 && "Start by uploading a FASTA file or create a new genome manually"}
            {step === 2 && "Enter the basic information about your genome"}
            {step === 3 && "Review and confirm the sequence data"}
          </DialogDescription>
        </DialogHeader>

        <Progress value={(step / 3) * 100} className="mb-4" />

        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 && (
            <div className="grid gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer bg-muted/50 border-muted hover:bg-muted/80 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-12 h-12 mb-4 text-muted-foreground" />
                      <p className="mb-2 text-sm text-muted-foreground text-center">
                        <span className="font-semibold">Drop your FASTA file here</span> or click to browse
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Supports .fasta, .fa, or .txt files
                      </p>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept=".fasta,.fa,.txt"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue manually
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setStep(2)}
                >
                  Enter genome details manually
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    Genome Name
                    <Info className="h-3.5 w-3.5 text-muted-foreground" />
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className={validations.name.message ? 'border-red-500' : ''}
                  />
                  {validations.name.message && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {validations.name.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="species" className="flex items-center gap-2">
                    Species
                  </Label>
                  <Input
                    id="species"
                    value={formData.species}
                    onChange={(e) => handleChange('species', e.target.value)}
                    className={validations.species.message ? 'border-red-500' : ''}
                  />
                  {validations.species.message && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {validations.species.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="description" className="flex items-center gap-2">
                    Description (Optional)
                  </Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={!isStepValid()}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="grid gap-1.5">
                <Label htmlFor="sequence" className="flex items-center gap-2">
                  DNA Sequence
                  <Info className="h-3.5 w-3.5 text-muted-foreground" />
                </Label>
                <Textarea
                  id="sequence"
                  value={formData.sequence}
                  onChange={(e) => handleChange('sequence', e.target.value)}
                  className={`font-mono ${validations.sequence.message ? 'border-red-500' : ''}`}
                  rows={6}
                />
                {validations.sequence.message && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {validations.sequence.message}
                  </p>
                )}
              </div>

              {/* Sequence Stats */}
              {formData.sequence && !validations.sequence.message && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Length</p>
                    <p className="text-lg font-semibold">{formData.sequence.length} bp</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">GC Content</p>
                    <p className="text-lg font-semibold">
                      {((formData.sequence.match(/[GC]/gi)?.length || 0) / formData.sequence.length * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-900">
                  <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <AlertDescription className="text-emerald-600 dark:text-emerald-400">
                    Genome uploaded successfully!
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep(2)}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !isStepValid()}
                  className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Upload Genome'
                  )}
                </Button>
              </div>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}