"use client";

import { useEffect, useRef, useState } from "react";
import { useLocationStore } from "@/store/locationStore";
import { LocationPoint } from "@/store/locationStore";

interface MapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  showHistory?: boolean;
}

export default function Map({ center, zoom = 15, showHistory = true }: MapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { currentLocation, locationHistory } = useLocationStore();
  const [dimensions, setDimensions] = useState({ width: 400, height: 300 });

  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current?.parentElement) {
        const { width, height } = canvasRef.current.parentElement.getBoundingClientRect();
        setDimensions({ width: Math.max(width, 300), height: Math.max(height, 200) });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid lines
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= canvas.width; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i <= canvas.height; i += 20) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    // Calculate bounds
    let minLat = Infinity, maxLat = -Infinity;
    let minLng = Infinity, maxLng = -Infinity;

    const allPoints = [...(currentLocation ? [currentLocation] : []), ...locationHistory];
    
    allPoints.forEach(point => {
      minLat = Math.min(minLat, point.latitude);
      maxLat = Math.max(maxLat, point.latitude);
      minLng = Math.min(minLng, point.longitude);
      maxLng = Math.max(maxLng, point.longitude);
    });

    if (allPoints.length === 0) {
      // Show placeholder message
      ctx.fillStyle = '#64748b';
      ctx.font = '16px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('No location data available', canvas.width / 2, canvas.height / 2);
      return;
    }

    // Add padding
    const padding = 20;
    const bounds = {
      minLat: minLat - 0.001,
      maxLat: maxLat + 0.001,
      minLng: minLng - 0.001,
      maxLng: maxLng + 0.001,
    };

    // Scale coordinates to canvas
    const scaleX = (lng: number) => 
      padding + ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * (canvas.width - 2 * padding);
    
    const scaleY = (lat: number) => 
      canvas.height - padding - ((lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * (canvas.height - 2 * padding);

    // Draw polyline for history
    if (showHistory && locationHistory.length > 1) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      locationHistory.forEach((point, index) => {
        const x = scaleX(point.longitude);
        const y = scaleY(point.latitude);
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.stroke();
    }

    // Draw history points
    if (showHistory && locationHistory.length > 0) {
      ctx.fillStyle = '#94a3b8';
      locationHistory.forEach((point, index) => {
        const x = scaleX(point.longitude);
        const y = scaleY(point.latitude);
        
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
      });
    }

    // Draw current location
    if (currentLocation) {
      const x = scaleX(currentLocation.longitude);
      const y = scaleY(currentLocation.latitude);
      
      // Outer circle
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, 2 * Math.PI);
      ctx.fill();
      
      // Inner circle
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
      
      // Pulse effect
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 12, 0, 2 * Math.PI);
      ctx.stroke();
    }

    // Add coordinate labels
    ctx.fillStyle = '#475569';
    ctx.font = '12px Inter';
    ctx.textAlign = 'left';
    
    // Top-left corner coordinates
    ctx.fillText(`${bounds.minLat.toFixed(4)}, ${bounds.minLng.toFixed(4)}`, 10, 20);
    
    // Bottom-right corner coordinates
    ctx.fillText(`${bounds.maxLat.toFixed(4)}, ${bounds.maxLng.toFixed(4)}`, canvas.width - 120, canvas.height - 10);

  }, [currentLocation, locationHistory, showHistory, dimensions]);

  return (
    <div className="w-full h-full bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden relative">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: 'block' }}
      />
      
      {/* Map legend */}
      <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 bg-opacity-90 rounded-lg p-2 text-xs">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span>Current Location</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
          <span>History Points</span>
        </div>
      </div>
    </div>
  );
}
