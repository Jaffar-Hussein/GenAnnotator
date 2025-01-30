import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Search,
  Info,
  Loader2,
  Dna,
  XCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import GeneDetails from "@/components/gene-details";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import EmptyGenomeViewer from "@/components/empty-genome-viewer";

const GenomeViewer = ({ genomeName = "Escherichia_coli_cft073" }) => {
  const [viewportStart, setViewportStart] = useState(0);
  const [viewportSize, setViewportSize] = useState(5000);
  const [selectedGene, setSelectedGene] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [genes, setGenes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Load data on component mount
  useEffect(() => {
    const fetchGenes = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        const response = await fetch(
          `${backendUrl}/data/api/gene/?genome=${genomeName}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch genes");
        }
        const data = await response.json();
        setGenes(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGenes();
  }, [genomeName]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(selectedGene.sequence);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  // Calculate genome statistics
  const genomeStats = {
    size: genes.length > 0 ? Math.max(...genes.map((gene) => gene.end)) : 0,
    count: genes.length,
    averageLength:
      genes.length > 0
        ? Math.round(
            genes.reduce((acc, gene) => acc + (gene.end - gene.start + 1), 0) /
              genes.length
          )
        : 0,
  };

  // Filter visible genes
  const visibleGenes = genes.filter(
    (gene) =>
      gene.start < viewportStart + viewportSize && gene.end > viewportStart
  );

  // Filter genes by search and type
  const filteredGenes = visibleGenes
    .filter((gene) => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          gene.name.toLowerCase().includes(searchLower) ||
          (gene.description &&
            gene.description.toLowerCase().includes(searchLower))
        );
      }
      return true;
    })
    .filter((gene) => {
      if (filterType === "all") return true;
      return (
        gene.description &&
        gene.description.toLowerCase().includes(filterType.toLowerCase())
      );
    });

  // Color mapping for different gene types
  const getGeneColor = (description = "", gene) => {
    if (!gene)
      return "bg-gray-600 dark:bg-gray-500 hover:bg-gray-700 dark:hover:bg-gray-600";

    if (
      searchTerm &&
      gene.name &&
      (gene.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (gene.description &&
          gene.description.toLowerCase().includes(searchTerm.toLowerCase())))
    ) {
      return "bg-yellow-600 dark:bg-amber-600 hover:bg-yellow-700 dark:hover:bg-amber-700";
    }

    if (description?.toLowerCase().includes("ribosom")) {
      return "bg-purple-600 dark:bg-purple-500 hover:bg-purple-700 dark:hover:bg-purple-600";
    }

    if (description?.toLowerCase().includes("polymeras")) {
      return "bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 dark:hover:bg-emerald-600";
    }

    if (description?.toLowerCase().includes("elongation")) {
      return "bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600";
    }

    return "bg-gray-600 dark:bg-gray-500 hover:bg-gray-700 dark:hover:bg-gray-600";
  };

  const renderGeneTracks = () => {
    // Sort genes by start position for better visualization
    const sortedGenes = [...filteredGenes].sort((a, b) => a.start - b.start);

    // Group overlapping genes into tracks
    const tracks = [];
    sortedGenes.forEach((gene) => {
      let trackIndex = 0;
      while (trackIndex < tracks.length) {
        const track = tracks[trackIndex];
        const lastGene = track[track.length - 1];
        if (gene.start > lastGene.end) {
          break;
        }
        trackIndex++;
      }
      if (trackIndex === tracks.length) {
        tracks.push([gene]);
      } else {
        tracks[trackIndex].push(gene);
      }
    });

    return tracks.map((track, trackIndex) => (
      <div key={trackIndex} className="relative h-10 mb-2">
        {track.map((gene) => {
          let startPixel = ((gene.start - viewportStart) / viewportSize) * 100;
          let widthPercent = ((gene.end - gene.start) / viewportSize) * 100;

          // Clamp values to prevent overflow
          startPixel = Math.max(0, Math.min(100, startPixel));
          widthPercent = Math.min(100 - startPixel, widthPercent);

          if (widthPercent <= 0 || startPixel >= 100) return null;

          return (
            <div
              key={gene.name}
              className="absolute group/gene"
              style={{
                left: `${startPixel}%`,
                width: `${widthPercent}%`,
                height: "100%",
              }}
              onClick={() => setSelectedGene(gene)}
            >
              <div
                className={`h-full cursor-pointer ${getGeneColor(
                  gene.description,
                  gene
                )}
                  ${
                    selectedGene?.name === gene.name
                      ? "ring-2 ring-indigo-300 dark:ring-indigo-400 shadow-lg"
                      : "hover:shadow-md"
                  }
                  rounded-sm transition-all duration-200 ease-in-out`}
              >
                <span
                  className="text-xs font-medium text-white dark:text-gray-100 truncate 
                  block px-2 py-2 transition-opacity"
                >
                  {widthPercent > 5 ? gene.name : ""}
                </span>

                {/* Enhanced Tooltip */}
                <div
                  className="absolute hidden group-hover/gene:block bg-gray-900 dark:bg-gray-800 
                  text-white p-4 rounded-lg shadow-xl z-10 top-full left-0 mt-2 
                  min-w-[200px] border border-gray-700 dark:border-gray-600"
                >
                  <div className="space-y-3">
                    <div>
                      <p className="font-bold text-sm text-indigo-400">
                        {gene.name}
                      </p>
                      <p
                        className={`mt-1 text-xs font-semibold ${
                          gene.annotated ? "text-green-600" : "text-yellow-600"
                        }`}
                      >
                        {gene.annotated ? "Annotated" : "Annotation Pending"}
                      </p>
                    </div>

                    <div className="border-t border-gray-700 dark:border-gray-600 pt-2">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-gray-400 dark:text-gray-500">
                            Position
                          </p>
                          <p className="text-white dark:text-gray-200">
                            {gene.start.toLocaleString()}-
                            {gene.end.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 dark:text-gray-500">
                            Length
                          </p>
                          <p className="text-white dark:text-gray-200">
                            {(gene.end - gene.start + 1).toLocaleString()} bp
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-2 flex items-center gap-1">
                      <span className="w-2 h-2 bg-indigo-400 rounded-full"></span>
                      Click to view detailed information
                    </div>
                  </div>

                  <div
                    className="absolute -top-2 left-4 w-4 h-4 bg-gray-900 dark:bg-gray-800 
                    border-l border-t border-gray-700 dark:border-gray-600 
                    transform -rotate-45"
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    ));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-32">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="h-12 w-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-500 dark:text-indigo-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Loading Genome Data
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Please wait while we fetch the genome information
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-32">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="h-12 w-12 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
              <XCircle className="h-6 w-6 text-red-500 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Error Loading Genome
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!genes || genes.length === 0) {
    return <EmptyGenomeViewer genomeName={genomeName} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Hero Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-slate-200/60 dark:border-gray-700/60">
          <div className="p-8 border-b border-slate-200/60 dark:border-gray-700/60 bg-gradient-to-r from-slate-50 to-white dark:from-gray-800 dark:to-gray-800/50">
            <div className="flex items-start space-x-4">
              <div className="h-12 w-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <Dna className="h-6 w-6 text-indigo-500 dark:text-indigo-400" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
                  Genome Browser
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  {genomeName.replace(/_/g, " ")}
                </p>
              </div>
              <button
                onClick={() => setShowHelp(!showHelp)}
                className="ml-auto p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Info className="w-5 h-5 text-slate-400 dark:text-slate-500" />
              </button>
            </div>

            {showHelp && (
              <div className="mt-6 p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100/60 dark:border-indigo-800/60">
                <h4 className="text-lg font-semibold text-indigo-900 dark:text-indigo-300 mb-3">
                  Quick Guide
                </h4>

                <ul className="space-y-3 text-indigo-800 dark:text-indigo-300">
                  <li className="flex items-center gap-2">
                    <ChevronLeft className="w-4 h-4" />
                    Navigate through the genome using arrow controls
                  </li>
                  <li className="flex items-center gap-2">
                    <ZoomIn className="w-4 h-4" />
                    Adjust detail level with zoom controls
                  </li>
                  <li className="flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    Search genes by name or description
                  </li>
                </ul>
              </div>
            )}
          </div>

          <div className="p-8 space-y-8">
            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  label: "Genome Size",
                  value: `${genomeStats.size.toLocaleString()} bp`,
                },
                {
                  label: "Total Genes",
                  value: genomeStats.count.toLocaleString(),
                },
                {
                  label: "Avg. Gene Length",
                  value: `${genomeStats.averageLength.toLocaleString()} bp`,
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-slate-50 dark:bg-gray-800/50 rounded-lg p-4 border border-slate-200/60 dark:border-gray-700/60"
                >
                  <dt className="text-sm text-slate-500 dark:text-slate-400">
                    {stat.label}
                  </dt>
                  <dd className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </div>

            {/* Controls Section */}
            <div className="flex flex-wrap gap-6 items-center">
              {/* Navigation Controls */}
              <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded-lg border border-slate-200/60 dark:border-gray-700/60">
                <button
                  onClick={() =>
                    setViewportStart(
                      Math.max(0, viewportStart - Math.floor(viewportSize / 2))
                    )
                  }
                  className="p-2 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() =>
                    setViewportStart(
                      Math.min(
                        genomeStats.size - viewportSize,
                        viewportStart + Math.floor(viewportSize / 2)
                      )
                    )
                  }
                  className="p-2 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="h-8 border-r border-slate-200 dark:border-slate-700 mx-2" />
                <button
                  onClick={() =>
                    setViewportSize(
                      Math.max(
                        1000,
                        viewportSize - Math.floor(viewportSize / 2)
                      )
                    )
                  }
                  className="p-2 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 transition-colors"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
                <button
                  onClick={() =>
                    setViewportSize(
                      Math.min(
                        genomeStats.size,
                        viewportSize + Math.floor(viewportSize / 2)
                      )
                    )
                  }
                  className="p-2 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 transition-colors"
                >
                  <ZoomOut className="w-5 h-5" />
                </button>
              </div>

              {/* Search and Filter */}
              <div className="flex items-center gap-4 flex-grow max-w-2xl">
                <div className="relative flex-grow">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                  <Input
                    type="text"
                    placeholder="Search genes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-800"
                  />
                </div>
                <Select
                  value={filterType}
                  onValueChange={(value) => setFilterType(value)}
                >
                  <SelectTrigger className="w-[180px] border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-800">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="ribosom">Ribosomal</SelectItem>
                    <SelectItem value="polymeras">Polymerase</SelectItem>
                    <SelectItem value="elongation">Elongation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Position Display */}
              <div className="bg-slate-50 dark:bg-gray-800/50 px-4 py-2 rounded-lg border border-slate-200/60 dark:border-gray-700/60">
                <span className="text-sm text-slate-600 dark:text-slate-300">
                  Viewing: {viewportStart.toLocaleString()}-
                  {(viewportStart + viewportSize).toLocaleString()} bp
                </span>
              </div>
            </div>

            {/* Genome Visualization */}
            <div className="rounded-lg border border-slate-200/60 dark:border-gray-700/60 p-6 bg-slate-50 dark:bg-gray-800/50">
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-4">
                <span>{viewportStart.toLocaleString()}</span>
                <span>{(viewportStart + viewportSize).toLocaleString()}</span>
              </div>

              <div className="relative w-full bg-gray-900 dark:bg-gray-950 rounded-lg p-4 min-h-[200px]">
                {renderGeneTracks()}
              </div>

              <div className="flex justify-center text-xs text-slate-500 dark:text-slate-400 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-16 border-t border-slate-300 dark:border-slate-600"></div>
                  <span>{viewportSize.toLocaleString()} bp</span>
                  <div className="w-16 border-t border-slate-300 dark:border-slate-600"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gene Details Section */}
        {selectedGene ? (
          <GeneDetails
            selectedGene={selectedGene}
            onCopySequence={copyToClipboard}
            isCopied={copied}
            viewportStart={viewportStart}
            viewportSize={viewportSize}
          />
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-slate-200/60 dark:border-gray-700/60 p-8">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="h-12 w-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
                <Dna className="h-6 w-6 text-indigo-500 dark:text-indigo-400" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Select a Gene
              </h2>
              <p className="text-slate-600 dark:text-slate-400 max-w-md">
                Click on any gene in the viewer above to see detailed information, sequence data, and more.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenomeViewer;
