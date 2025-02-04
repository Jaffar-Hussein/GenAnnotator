import React from 'react';
import { ArrowLeft, ArrowRight } from "lucide-react";


const StrandSelector = ({ value, onChange, label, required = false }) => {
  const handleSelect = (strand) => {
    onChange(strand);
  };

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center gap-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
          
        </div>
      )}
      
      <div className="flex gap-3">
        {/* Forward Strand Button */}
        <button
          type="button"
          onClick={() => handleSelect(1)}
          className={`flex-1 p-3 rounded-lg border transition-all group
            ${value === 1 
              ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/30 dark:border-indigo-800' 
              : 'bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
        >
          <div className="flex items-center justify-between">
            <div className={`flex flex-col items-start gap-1 transition-colors
              ${value === 1 
                ? 'text-indigo-700 dark:text-indigo-300' 
                : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <span className="text-sm font-medium">Forward</span>
              <span className="text-xs">5' → 3'</span>
            </div>
            <ArrowRight className={`w-4 h-4 transition-colors
              ${value === 1 
                ? 'text-indigo-500 dark:text-indigo-400' 
                : 'text-gray-400 dark:text-gray-500'
              }`} 
            />
          </div>
        </button>

        {/* Reverse Strand Button */}
        <button
          type="button"
          onClick={() => handleSelect(-1)}
          className={`flex-1 p-3 rounded-lg border transition-all group
            ${value === -1 
              ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/30 dark:border-indigo-800' 
              : 'bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
        >
          <div className="flex items-center justify-between">
            <ArrowLeft className={`w-4 h-4 transition-colors
              ${value === -1 
                ? 'text-indigo-500 dark:text-indigo-400' 
                : 'text-gray-400 dark:text-gray-500'
              }`} 
            />
            <div className={`flex flex-col items-end gap-1 transition-colors
              ${value === -1 
                ? 'text-indigo-700 dark:text-indigo-300' 
                : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <span className="text-sm font-medium">Reverse</span>
              <span className="text-xs">3' ← 5'</span>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default StrandSelector;