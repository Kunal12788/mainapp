import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate, useParams } from 'react-router-dom';
import { Trip } from '../types';
import { Save, X, Calculator } from 'lucide-react';

export const TripForm: React.FC = () => {
  const { addTrip, updateTrip, trips, vehicles } = useApp();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Initial State
  const emptyTrip: Omit<Trip, 'id' | 'createdAt'> = {
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '18:00',
    vehicleId: '',
    driverName: '',
    driverContact: '',
    customerName: '',
    customerContact: '',
    pickupLocation: '',
    dropLocation: '',
    odometerStart: 0,
    odometerEnd: 0,
    distance: 0,
    totalAmount: 0,
    expenseFuel: 0,
    expenseFuelQuantity: 0,
    expenseToll: 0,
    expenseParking: 0,
    expenseOther: 0,
    expenseOtherDesc: '',
    driverPaymentAmount: 0,
    driverAdvance: 0,
    driverBalance: 0,
    driverPaymentStatus: 'Pending',
    driverPaymentMode: 'Cash',
    totalExpense: 0,
    netProfit: 0,
    notes: '',
  };

  const [formData, setFormData] = useState<Omit<Trip, 'id' | 'createdAt'>>(emptyTrip);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (id) {
      const existingTrip = trips.find(t => t.id === id);
      if (existingTrip) {
        // Exclude id and createdAt from state spreading to match type
        const { id: _, createdAt: __, ...rest } = existingTrip;
        setFormData(rest);
        setIsEditMode(true);
      }
    }
  }, [id, trips]);

  // Calculations
  useEffect(() => {
    const dist = formData.odometerEnd - formData.odometerStart;
    const balance = formData.driverPaymentAmount - formData.driverAdvance;
    
    const status = balance <= 0 && formData.driverPaymentAmount > 0 ? 'Paid' : 'Pending';
    
    const totalExp = 
      Number(formData.expenseFuel) + 
      Number(formData.expenseToll) + 
      Number(formData.expenseParking) + 
      Number(formData.expenseOther) + 
      Number(formData.driverPaymentAmount);

    const profit = Number(formData.totalAmount) - totalExp;

    setFormData(prev => ({
      ...prev,
      distance: dist > 0 ? dist : 0,
      driverBalance: balance,
      driverPaymentStatus: status,
      totalExpense: totalExp,
      netProfit: profit
    }));
  }, [
    formData.odometerEnd, 
    formData.odometerStart, 
    formData.driverPaymentAmount, 
    formData.driverAdvance,
    formData.expenseFuel,
    formData.expenseToll,
    formData.expenseParking,
    formData.expenseOther,
    formData.totalAmount
  ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tripToSave: Trip = {
      ...formData,
      id: isEditMode && id ? id : crypto.randomUUID(),
      createdAt: isEditMode ? (trips.find(t => t.id === id)?.createdAt || Date.now()) : Date.now()
    };

    if (isEditMode) {
      updateTrip(tripToSave);
    } else {
      addTrip(tripToSave);
    }
    navigate('/trips');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{isEditMode ? 'Edit Trip' : 'New Trip'}</h1>
        <button onClick={() => navigate('/trips')} className="text-gray-500 hover:text-gray-700">
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 pb-20">
        
        {/* Section 1: Basic Details */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">Trip Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input required type="date" name="date" value={formData.date} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 border p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Vehicle</label>
              <select required name="vehicleId" value={formData.vehicleId} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 border p-2">
                <option value="">Select Vehicle</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.registrationNumber} - {v.model}</option>
                ))}
              </select>
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700">Driver Name</label>
              <input required type="text" name="driverName" value={formData.driverName} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 border p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Time</label>
              <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 border p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Time</label>
              <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 border p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Customer Name</label>
              <input required type="text" name="customerName" value={formData.customerName} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 border p-2" />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700">Pickup Location</label>
              <input required type="text" name="pickupLocation" value={formData.pickupLocation} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 border p-2" />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700">Drop Location</label>
              <input required type="text" name="dropLocation" value={formData.dropLocation} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 border p-2" />
            </div>
          </div>
        </section>

        {/* Section 2: Odometer */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
           <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">Odometer & Usage</h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Reading</label>
              <input type="number" name="odometerStart" value={formData.odometerStart} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 border p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Reading</label>
              <input type="number" name="odometerEnd" value={formData.odometerEnd} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 border p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Total Distance (km)</label>
              <div className="mt-1 block w-full rounded-md bg-gray-50 border border-gray-200 p-2 text-gray-700 font-medium">
                {formData.distance} km
              </div>
            </div>
           </div>
        </section>

        {/* Section 3: Financials */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
           <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">Financials & Expenses</h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-900">Total Trip Income Amount</label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input type="number" name="totalAmount" value={formData.totalAmount} onChange={handleChange} className="block w-full rounded-md border-gray-300 pl-7 focus:border-brand-500 focus:ring-brand-500 border p-2 text-lg font-semibold" placeholder="0.00" />
              </div>
            </div>
            
            {/* Expenses Row */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Fuel Cost</label>
              <input type="number" name="expenseFuel" value={formData.expenseFuel} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 border p-2" />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700">Toll Charges</label>
              <input type="number" name="expenseToll" value={formData.expenseToll} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 border p-2" />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700">Parking Charges</label>
              <input type="number" name="expenseParking" value={formData.expenseParking} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 border p-2" />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700">Other Expenses</label>
              <input type="number" name="expenseOther" value={formData.expenseOther} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 border p-2" />
            </div>
           </div>
        </section>

        {/* Section 4: Driver Payment */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
           <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">Driver Payment</h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div>
              <label className="block text-sm font-medium text-gray-700">Agreed Amount</label>
              <input type="number" name="driverPaymentAmount" value={formData.driverPaymentAmount} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 border p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Advance Paid</label>
              <input type="number" name="driverAdvance" value={formData.driverAdvance} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 border p-2" />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700">Balance Payable</label>
              <div className={`mt-1 block w-full rounded-md border border-gray-200 p-2 font-medium ${formData.driverBalance > 0 ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'}`}>
                ${formData.driverBalance}
              </div>
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700">Payment Status</label>
              <div className="mt-2">
                 {formData.driverPaymentStatus === 'Paid' ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Paid</span>
                 ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">Pending</span>
                 )}
              </div>
            </div>
           </div>
        </section>

        {/* Section 5: Notes */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
           <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">Notes</h2>
           <textarea rows={3} name="notes" value={formData.notes} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 border p-2" placeholder="Any special remarks..." />
        </section>

        {/* Sticky Footer for Calculations and Save */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg lg:pl-64 z-10">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-6 text-sm">
               <div>
                  <span className="text-gray-500 block">Total Expense</span>
                  <span className="font-semibold text-red-600 text-lg">${formData.totalExpense}</span>
               </div>
                <div>
                  <span className="text-gray-500 block">Net Profit</span>
                  <span className={`font-bold text-xl ${formData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>${formData.netProfit}</span>
               </div>
            </div>
            <button type="submit" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500">
              <Save className="w-5 h-5 mr-2" />
              Save Trip
            </button>
          </div>
        </div>

      </form>
    </div>
  );
};
