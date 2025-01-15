import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Search,
  Info,
  Loader,
  Copy,
  Check,
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
import SequenceTrackViewer from "./sequence-viewer";
import { useAuthStore } from "@/store/useAuthStore";

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
  const user = useAuthStore((state) => state.user);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(selectedGene.sequence);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

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
        console.log("Response", response);
        const data = await response.json();
        console.log("Data", data);
        setGenes(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGenes();
    console.log("Genome Name", genomeName);
    console.log("Genes", genes);
  }, [genomeName]);

  if (isLoading) {
    return (
      <Card className="w-full max-w-6xl">
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <Loader className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-gray-600">Loading genome data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-6xl">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center text-red-500">
            <p className="font-semibold">Error loading genome data</p>
            <p className="text-sm mt-2">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate genome statistics
  const genomeSize = Math.max(...genes.map((gene) => gene.end));
  const geneCount = genes.length;
  const averageGeneLength = Math.round(
    genes.reduce((acc, gene) => acc + (gene.end - gene.start + 1), 0) /
      geneCount
  );
  console.log("Genes", genes);

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
                  gene.description
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
                        <div className="col-span-2">
                          <p className="text-gray-400 dark:text-gray-500">
                            Sequence
                          </p>
                          <p className="bg-gray-900 rounded font-mono text-xs text-white overflow-hidden whitespace-nowrap text-ellipsis ">
                            {gene.sequence}
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

  return (
    <div className="space-y-4">
      <Card className="shadow-lg dark:bg-gray-800">
        <CardHeader className="border-b bg-gray-50 dark:bg-gray-900">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Genome Browser
              </CardTitle>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {genomeName.replace(/_/g, " ")}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowHelp(!showHelp)}
                className="p-3 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 
                  transition-colors"
                aria-label="Toggle help"
              >
                <Info className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              </button>
            </div>
          </div>

          {showHelp && (
            <div className="mt-6 p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
              <h4 className="text-lg font-semibold text-indigo-900 dark:text-indigo-300 mb-3">
                Quick Guide:
              </h4>
              <ul className="space-y-2 text-indigo-800 dark:text-indigo-300">
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
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          {/* Statistics Bar */}
          <div className="grid grid-cols-3 gap-6">
            {[
              {
                label: "Genome Size",
                value: `${genomeSize.toLocaleString()} bp`,
              },
              { label: "Total Genes", value: geneCount.toLocaleString() },
              {
                label: "Avg. Gene Length",
                value: `${averageGeneLength.toLocaleString()} bp`,
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm 
                  border border-gray-100 dark:border-gray-700"
              >
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-6 items-center bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
            {/* Navigation Controls Group */}
            <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
              <button
                onClick={() =>
                  setViewportStart(
                    Math.max(0, viewportStart - Math.floor(viewportSize / 2))
                  )
                }
                className="p-2 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/30 
        text-indigo-600 dark:text-indigo-400 transition-colors"
                title="Move left"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={() =>
                  setViewportStart(
                    Math.min(
                      genomeSize - viewportSize,
                      viewportStart + Math.floor(viewportSize / 2)
                    )
                  )
                }
                className="p-2 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/30 
        text-indigo-600 dark:text-indigo-400 transition-colors"
                title="Move right"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              <div className="h-8 border-r border-gray-200 dark:border-gray-700 mx-2" />
              <button
                onClick={() =>
                  setViewportSize(
                    Math.max(1000, viewportSize - Math.floor(viewportSize / 2))
                  )
                }
                className="p-2 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/30 
        text-indigo-600 dark:text-indigo-400 transition-colors"
                title="Zoom in"
              >
                <ZoomIn className="w-6 h-6" />
              </button>
              <button
                onClick={() =>
                  setViewportSize(
                    Math.min(
                      genomeSize,
                      viewportSize + Math.floor(viewportSize / 2)
                    )
                  )
                }
                className="p-2 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/30 
        text-indigo-600 dark:text-indigo-400 transition-colors"
                title="Zoom out"
              >
                <ZoomOut className="w-6 h-6" />
              </button>
            </div>

            {/* Search and Filter Group */}
            <div className="flex items-center gap-4 flex-grow max-w-2xl">
              <div className="relative flex-grow">
                <Search
                  className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 
        text-gray-400 dark:text-gray-500"
                />
                <Input
                  type="text"
                  placeholder="Search genes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border-gray-200 
          dark:border-gray-700 focus:ring-indigo-500 dark:focus:ring-indigo-400 
          focus:border-indigo-500 dark:focus:border-indigo-400"
                />
              </div>
              <Select
                value={filterType}
                onValueChange={(value) => setFilterType(value)}
              >
                <SelectTrigger
                  className="w-[200px] bg-white dark:bg-gray-800 border-gray-200 
        dark:border-gray-700 focus:ring-indigo-500 dark:focus:ring-indigo-400 
        focus:border-indigo-500 dark:focus:border-indigo-400"
                >
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <SelectItem
                    value="all"
                    className="hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                  >
                    All Types
                  </SelectItem>
                  <SelectItem
                    value="ribosom"
                    className="hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                  >
                    Ribosomal
                  </SelectItem>
                  <SelectItem
                    value="polymeras"
                    className="hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                  >
                    Polymerase
                  </SelectItem>
                  <SelectItem
                    value="elongation"
                    className="hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                  >
                    Elongation
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Position Indicator */}
            <div
              className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm border 
    border-gray-100 dark:border-gray-700"
            >
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Viewing:{" "}
                <span className="text-indigo-600 dark:text-indigo-400">
                  {viewportStart.toLocaleString()}-
                  {(viewportStart + viewportSize).toLocaleString()}
                </span>{" "}
                bp
              </span>
            </div>
          </div>

          {/* Genome Visualization */}
          <div className="border rounded-lg p-4 bg-gray-900">
            <div className="mb-2">
              <div className="flex justify-between text-xs text-gray-400 mb-2">
                <span>{viewportStart.toLocaleString()}</span>
                <span>{(viewportStart + viewportSize).toLocaleString()}</span>
              </div>
              <div className="relative w-full" style={{ minHeight: "100px" }}>
                {renderGeneTracks()}
              </div>
              {/* Scale bar */}
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <div className="flex-1 border-t border-gray-600 mt-2"></div>
                <div className="px-2 text-center">
                  {viewportSize.toLocaleString()} bp
                </div>
                <div className="flex-1 border-t border-gray-600 mt-2"></div>
              </div>
            </div>
          </div>

          {/* Selected Gene Details */}

          {selectedGene && (
            <GeneDetails
              selectedGene={selectedGene}
              onClose={() => setSelectedGene(null)}
              onCopySequence={copyToClipboard}
              isCopied={copied}
              viewportStart={viewportStart}
              viewportSize={viewportSize}
            />
          )}
        </CardContent>
      </Card>

    </div>
  );
};

export default GenomeViewer;
