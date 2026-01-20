import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { TripList } from './components/TripList';
import { TripForm } from './components/TripForm';
import { VehicleManager } from './components/VehicleManager';

const App: React.FC = () => {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="trips" element={<TripList />} />
            <Route path="trips/new" element={<TripForm />} />
            <Route path="trips/edit/:id" element={<TripForm />} />
            <Route path="vehicles" element={<VehicleManager />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </AppProvider>
  );
};

export default App;
