'use client';
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";

const SequenceTrackViewer = ({ sequence = '', title = 'Sequence Track' }) => {
  const [baseWidth, setBaseWidth] = useState(20);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const trackRef = useRef(null);

  // Color mapping for nucleotides
  const getBaseColor = (base) => {
    const baseColors = {
      'A': 'bg-green-500 dark:bg-green-600',
      'T': 'bg-red-500 dark:bg-red-600',
      'C': 'bg-blue-500 dark:bg-blue-600',
      'G': 'bg-yellow-500 dark:bg-yellow-600',
      'N': 'bg-gray-500 dark:bg-gray-600'
    };
    return baseColors[base.toUpperCase()] || 'bg-gray-500 dark:bg-gray-600';
  };

  // Handle mouse events for dragging
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
    trackRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <Card className="w-full bg-gray-50 dark:bg-gray-900/50">
      <CardHeader className="border-b">
        <div className="flex justify-between items-center">
          <CardTitle>{title}</CardTitle>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setBaseWidth(prev => Math.min(prev + 5, 50))}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
              title="Zoom in"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button
              onClick={() => setBaseWidth(prev => Math.max(prev - 5, 10))}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
              title="Zoom out"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {/* Main sequence track */}
        <div className="relative">
          {/* Position markers */}
          <div className="h-6 relative mb-1 overflow-hidden">
            {sequence.split('').map((_, i) => (
              (i % 10 === 0) && (
                <div
                  key={i}
                  className="absolute text-xs text-gray-500"
                  style={{ left: `${i * baseWidth}px` }}
                >
                  {i}
                </div>
              )
            ))}
          </div>

          {/* Sequence viewer */}
          <div
            ref={trackRef}
            className="overflow-x-auto relative cursor-grab active:cursor-grabbing"
            style={{ height: '100px' }}
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
                    border-r border-white dark:border-gray-800`}
                  style={{ width: `${baseWidth}px` }}
                >
                  <span className="text-sm font-mono font-bold text-white">
                    {base}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Simple navigation arrows */}
          <div className="flex justify-between mt-2">
            <button
              onClick={() => trackRef.current.scrollBy({ left: -baseWidth * 10, behavior: 'smooth' })}
              className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => trackRef.current.scrollBy({ left: baseWidth * 10, behavior: 'smooth' })}
              className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4">
          {['A', 'T', 'C', 'G'].map(base => (
            <div key={base} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded ${getBaseColor(base)}`}></div>
              <span className="text-sm">{base}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SequenceTrackViewer;