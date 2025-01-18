import React from "react";
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { PencilRulerIcon, Split, ChevronRight, Activity, RulerIcon } from "lucide-react";

const GeneCard = ({ gene }) => {
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "annotated":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300";
      case "pending":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-900/50 dark:text-slate-300";
    }
  };

  return (
    <Link href={`/genes/${gene.id}`} className="group block">
      <Card className="relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border border-indigo-200/50 dark:border-indigo-800/50 bg-white dark:bg-gray-800 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent dark:from-indigo-950/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <CardContent className="p-6 space-y-4 relative">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <CardTitle className="text-lg font-semibold text-indigo-700 dark:text-indigo-300 group-hover:text-indigo-800 dark:group-hover:text-indigo-200 transition-colors truncate">
                {gene.name}
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400 truncate">
                {gene.genome}
              </CardDescription>
            </div>
            <Badge
              variant="secondary"
              className={`shrink-0 ${getStatusColor(gene.status)}`}
            >
              {gene.status}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 p-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/50">
              <div className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-300">
                <Split className="h-4 w-4" />
                <span className="font-medium">Position</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 font-mono">
                {gene.position}
              </p>
            </div>
            <div className="space-y-2 p-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/50">
              <div className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-300">
              <RulerIcon className="h-4 w-4" />
                
                <span className="font-medium">Length</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {gene.length.toLocaleString()} bp
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-300">
              <Activity className="h-4 w-4" />
              <span className="font-medium">GC Content</span>
            </div>
            <div className="relative h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="absolute inset-y-0 left-0 bg-indigo-500 dark:bg-indigo-400 rounded-full"
                style={{ width: gene.gcPercentage }}
              />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-right">
              {gene.gcPercentage}
            </p>
          </div>

          <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-500 dark:text-gray-400 font-mono truncate">
                  {gene.sequence.substring(0, 20)}...
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-500 dark:text-gray-600 dark:group-hover:text-indigo-400 transform group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default GeneCard;