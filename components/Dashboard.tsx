import React from 'react';
import { useApp } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DollarSign, Activity, TrendingUp, AlertCircle, Calendar } from 'lucide-react';
import { format, isSameMonth, isSameDay, parseISO } from 'date-fns';

export const Dashboard: React.FC = () => {
  const { trips, vehicles } = useApp();

  const now = new Date();
  
  // Calculate Metrics
  const tripsToday = trips.filter(t => isSameDay(parseISO(t.date), now));
  const tripsMonth = trips.filter(t => isSameMonth(parseISO(t.date), now));
  
  const monthlyIncome = tripsMonth.reduce((sum, t) => sum + t.totalAmount, 0);
  const monthlyExpense = tripsMonth.reduce((sum, t) => sum + t.totalExpense, 0);
  const monthlyProfit = monthlyIncome - monthlyExpense;
  
  const pendingPayments = trips.filter(t => t.driverPaymentStatus === 'Pending').reduce((sum, t) => sum + t.driverBalance, 0);
  const pendingPaymentsCount = trips.filter(t => t.driverPaymentStatus === 'Pending').length;

  // Best Performing Vehicle (All time Profit)
  const vehicleStats = vehicles.map(v => {
    const vTrips = trips.filter(t => t.vehicleId === v.id);
    const profit = vTrips.reduce((sum, t) => sum + t.netProfit, 0);
    return { ...v, profit };
  }).sort((a, b) => b.profit - a.profit);

  const bestVehicle = vehicleStats.length > 0 ? vehicleStats[0] : null;

  // Chart Data (Last 7 Days) - Simplified for demo to Daily Activity of current month or last few trips
  // Let's do a simple monthly grouping for chart
  const dailyData = tripsMonth.reduce((acc, trip) => {
    const day = format(parseISO(trip.date), 'dd MMM');
    if (!acc[day]) acc[day] = { name: day, income: 0, expense: 0, profit: 0 };
    acc[day].income += trip.totalAmount;
    acc[day].expense += trip.totalExpense;
    acc[day].profit += trip.netProfit;
    return acc;
  }, {} as Record<string, any>);

  const chartData = Object.values(dailyData).sort((a: any, b: any) => 
     new Date(a.name).getTime() - new Date(b.name).getTime()
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1 md:mt-0">{format(now, 'EEEE, MMMM do, yyyy')}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Today's Trips" 
          value={tripsToday.length.toString()} 
          icon={Activity} 
          color="blue"
          subtext={`${tripsMonth.length} this month`}
        />
        <StatCard 
          title="Monthly Net Profit" 
          value={`$${monthlyProfit.toLocaleString()}`} 
          icon={TrendingUp} 
          color="green"
          subtext={`Income: $${monthlyIncome.toLocaleString()}`}
        />
        <StatCard 
          title="Pending Payments" 
          value={`$${pendingPayments.toLocaleString()}`} 
          icon={AlertCircle} 
          color="amber"
          subtext={`${pendingPaymentsCount} drivers pending`}
        />
        <StatCard 
          title="Best Vehicle" 
          value={bestVehicle ? bestVehicle.registrationNumber : 'N/A'} 
          icon={CarIcon} 
          color="indigo"
          subtext={bestVehicle ? `$${bestVehicle.profit.toLocaleString()} profit` : 'No data'}
        />
      </div>

      {/* Charts & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Overview (This Month)</h3>
          <div className="h-80 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                  />
                  <Legend />
                  <Bar dataKey="income" fill="#3b82f6" name="Income" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" fill="#ef4444" name="Expense" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                No data for this month
              </div>
            )}
          </div>
        </div>

        {/* Recent Trips / Quick Actions */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Activity</h3>
          <div className="space-y-4">
            {tripsToday.length === 0 ? (
              <p className="text-gray-500 text-sm">No trips recorded today.</p>
            ) : (
              tripsToday.map(trip => (
                <div key={trip.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{trip.customerName}</p>
                    <p className="text-xs text-gray-500">{trip.pickupLocation} → {trip.dropLocation}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-600">+${trip.netProfit}</p>
                    <p className="text-xs text-gray-400">{trip.startTime}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-components for cleanliness
const StatCard: React.FC<{ title: string; value: string; icon: any; color: string; subtext?: string }> = ({ title, value, icon: Icon, color, subtext }) => {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    indigo: 'bg-indigo-50 text-indigo-600',
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color] || 'bg-gray-50 text-gray-600'}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {subtext && <p className="text-xs text-gray-400 mt-3">{subtext}</p>}
    </div>
  );
};

const CarIcon = (props: any) => <Calendar {...props} />; // Placeholder
