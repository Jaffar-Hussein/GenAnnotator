import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Search,
  AlertCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select";

const EmptyGenomeViewer = ({ genomeName }) => {
  const onBackToGenomes = () => {};
  return (
    <>
      <Card className="w-full max-w-6xl relative">
        {/* Primary Content Focus - Clear Visual Hierarchy */}
        <CardHeader className="border-b bg-white dark:bg-gray-900">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Genome Browser
              </CardTitle>
              <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
                {genomeName?.replace(/_/g, " ") || "No Genome Selected"}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-6">
              {[
                { label: "Genome Size", sublabel: "Base pairs in genome" },
                { label: "Total Genes", sublabel: "Number of genes" },
                {
                  label: "Avg. Gene Length",
                  sublabel: "Mean base pairs per gene",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-100 
                dark:border-gray-800 relative overflow-hidden"
                >
                  <div className="relative z-10">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {stat.label}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      {stat.sublabel}
                    </p>
                    <div className="h-6 w-24 bg-gray-200/50 dark:bg-gray-700/50 rounded mt-2" />
                  </div>
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-gray-50/50 to-gray-100/50 
                  dark:from-gray-900/50 dark:to-gray-800/50"
                  />
                </div>
              ))}
            </div>

            <div
              className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 
            dark:border-gray-800 p-4 space-y-4"
            >
              <div className="flex flex-wrap gap-4">
                <div
                  className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-lg p-2 
                border border-gray-100 dark:border-gray-700"
                >
                  <button
                    disabled
                    className="p-2 text-gray-300 dark:text-gray-600 
                  cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    disabled
                    className="p-2 text-gray-300 dark:text-gray-600 
                  cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="h-8 border-r border-gray-200 dark:border-gray-700 mx-1" />
                  <button
                    disabled
                    className="p-2 text-gray-300 dark:text-gray-600 
                  cursor-not-allowed transition-colors"
                  >
                    <ZoomIn className="w-5 h-5" />
                  </button>
                  <button
                    disabled
                    className="p-2 text-gray-300 dark:text-gray-600 
                  cursor-not-allowed transition-colors"
                  >
                    <ZoomOut className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 flex items-center gap-4 max-w-2xl">
                  <div className="relative flex-1">
                    <Search
                      className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 
                    text-gray-300 dark:text-gray-600"
                    />
                    <Input
                      disabled
                      placeholder="Search genes when available..."
                      className="pl-9 bg-gray-50 dark:bg-gray-800 border-gray-100 
                    dark:border-gray-700 text-gray-400 cursor-not-allowed"
                    />
                  </div>
                  <Select disabled>
                    <SelectTrigger
                      className="w-[180px] bg-gray-50 dark:bg-gray-800 
                    border-gray-100 dark:border-gray-700 text-gray-400 cursor-not-allowed"
                    >
                      <SelectValue placeholder="Filter genes..." />
                    </SelectTrigger>
                  </Select>
                </div>
              </div>
            </div>

            {/* Visualization Area */}
            <div
              className="relative rounded-lg border border-gray-200 dark:border-gray-800 
            overflow-hidden bg-white dark:bg-gray-900"
            >
              <div
                className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50/90 
              dark:to-gray-900/90 z-10"
              />

              {/* Placeholder Tracks */}
              <div className="p-4">
                <div className="flex justify-between text-xs text-gray-400 mb-2">
                  <span>0 bp</span>
                  <span>5000 bp</span>
                </div>

                <div className="space-y-3 mb-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-8 relative">
                      <div
                        className="absolute inset-y-0 left-[5%] w-[30%] bg-gray-100 
                      dark:bg-gray-800 rounded animate-pulse"
                      />
                      <div
                        className="absolute inset-y-0 left-[40%] w-[25%] bg-gray-100 
                      dark:bg-gray-800 rounded animate-pulse"
                        style={{ animationDelay: `${i * 200}ms` }}
                      />
                      <div
                        className="absolute inset-y-0 left-[70%] w-[20%] bg-gray-100 
                      dark:bg-gray-800 rounded animate-pulse"
                        style={{ animationDelay: `${i * 400}ms` }}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
                  <span>Genome position (base pairs)</span>
                  <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div
        className="absolute inset-0 flex items-center justify-center bg-white/50 
    dark:bg-gray-900/50 z-20"
      >
        <div className="text-center max-w-md p-6">
          <div
            className="w-12 h-12 mx-auto mb-4 rounded-full bg-amber-100 
        dark:bg-amber-900/30 flex items-center justify-center"
          >
            <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No Gene Data Available
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            The genome viewer is ready but no gene data could be loaded. This
            might be due to:
          </p>
          <ul
            className="text-sm text-left text-gray-600 dark:text-gray-400 space-y-2 
        mb-4 ml-4"
          >
            <li className="flex items-start gap-2">
              <span className="w-1 h-1 rounded-full bg-gray-400 mt-2" />
              Genes have not already been added
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1 h-1 rounded-full bg-gray-400 mt-2" />
              Only the raw genome sequence is available
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1 h-1 rounded-full bg-gray-400 mt-2" />
              Server connection issues
            </li>
            <li className="flex items-start gap-2">
              <button
                onClick={onBackToGenomes}
                className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 
                        dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors group"
              >
                <ChevronLeft className="w-4 h-4 transform group-hover:-translate-x-0.5 transition-transform" />
                <span>Select a different genome</span>
              </button>
            </li>
          </ul>
        </div>
        <div className="flex items-start gap-2">
        <button
          onClick={onBackToGenomes}
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 
                        dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 transform group-hover:-translate-x-0.5 transition-transform" />
          <span>Select a different genome</span>
        </button>
      </div>
      </div>
      
    </>
  );
};

export default EmptyGenomeViewer;
