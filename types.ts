export interface Trip {
  id: string;
  // Basic Info
  date: string; // ISO date string YYYY-MM-DD
  startTime: string;
  endTime: string;
  vehicleId: string;
  driverName: string;
  driverContact: string;
  customerName: string;
  customerContact: string;
  pickupLocation: string;
  dropLocation: string;
  
  // Odometer
  odometerStart: number;
  odometerEnd: number;
  distance: number; // Auto-calculated
  
  // Financials
  totalAmount: number; // Income
  
  // Expenses
  expenseFuel: number;
  expenseFuelQuantity?: number;
  expenseToll: number;
  expenseParking: number;
  expenseOther: number;
  expenseOtherDesc?: string;
  
  // Driver Payment
  driverPaymentAmount: number; // Total agreed payment for driver
  driverAdvance: number;
  driverBalance: number; // Auto-calculated
  driverPaymentStatus: 'Paid' | 'Pending';
  driverPaymentMode: 'Cash' | 'UPI' | 'Bank Transfer';
  
  // Meta
  totalExpense: number; // Auto-calculated (Fuel + Toll + Parking + Other + DriverPayment)
  netProfit: number; // Auto-calculated (Income - TotalExpense)
  notes: string;
  createdAt: number;
}

export interface Vehicle {
  id: string;
  registrationNumber: string;
  model: string;
  
  // Maintenance Dates
  lastServiceDate?: string;
  nextServiceDue?: string;
  oilChangeDate?: string;
  tyreChangeDate?: string;
  brakeServiceDate?: string;
  batteryReplacementDate?: string;
  insuranceExpiry?: string;
  pollutionExpiry?: string;
}

export type TripFilter = 'all' | 'today' | 'month' | 'pending';
