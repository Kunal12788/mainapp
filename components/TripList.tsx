import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, ChevronRight, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Trip, TripFilter } from '../types';

export const TripList: React.FC = () => {
  const { trips, deleteTrip, vehicles } = useApp();
  const [filter, setFilter] = useState<TripFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTrips = trips.filter(trip => {
    const matchesSearch = 
      trip.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.pickupLocation.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    const tripDate = parseISO(trip.date);
    const now = new Date();

    if (filter === 'today') {
      return tripDate.toDateString() === now.toDateString();
    }
    if (filter === 'month') {
      return tripDate.getMonth() === now.getMonth() && tripDate.getFullYear() === now.getFullYear();
    }
    if (filter === 'pending') {
      return trip.driverPaymentStatus === 'Pending';
    }
    return true;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getVehicleReg = (id: string) => vehicles.find(v => v.id === id)?.registrationNumber || 'Unknown';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trips</h1>
          <p className="text-sm text-gray-500">Manage all operational trips</p>
        </div>
        <Link 
          to="/trips/new" 
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Trip
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
            placeholder="Search customer, driver, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {(['all', 'today', 'month', 'pending'] as TripFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-md text-sm font-medium capitalize whitespace-nowrap ${
                filter === f 
                  ? 'bg-brand-100 text-brand-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Vehicle</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route & Customer</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Financials</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver Status</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTrips.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No trips found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredTrips.map((trip) => (
                  <tr key={trip.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{format(parseISO(trip.date), 'MMM dd, yyyy')}</div>
                      <div className="text-xs text-gray-500">{getVehicleReg(trip.vehicleId)}</div>
                      <div className="text-xs text-gray-400 mt-1">{trip.startTime} - {trip.endTime}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{trip.customerName}</div>
                      <div className="text-xs text-gray-500 truncate max-w-xs">{trip.pickupLocation} → {trip.dropLocation}</div>
                      {trip.distance > 0 && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 mt-1">{trip.distance} km</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">Income: ${trip.totalAmount}</div>
                      <div className="text-xs text-red-500">Exp: ${trip.totalExpense}</div>
                      <div className={`text-xs font-bold mt-1 ${trip.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        Net: ${trip.netProfit}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {trip.driverPaymentStatus === 'Paid' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            Pending: ${trip.driverBalance}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{trip.driverName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link to={`/trips/edit/${trip.id}`} className="text-brand-600 hover:text-brand-900">
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this trip?')) {
                              deleteTrip(trip.id);
                            }
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
