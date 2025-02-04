import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Copy, Search, ChevronRight, ArrowLeft, ArrowRight, CornerDownLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from "@/components/ui/card";

interface SequenceDisplayProps {
  sequence?: string | null;
  width?: number;
}

interface SearchMatch {
  position: number;
  sequence: string;
  context: string;
}

const nucleotideColors = {
  'A': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300', 
  'T': 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',       
  'G': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',     
  'C': 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
  'N': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  '-': 'bg-gray-50 text-gray-500 dark:bg-gray-900 dark:text-gray-500'
};

const SequenceDisplay: React.FC<SequenceDisplayProps> = ({ 
  sequence = '',
  width = 70,
}) => {
  // 1. All useState hooks
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMatch, setSelectedMatch] = useState<SearchMatch | null>(null);
  const [searchMatches, setSearchMatches] = useState<SearchMatch[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);

  // 2. All useRef hooks
  const containerRef = useRef<HTMLDivElement>(null);
  const sequenceLineRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Helper function - defined before hooks that use it
  const getSequenceContext = useCallback((position: number, matchLength: number) => {
    const contextSize = 10;
    const start = Math.max(0, position - contextSize);
    const end = Math.min(sequence.length, position + matchLength + contextSize);
    const context = sequence.slice(start, end);
    
    return {
      before: context.slice(0, position - start),
      match: context.slice(position - start, position - start + matchLength),
      after: context.slice(position - start + matchLength)
    };
  }, [sequence]);

  // 3. All useCallback hooks
  const findMatches = useCallback((query: string) => {
    setSearchQuery(query);
    if (!query || query.length < 2) {
      setSearchMatches([]);
      setShowDropdown(false);
      return;
    }

    const matches: SearchMatch[] = [];
    const upperSequence = sequence.toUpperCase();
    const upperQuery = query.toUpperCase();
    let position = -1;

    while ((position = upperSequence.indexOf(upperQuery, position + 1)) !== -1) {
      const { before, match, after } = getSequenceContext(position, query.length);
      
      matches.push({
        position,
        sequence: match,
        context: `${before}${match}${after}`
      });

      if (matches.length >= 10) break;
    }

    setSearchMatches(matches);
    setShowDropdown(matches.length > 0);
  }, [sequence, getSequenceContext]);

  const scrollToMatch = useCallback((match: SearchMatch) => {
    setSelectedMatch(match);
    setShowDropdown(false);
    setSearchQuery('');

    const lineNumber = Math.floor(match.position / width);
    const lineElement = containerRef.current?.children[lineNumber];
    if (lineElement) {
      const matchPositionInLine = match.position % width;
      const nucleotideWidth = 26;
      const scrollPosition = matchPositionInLine * nucleotideWidth;

      if (sequenceLineRef.current) {
        sequenceLineRef.current.scrollTo({
          left: scrollPosition - (sequenceLineRef.current.clientWidth / 2) + (nucleotideWidth * 2),
          behavior: 'smooth'
        });
      }

      lineElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [width]);

  const returnToMatch = useCallback(() => {
    if (selectedMatch && containerRef.current && sequenceLineRef.current) {
      const lineNumber = Math.floor(selectedMatch.position / width);
      const lineElement = containerRef.current.children[lineNumber];
      
      if (lineElement) {
        const matchPositionInLine = selectedMatch.position % width;
        const nucleotideWidth = 26;
        const scrollPosition = matchPositionInLine * nucleotideWidth;

        sequenceLineRef.current.scrollTo({
          left: scrollPosition - (sequenceLineRef.current.clientWidth / 2) + (nucleotideWidth * 2),
          behavior: 'smooth'
        });

        lineElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  }, [selectedMatch, width]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(sequence);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [sequence]);

  // 4. All useEffect hooks
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Early return check after all hooks
  if (!sequence) {
    return (
      <div className="w-full p-8 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 rounded-xl border dark:border-gray-800">
        No sequence data available
      </div>
    );
  }

  // Prepare data for rendering
  const lines = [];
  const cleanSequence = sequence.toString().toUpperCase();
  for (let i = 0; i < cleanSequence.length; i += width) {
    lines.push({
      position: i + 1,
      sequence: cleanSequence.slice(i, i + width)
    });
  }

  return (
    <div className="font-mono text-sm w-full">
      {/* Search Bar with Dropdown */}
      <div className="mb-6 relative" ref={dropdownRef}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Search sequence..."
            value={searchQuery}
            onChange={(e) => findMatches(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-800 
                     text-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none
                     shadow-sm"
            onFocus={() => setShowDropdown(searchMatches.length > 0)}
          />
        </div>

        {/* Search Results Dropdown */}
        {showDropdown && searchMatches.length > 0 && (
          <Card className="absolute z-50 w-full mt-2 overflow-hidden">
            <CardContent className="p-0">
              <div className="max-h-96 overflow-y-auto">
                <div className="py-1 px-2 text-xs text-gray-500 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  {searchMatches.length} matches found
                </div>
                {searchMatches.map((match, index) => {
                  const contextStart = match.context.indexOf(match.sequence);
                  
                  return (
                    <button
                      key={index}
                      onClick={() => scrollToMatch(match)}
                      className="w-full px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 
                               flex items-center gap-3 border-b last:border-b-0 dark:border-gray-700"
                    >
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                      <div className="flex-1">
                        <div className="font-mono mb-1">
                          <span className="text-gray-500">{match.context.slice(0, contextStart)}</span>
                          <span className="font-bold">{match.sequence}</span>
                          <span className="text-gray-500">{match.context.slice(contextStart + match.sequence.length)}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Position {match.position + 1}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sequence Display */}
      <div className="border dark:border-gray-800 rounded-xl container bg-white dark:bg-gray-900">
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-2 border-b dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {selectedMatch ? `Match at position ${selectedMatch.position + 1}` : 'Sequence viewer'}
            </span>
            {selectedMatch && (
              <button
                onClick={returnToMatch}
                className="flex items-center gap-1 px-2 py-1 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300
                         hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                title="Return to match"
              >
                <CornerDownLeft className="w-4 h-4" />
                <span className="text-sm">Return to match</span>
              </button>
            )}
          </div>
        </div>
        
        {/* Sequence Content */}
        <div className="overflow-y-auto max-h-[32rem] max-w-screen" ref={containerRef}>
          {lines.map(({ position, sequence: lineSeq }) => {
            const lineStartPos = position - 1;
            const lineEndPos = lineStartPos + lineSeq.length;
            const hasMatchInLine = selectedMatch && 
              selectedMatch.position >= lineStartPos && 
              selectedMatch.position < lineEndPos;

            return (
              <div 
                key={position} 
                className="flex border-b last:border-b-0 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900"
              >
                {/* Position number */}
                <div className="w-20 flex-shrink-0 bg-gray-50 dark:bg-gray-900 border-r dark:border-gray-800 flex items-center justify-end px-3">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {position.toLocaleString()}
                  </span>
                </div>
                
                {/* Sequence content with scroll container */}
                <div className="relative flex-1">
                  <div 
                    ref={sequenceLineRef}
                    className="overflow-x-auto relative"
                  >
                    <div className="p-2 inline-flex gap-px min-w-full">
                      {lineSeq.split('').map((nucleotide, idx) => {
                        const absolutePosition = position - 1 + idx;
                        const isHighlighted = selectedMatch && 
                          absolutePosition >= selectedMatch.position && 
                          absolutePosition < (selectedMatch.position + selectedMatch.sequence.length);

                        return (
                          <div 
                            key={idx}
                            className={`px-1 rounded transition-all duration-200 
                                      ${nucleotideColors[nucleotide as keyof typeof nucleotideColors] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}
                                      ${isHighlighted ? 'ring-2 ring-blue-500 dark:ring-blue-400 scale-110 relative z-10' : ''}`}
                          >
                            {nucleotide}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Statistics */}
      <div className="mt-2 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
        <div>
          GC content: {((sequence.match(/[GC]/gi)?.length || 0) / sequence.length * 100).toFixed(1)}%
        </div>
        <div>
          Total length: {sequence.length.toLocaleString()} bp
        </div>
      </div>
    </div>
  );
};

export default SequenceDisplay;