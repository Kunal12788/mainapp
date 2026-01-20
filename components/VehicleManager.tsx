import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Vehicle } from '../types';
import { Plus, Trash2, PenTool, AlertTriangle, CheckCircle } from 'lucide-react';

export const VehicleManager: React.FC = () => {
  const { vehicles, addVehicle, deleteVehicle, updateVehicle } = useApp();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const emptyVehicle: Omit<Vehicle, 'id'> = {
    registrationNumber: '',
    model: '',
    lastServiceDate: '',
    nextServiceDue: '',
    insuranceExpiry: '',
    pollutionExpiry: ''
  };

  const [formData, setFormData] = useState(emptyVehicle);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateVehicle({ ...formData, id: editingId });
    } else {
      addVehicle({ ...formData, id: crypto.randomUUID() });
    }
    setFormData(emptyVehicle);
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleEdit = (vehicle: Vehicle) => {
    setFormData(vehicle);
    setEditingId(vehicle.id);
    setIsFormOpen(true);
  };

  const getExpiryStatus = (dateString?: string) => {
    if (!dateString) return 'secondary';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    if (diffDays < 0) return 'expired';
    if (diffDays < 30) return 'warning';
    return 'ok';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Vehicle Management</h1>
        <button 
          onClick={() => {
            setFormData(emptyVehicle);
            setEditingId(null);
            setIsFormOpen(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Vehicle
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{editingId ? 'Edit Vehicle' : 'New Vehicle'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Registration Number</label>
              <input required type="text" value={formData.registrationNumber} onChange={e => setFormData({...formData, registrationNumber: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Model</label>
              <input required type="text" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
            </div>
            
            {/* Maintenance Dates */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Service</label>
              <input type="date" value={formData.lastServiceDate} onChange={e => setFormData({...formData, lastServiceDate: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700">Next Service Due</label>
              <input type="date" value={formData.nextServiceDue} onChange={e => setFormData({...formData, nextServiceDue: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700">Insurance Expiry</label>
              <input type="date" value={formData.insuranceExpiry} onChange={e => setFormData({...formData, insuranceExpiry: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700">Pollution Expiry</label>
              <input type="date" value={formData.pollutionExpiry} onChange={e => setFormData({...formData, pollutionExpiry: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
            </div>

            <div className="col-span-1 md:col-span-4 flex justify-end gap-2 mt-2">
              <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700">Save Vehicle</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map(vehicle => (
          <div key={vehicle.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{vehicle.registrationNumber}</h3>
                <p className="text-sm text-gray-500">{vehicle.model}</p>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => handleEdit(vehicle)} className="text-gray-400 hover:text-brand-600"><PenTool className="w-4 h-4" /></button>
                <button onClick={() => deleteVehicle(vehicle.id)} className="text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <ExpiryRow label="Insurance" date={vehicle.insuranceExpiry} status={getExpiryStatus(vehicle.insuranceExpiry)} />
              <ExpiryRow label="Pollution" date={vehicle.pollutionExpiry} status={getExpiryStatus(vehicle.pollutionExpiry)} />
              <ExpiryRow label="Next Service" date={vehicle.nextServiceDue} status={getExpiryStatus(vehicle.nextServiceDue)} />
            </div>
          </div>
        ))}
        {vehicles.length === 0 && !isFormOpen && (
           <div className="col-span-full text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
             No vehicles added yet. Click "Add Vehicle" to start.
           </div>
        )}
      </div>
    </div>
  );
};

const ExpiryRow = ({ label, date, status }: { label: string, date?: string, status: string }) => {
  if (!date) return null;
  
  const statusColors = {
    ok: 'text-green-600',
    warning: 'text-amber-600 font-semibold',
    expired: 'text-red-600 font-bold',
    secondary: 'text-gray-500'
  };

  const Icon = status === 'ok' ? CheckCircle : AlertTriangle;

  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-600">{label}</span>
      <div className={`flex items-center gap-1 ${statusColors[status as keyof typeof statusColors]}`}>
        <span>{date}</span>
        {status !== 'secondary' && <Icon className="w-3 h-3" />}
      </div>
    </div>
  );
};
