import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LocationPoint {
  id: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
  accuracy?: number;
  altitude?: number;
  speed?: number;
}

export interface LocationState {
  currentLocation: LocationPoint | null;
  locationHistory: LocationPoint[];
  isTracking: boolean;
  error: string | null;
  watchId: number | null;
  
  // Actions
  setCurrentLocation: (location: LocationPoint) => void;
  addToHistory: (location: LocationPoint) => void;
  setTracking: (tracking: boolean) => void;
  setError: (error: string | null) => void;
  setWatchId: (id: number | null) => void;
  clearHistory: () => void;
  startTracking: () => void;
  stopTracking: () => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set, get) => ({
      currentLocation: null,
      locationHistory: [],
      isTracking: false,
      error: null,
      watchId: null,

      setCurrentLocation: (location) => set({ currentLocation: location }),
      
      addToHistory: (location) => set((state) => ({
        locationHistory: [...state.locationHistory, location]
      })),
      
      setTracking: (tracking) => set({ isTracking: tracking }),
      
      setError: (error) => set({ error }),
      
      setWatchId: (id) => set({ watchId: id }),
      
      clearHistory: () => set({ locationHistory: [] }),
      
      startTracking: () => set({ isTracking: true }),
      
      stopTracking: () => {
        const { watchId } = get();
        if (watchId !== null) {
          navigator.geolocation.clearWatch(watchId);
        }
        set({ isTracking: false, watchId: null });
      },
    }),
    {
      name: 'location-storage',
      partialize: (state) => ({
        locationHistory: state.locationHistory,
      }),
    }
  )
);
