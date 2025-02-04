import React, { useState } from 'react';
import { Minimize2, Maximize2, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const PfamAlignment = ({ align }) => {
  const [showFullAlignment, setShowFullAlignment] = useState(false);
  const [showHelp, setShowHelp] = useState(true);

  const colorizeAA = (char) => {
    if ('.|-'.includes(char)) return 'text-gray-400';
    if ('ILVAM'.includes(char)) return 'text-blue-600 dark:text-blue-400';
    if ('FWY'.includes(char)) return 'text-purple-600 dark:text-purple-400';
    if ('KRH'.includes(char)) return 'text-red-600 dark:text-red-400';
    if ('DE'.includes(char)) return 'text-pink-600 dark:text-pink-400';
    if ('STNQ'.includes(char)) return 'text-green-600 dark:text-green-400';
    if ('CGP'.includes(char)) return 'text-orange-600 dark:text-orange-400';
    return 'text-gray-800 dark:text-gray-200';
  };

  if (!align || align.length !== 4) {
    return <div>Invalid alignment format</div>;
  }

  return (
    <div className="space-y-4">
      {/* Brief explanation */}
      {showHelp && (
        <div className="text-sm bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900 rounded-lg p-4 space-y-2">
          <div className="font-medium text-blue-800 dark:text-blue-200">Understanding this alignment</div>
          <ul className="space-y-1 text-blue-700 dark:text-blue-300">
            <li>• HMM line shows the consensus sequence from the protein family model</li>
            <li>• Match line (+) indicates conserved positions between your sequence and the model</li>
            <li>• PP line shows confidence scores (0-9,*) for each position</li>
            <li>• SEQ line is your protein sequence</li>
          </ul>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowHelp(false)}
            className="text-xs mt-2"
          >
            Hide explanation
          </Button>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium">Sequence Alignment</div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="p-0 h-auto"
                    onClick={() => setShowHelp(true)}
                  >
                    <HelpCircle className="h-4 w-4 text-gray-400" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Show alignment explanation</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFullAlignment(!showFullAlignment)}
            className="gap-1 text-xs"
          >
            {showFullAlignment ? (
              <>
                <Minimize2 className="h-3.5 w-3.5" />
                <span>Collapse</span>
              </>
            ) : (
              <>
                <Maximize2 className="h-3.5 w-3.5" />
                <span>Expand</span>
              </>
            )}
          </Button>
        </div>

        <div
          className={`
            relative bg-gray-50 dark:bg-gray-900 
            rounded-lg border border-gray-100 dark:border-gray-800
            transition-all duration-200
            ${showFullAlignment ? '' : 'max-h-48'}
          `}
        >
          <div className="overflow-auto">
            <pre className="p-4 font-mono text-sm leading-relaxed">
              {align.map((line, i) => {
                const [label, sequence] = line.split(/\s+(?=[A-Za-z.*+-])/);
                
                return (
                  <div key={i} className="whitespace-pre mb-1 group">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-block w-20 text-gray-500 cursor-help">
                            {label}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          {i === 0 ? (
                            "HMM consensus sequence from the protein family model"
                          ) : i === 1 ? (
                            "Match states: + indicates conserved positions"
                          ) : i === 2 ? (
                            "Posterior probabilities: confidence scores (0-9,*)"
                          ) : (
                            "Your protein sequence"
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    {i === 1 ? (
                      <span className="text-gray-400">{sequence}</span>
                    ) : i === 2 ? (
                      <span className="text-gray-400">{sequence}</span>
                    ) : (
                      sequence.split('').map((char, j) => (
                        <span key={j} className={colorizeAA(char)}>
                          {char}
                        </span>
                      ))
                    )}
                  </div>
                );
              })}
            </pre>
          </div>

          {!showFullAlignment && (
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-50 dark:from-gray-900 to-transparent" />
          )}
        </div>

        {/* Legend for amino acid properties */}
        <div className="flex flex-wrap gap-2 text-xs pt-2">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 bg-blue-500 rounded-sm opacity-75" />
            <span className="text-gray-600 dark:text-gray-400">Hydrophobic</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 bg-purple-500 rounded-sm opacity-75" />
            <span className="text-gray-600 dark:text-gray-400">Aromatic</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 bg-red-500 rounded-sm opacity-75" />
            <span className="text-gray-600 dark:text-gray-400">Basic</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 bg-pink-500 rounded-sm opacity-75" />
            <span className="text-gray-600 dark:text-gray-400">Acidic</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 bg-green-500 rounded-sm opacity-75" />
            <span className="text-gray-600 dark:text-gray-400">Polar</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 bg-orange-500 rounded-sm opacity-75" />
            <span className="text-gray-600 dark:text-gray-400">Special</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PfamAlignment;