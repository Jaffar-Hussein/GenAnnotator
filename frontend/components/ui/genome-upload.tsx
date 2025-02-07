import { useState } from "react";
import { Upload, Loader2, AlertCircle } from "lucide-react";
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

export default function UploadGenomeModal({ open, onOpenChange, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    species: "",
    description: "",
    sequence: "",
  });
  const [sequenceError, setSequenceError] = useState("");

  const resetForm = () => {
    setFormData({
      name: "",
      species: "",
      description: "",
      sequence: "",
    });
    setError("");
    setSequenceError("");
  };

  const validateSequence = (sequence) => {
    if (!sequence.trim()) return { isValid: true, error: "" };

    const cleanSequence = sequence.replace(/\s/g, "").toUpperCase();
    const invalidChars = cleanSequence.replace(/[ATCG]/g, "");

    if (invalidChars.length > 0) {
      return {
        isValid: false,
        error: `Invalid characters: ${Array.from(new Set(invalidChars)).join(", ")}`
      };
    }

    if (cleanSequence.length < 10) {
      return {
        isValid: false,
        error: cleanSequence.length === 0 ? "" : "Sequence must be at least 10 base pairs"
      };
    }

    return { isValid: true, error: "" };
  };

  const handleSequenceChange = (e) => {
    const newSequence = e.target.value;
    setFormData(prev => ({ ...prev, sequence: newSequence }));
    const { error } = validateSequence(newSequence);
    setSequenceError(error);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setError("");

    try {
      const text = await file.text();
      const lines = text.split("\n");
      const sequence = lines
        .filter(line => !line.startsWith(">"))
        .join("")
        .trim();
      const header = lines.find(line => line.startsWith(">"));

      if (header) {
        const [name, ...speciesParts] = header.slice(1).split(" ");
        setFormData(prev => ({
          ...prev,
          name: name || "",
          species: speciesParts.join(" ") || "",
          sequence,
        }));
      } else {
        setFormData(prev => ({ ...prev, sequence }));
      }
      
      const { error } = validateSequence(sequence);
      setSequenceError(error);
    } catch (err) {
      setError("Failed to read file");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.species.trim() || !formData.sequence.trim()) return;

    const { isValid, error } = validateSequence(formData.sequence);
    if (!isValid) {
      setSequenceError(error);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/data/api/genome/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Upload failed");
      onSuccess?.();
      onOpenChange(false);
    } catch (err) {
      setError("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) resetForm();
      onOpenChange(newOpen);
    }}>
      <DialogContent className="sm:max-w-[600px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            Upload Genome
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative group">
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed 
                            rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 
                            dark:hover:bg-gray-800 border-gray-300 dark:border-gray-700 transition-colors">
              <div className="flex flex-col items-center justify-center p-4 text-center">
                <Upload className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
                <p className="text-sm text-gray-600 dark:text-gray-300">
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

          <div className="space-y-4">
            <div>
              <Label className="text-gray-700 dark:text-gray-300">Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter genome name"
                className="mt-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700
                         text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>

            <div>
              <Label className="text-gray-700 dark:text-gray-300">Species</Label>
              <Input
                value={formData.species}
                onChange={(e) => setFormData(prev => ({ ...prev, species: e.target.value }))}
                placeholder="Enter species name"
                className="mt-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700
                         text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>

            <div>
              <Label className="text-gray-700 dark:text-gray-300">Sequence</Label>
              <Textarea
                value={formData.sequence}
                onChange={handleSequenceChange}
                placeholder="Paste DNA sequence"
                className={`mt-1 font-mono bg-white dark:bg-gray-800 border-gray-300 
                          dark:border-gray-700 text-gray-900 dark:text-gray-100 
                          placeholder:text-gray-400 dark:placeholder:text-gray-500
                          ${sequenceError ? "border-red-500 dark:border-red-500" : ""}`}
                rows={6}
              />
              {sequenceError && (
                <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                  {sequenceError}
                </p>
              )}
            </div>
          </div>

          {formData.sequence &&  !sequenceError && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Length</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formData.sequence.length} bp
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">GC Content</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {((formData.sequence.match(/[GC]/gi)?.length || 0) / formData.sequence.length * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertDescription className="text-red-600 dark:text-red-400">{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300
                       hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.name.trim() || !formData.species.trim() || !formData.sequence.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 
                       text-white min-w-[120px] disabled:bg-gray-300 dark:disabled:bg-gray-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading
                </>
              ) : (
                "Upload"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}