import React, { useState, useRef, useEffect } from 'react';
import { Search, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";


export const biotypeCategories = [
  {
    category: "Protein",
    items: [
      {
        value: "protein_coding",
        label: "Protein Coding",
        description: "Codes for protein product"
      }
    ]
  },
  {
    category: "Pseudogenes",
    items: [
      {
        value: "processed_pseudogene",
        label: "Processed Pseudogene",
        description: "Lacks introns"
      },
      {
        value: "unprocessed_pseudogene",
        label: "Unprocessed Pseudogene",
        description: "Contains introns"
      }
    ]
  },
  {
    category: "Non-coding RNA",
    items: [
      {
        value: "lncRNA",
        label: "Long Non-coding RNA",
        description: ">200 nucleotides"
      },
      {
        value: "miRNA",
        label: "microRNA",
        description: "~22 nucleotides"
      },
      {
        value: "rRNA",
        label: "Ribosomal RNA",
        description: "Ribosome component"
      },
      {
        value: "tRNA",
        label: "Transfer RNA",
        description: "Amino acid transfer"
      }
    ]
  },
  {
    category: "Regulatory RNA",
    items: [
      {
        value: "snRNA",
        label: "Small Nuclear RNA",
        description: "Splicing regulation"
      },
      {
        value: "snoRNA",
        label: "Small Nucleolar RNA",
        description: "RNA modification"
      },
      {
        value: "antisense",
        label: "Antisense RNA",
        description: "Opposite strand transcript"
      }
    ]
  }
];

const BiotypeSearch = ({ 
  value, 
  onChange, 
  placeholder = "Search biotypes...",
  label,
  required = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Get all biotypes in a flat array for search
  const allBiotypes = biotypeCategories.flatMap(category => category.items);
  const selectedBiotype = allBiotypes.find(b => b.value === value);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!isOpen) setIsOpen(true);
  };

  const handleSelect = (biotype) => {
    onChange(biotype.value);
    setIsOpen(false);
    setSearchQuery('');
  };

  // Filter biotypes based on search query
  const getFilteredCategories = () => {
    if (!searchQuery) return biotypeCategories;

    return biotypeCategories.map(category => ({
      ...category,
      items: category.items.filter(biotype => {
        const searchStr = `${biotype.label} ${biotype.description}`.toLowerCase();
        return searchStr.includes(searchQuery.toLowerCase());
      })
    })).filter(category => category.items.length > 0);
  };

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="space-y-2">
        {label && (
          <div className="flex items-center gap-2">
            <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {label}
            </Label>
            
          </div>
        )}

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={selectedBiotype ? selectedBiotype.label : placeholder}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => setIsOpen(true)}
            className="w-full pl-10 bg-gray-50 dark:bg-gray-900 border-slate-200 
                     dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600
                     focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
          />
        </div>

        {isOpen && (
          <Card className="absolute z-50 w-full mt-1 shadow-lg">
            <CardContent className="p-0">
              <div className="max-h-[320px] overflow-y-auto">
                {getFilteredCategories().map((category, idx) => (
                  <div key={category.category}>
                    {/* Category Header */}
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 
                                  bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
                      {category.category}
                    </div>
                    
                    {/* Category Items */}
                    <div>
                      {category.items.map((biotype) => (
                        <button
                          key={biotype.value}
                          onClick={() => handleSelect(biotype)}
                          className="w-full px-3 py-2 text-left dark:bg-gray-900 hover:bg-indigo-50 dark:hover:bg-indigo-900/20
                                   flex items-center gap-3 border-b last:border-b-0 dark:border-gray-700
                                   transition-colors"
                        >
                          <div className="w-5">
                            {value === biotype.value && (
                              <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {biotype.label}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {biotype.description}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {getFilteredCategories().length === 0 && (
                  <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                    No matching biotypes found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BiotypeSearch;