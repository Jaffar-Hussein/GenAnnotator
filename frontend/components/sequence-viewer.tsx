'use client'
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Copy, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const SequenceTrackViewer = ({ 
  sequence = '', 
  title = 'DNA Sequence Viewer',
  startPosition = 1  // Add start position parameter from the sequence
}) => {
  const [baseWidth, setBaseWidth] = useState(20);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [selectedRange, setSelectedRange] = useState({ start: 0, end: 0 });
  const [showCopiedAlert, setShowCopiedAlert] = useState(false);
  const [stats, setStats] = useState({ 
    gc: 0,
    length: 0,
    composition: { A: 0, T: 0, G: 0, C: 0 }
  });
  const [visibleRange, setVisibleRange] = useState({ start: startPosition, end: startPosition + 50 });
  
  const trackRef = useRef(null);

  useEffect(() => {
    // Calculate sequence statistics
    const composition = sequence.split('').reduce((acc, base) => {
      acc[base.toUpperCase()] = (acc[base.toUpperCase()] || 0) + 1;
      return acc;
    }, {});

    const gcCount = (composition['G'] || 0) + (composition['C'] || 0);
    const gcContent = (gcCount / sequence.length) * 100;

    setStats({
      gc: gcContent.toFixed(1),
      length: sequence.length,
      composition
    });
  }, [sequence]);

  const getBaseColor = (base) => {
    const baseColors = {
      'A': 'bg-emerald-500 hover:bg-emerald-600',
      'T': 'bg-rose-500 hover:bg-rose-600',
      'C': 'bg-blue-500 hover:bg-blue-600',
      'G': 'bg-amber-500 hover:bg-amber-600',
      'N': 'bg-gray-500 hover:bg-gray-600'
    };
    return baseColors[base.toUpperCase()] || 'bg-gray-500 hover:bg-gray-600';
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - trackRef.current.offsetLeft);
    setScrollLeft(trackRef.current.scrollLeft);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - trackRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    const newScrollLeft = scrollLeft - walk;
    trackRef.current.scrollLeft = newScrollLeft;
    
    // Update visible range based on scroll position
    const visibleBasesStart = Math.floor(newScrollLeft / baseWidth);
    const visibleBasesEnd = Math.floor((newScrollLeft + trackRef.current.clientWidth) / baseWidth);
    setVisibleRange({
      start: startPosition + visibleBasesStart,
      end: Math.min(startPosition + visibleBasesEnd, startPosition + sequence.length - 1)
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const copySequence = async () => {
    try {
      await navigator.clipboard.writeText(sequence);
      setShowCopiedAlert(true);
      setTimeout(() => setShowCopiedAlert(false), 2000);
    } catch (err) {
      console.error('Failed to copy sequence:', err);
    }
  };

  const handleZoom = (delta) => {
    setBaseWidth(prev => {
      const newWidth = prev + delta;
      const adjustedWidth = Math.min(Math.max(newWidth, 10), 50);
      
      // Update visible range after zoom
      if (trackRef.current) {
        const visibleBasesStart = Math.floor(trackRef.current.scrollLeft / adjustedWidth);
        const visibleBasesEnd = Math.floor((trackRef.current.scrollLeft + trackRef.current.clientWidth) / adjustedWidth);
        setVisibleRange({
          start: startPosition + visibleBasesStart,
          end: Math.min(startPosition + visibleBasesEnd, startPosition + sequence.length - 1)
        });
      }
      
      return adjustedWidth;
    });
  };

  return (
    <Card className="w-full bg-white dark:bg-gray-900 shadow-lg">
      <CardHeader className="border-b border-gray-200 dark:border-gray-800">
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold">{title}</CardTitle>
            <div className="flex items-center gap-2">
              <button
                onClick={copySequence}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Copy sequence"
              >
                <Copy className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleZoom(5)}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Zoom in"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleZoom(-5)}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Zoom out"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Sequence Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">Length</div>
              <div className="text-lg font-semibold">{stats.length.toLocaleString()} bp</div>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">GC Content</div>
              <div className="text-lg font-semibold">{stats.gc}%</div>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">AT Content</div>
              <div className="text-lg font-semibold">{(100 - parseFloat(stats.gc)).toFixed(1)}%</div>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">View Width</div>
              <div className="text-lg font-semibold">{baseWidth}px</div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {showCopiedAlert && (
          <Alert className="mb-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900/50">
            <Info className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-600 dark:text-green-400">
              Sequence copied to clipboard!
            </AlertDescription>
          </Alert>
        )}

        <div className="relative">
          {/* Current position indicator */}
          <div className="mb-2 px-2">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Position: {visibleRange.start} - {visibleRange.end} 
              <span className="ml-2 text-gray-400">
                (Viewing {visibleRange.end - visibleRange.start + 1} bases)
              </span>
            </div>
          </div>

          {/* Position markers */}
          <div className="h-6 relative mb-1 overflow-hidden">
            {sequence.split('').map((_, i) => (
              (i % 10 === 0) && (
                <div
                  key={i}
                  className="absolute text-xs text-gray-500 dark:text-gray-400"
                  style={{ left: `${i * baseWidth}px` }}
                >
                  {startPosition + i}
                </div>
              )
            ))}
          </div>

          {/* Sequence viewer */}
          <div
            ref={trackRef}
            className="overflow-x-auto relative cursor-grab active:cursor-grabbing rounded-lg"
            style={{ height: '120px' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div
              className="flex h-full"
              style={{ width: `${sequence.length * baseWidth}px` }}
            >
              {sequence.split('').map((base, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-center h-full ${getBaseColor(base)} 
                    border-r border-white/20 dark:border-black/20 transition-colors duration-150`}
                  style={{ width: `${baseWidth}px` }}
                >
                  <span className="text-sm font-mono font-bold text-white select-none">
                    {base}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation controls */}
          <div className="flex justify-between mt-4">
            <button
              onClick={() => {
                const newScrollLeft = trackRef.current.scrollLeft - baseWidth * 10;
                trackRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
                const visibleBasesStart = Math.floor(newScrollLeft / baseWidth);
                setVisibleRange({
                  start: startPosition + visibleBasesStart,
                  end: Math.min(startPosition + visibleBasesStart + Math.floor(trackRef.current.clientWidth / baseWidth), startPosition + sequence.length - 1)
                });
              }}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                const newScrollLeft = trackRef.current.scrollLeft + baseWidth * 10;
                trackRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
                const visibleBasesStart = Math.floor(newScrollLeft / baseWidth);
                setVisibleRange({
                  start: startPosition + visibleBasesStart,
                  end: Math.min(startPosition + visibleBasesStart + Math.floor(trackRef.current.clientWidth / baseWidth), startPosition + sequence.length - 1)
                });
              }}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-6 justify-center">
          {Object.entries(stats.composition).map(([base, count]) => (
            <div key={base} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded ${getBaseColor(base)}`}></div>
              <span className="text-sm font-medium">
                {base}: {((count / stats.length) * 100).toFixed(1)}% ({count.toLocaleString()})
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SequenceTrackViewer;