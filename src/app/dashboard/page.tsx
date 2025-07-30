"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocationStore } from "@/store/locationStore";
import { useLocation } from "@/hooks/useLocation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Play, Pause, Download, MapPin, Clock, Target } from "lucide-react";
import Map from "@/components/Map";

export default function DashboardPage() {
  const router = useRouter();
  const {
    currentLocation,
    locationHistory,
    isTracking,
    error,
    startTracking,
    stopTracking,
    clearHistory,
  } = useLocationStore();

  const { startLocationTracking, stopLocationTracking } = useLocation();

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (error) {
      console.error("Location error:", error);
    }
  }, [error]);

  const handleStartTracking = async () => {
    setIsLoading(true);
    try {
      startTracking();
      await startLocationTracking();
    } catch (err) {
      console.error("Failed to start tracking:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopTracking = () => {
    stopTracking();
    stopLocationTracking();
  };

  const handleExportData = () => {
    const data = {
      currentLocation,
      locationHistory,
      exportDate: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `location-data-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Location Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Real-time GPS tracking and location history
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push("/")}
          >
            Back to Home
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Current Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentLocation ? (
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-semibold">Latitude:</span> {currentLocation.latitude.toFixed(6)}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Longitude:</span> {currentLocation.longitude.toFixed(6)}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Accuracy:</span> {formatDistance(currentLocation.accuracy || 0)}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Time:</span> {formatTime(currentLocation.timestamp)}
                  </p>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No location data</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Tracking Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Badge variant={isTracking ? "default" : "secondary"}>
                  {isTracking ? "Active" : "Inactive"}
                </Badge>
                <div className="flex gap-2">
                  {!isTracking ? (
                    <Button
                      onClick={handleStartTracking}
                      disabled={isLoading}
                      className="flex items-center gap-2"
                    >
                      <Play className="h-4 w-4" />
                      {isLoading ? "Starting..." : "Start Tracking"}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleStopTracking}
                      variant="destructive"
                      className="flex items-center gap-2"
                    >
                      <Pause className="h-4 w-4" />
                      Stop Tracking
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-semibold">Total Points:</span> {locationHistory.length}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Tracking:</span> {isTracking ? "Active" : "Inactive"}
                </p>
                <Button
                  onClick={handleExportData}
                  variant="outline"
                  className="w-full flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Location History</CardTitle>
            <CardDescription>
              {locationHistory.length} location points recorded
            </CardDescription>
          </CardHeader>
          <CardContent>
            {locationHistory.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {locationHistory.map((location) => (
                  <div
                    key={location.id}
                    className="border rounded-lg p-4 bg-white dark:bg-gray-800"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="font-semibold">Coordinates</p>
                        <p>{location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}</p>
                      </div>
                      <div>
                        <p className="font-semibold">Accuracy</p>
                        <p>{formatDistance(location.accuracy || 0)}</p>
                      </div>
                      <div>
                        <p className="font-semibold">Time</p>
                        <p>{formatTime(location.timestamp)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                No location history yet. Start tracking to record your movements.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Map Component */}
        <div className="mt-8 h-96">
          <Map />
        </div>
      </div>
    </div>
  );
}
