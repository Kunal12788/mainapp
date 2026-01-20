import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Trip, Vehicle } from '../types';

interface AppContextType {
  trips: Trip[];
  vehicles: Vehicle[];
  addTrip: (trip: Trip) => void;
  updateTrip: (trip: Trip) => void;
  deleteTrip: (id: string) => void;
  addVehicle: (vehicle: Vehicle) => void;
  updateVehicle: (vehicle: Vehicle) => void;
  deleteVehicle: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_TRIPS = 'navexa_trips';
const LOCAL_STORAGE_KEY_VEHICLES = 'navexa_vehicles';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  // Load data on mount
  useEffect(() => {
    const loadedTrips = localStorage.getItem(LOCAL_STORAGE_KEY_TRIPS);
    const loadedVehicles = localStorage.getItem(LOCAL_STORAGE_KEY_VEHICLES);
    
    if (loadedTrips) {
      try {
        setTrips(JSON.parse(loadedTrips));
      } catch (e) {
        console.error("Failed to parse trips", e);
      }
    }
    
    if (loadedVehicles) {
      try {
        setVehicles(JSON.parse(loadedVehicles));
      } catch (e) {
        console.error("Failed to parse vehicles", e);
      }
    }
  }, []);

  // Save data on change
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_TRIPS, JSON.stringify(trips));
  }, [trips]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_VEHICLES, JSON.stringify(vehicles));
  }, [vehicles]);

  const addTrip = (trip: Trip) => {
    setTrips(prev => [trip, ...prev]);
  };

  const updateTrip = (updatedTrip: Trip) => {
    setTrips(prev => prev.map(t => t.id === updatedTrip.id ? updatedTrip : t));
  };

  const deleteTrip = (id: string) => {
    setTrips(prev => prev.filter(t => t.id !== id));
  };

  const addVehicle = (vehicle: Vehicle) => {
    setVehicles(prev => [vehicle, ...prev]);
  };

  const updateVehicle = (updatedVehicle: Vehicle) => {
    setVehicles(prev => prev.map(v => v.id === updatedVehicle.id ? updatedVehicle : v));
  };

  const deleteVehicle = (id: string) => {
    setVehicles(prev => prev.filter(v => v.id !== id));
  };

  return (
    <AppContext.Provider value={{
      trips,
      vehicles,
      addTrip,
      updateTrip,
      deleteTrip,
      addVehicle,
      updateVehicle,
      deleteVehicle
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
