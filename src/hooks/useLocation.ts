"use client";

import { useEffect, useState } from "react";
import { useLocationStore } from "@/store/locationStore";

export const useLocation = () => {
  const {
    currentLocation,
    locationHistory,
    isTracking,
    error,
    watchId,
    setCurrentLocation,
    addToHistory,
    setTracking,
    setError,
    setWatchId,
    startTracking,
    stopTracking,
  } = useLocationStore();

  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setIsSupported(false);
      setError("Geolocation is not supported by this browser");
      return;
    }
  }, [setError]);

  const startLocationTracking = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser");
      return;
    }

    startTracking();

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const locationPoint = {
          id: Date.now().toString(),
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: new Date(),
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude || undefined,
          speed: position.coords.speed || undefined,
        };

        setCurrentLocation(locationPoint);
        addToHistory(locationPoint);
        setError(null);
      },
      (error) => {
        let errorMessage = "An error occurred while retrieving location";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission denied";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timeout";
            break;
        }
        
        setError(errorMessage);
        stopTracking();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    setWatchId(id);
  };

  const stopLocationTracking = () => {
    stopTracking();
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  };

  const getCurrentPosition = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser");
      return Promise.reject("Geolocation not supported");
    }

    return new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => {
          let errorMessage = "An error occurred while retrieving location";
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location permission denied";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information unavailable";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timeout";
              break;
          }
          
          setError(errorMessage);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  };

  return {
    currentLocation,
    locationHistory,
    isTracking,
    error,
    isSupported,
    startLocationTracking,
    stopLocationTracking,
    getCurrentPosition,
  };
};
