export interface Customer {
  id: string;
  name: string;
  address: string;
  meterNumber: string;
  createdAt: Date;
}

export interface Bill {
  id: string;
  customerId: string;
  previousReading: number;
  currentReading: number;
  consumption: number;
  rate: number;
  amount: number;
  date: Date;
  isPaid: boolean;
}

export interface Settings {
  kwRate: number;
  companyName: string;
  systemName: string;
  logo?: string;  // Base64 encoded logo
}

export interface AppContextType {
  customers: Customer[];
  bills: Bill[];
  settings: Settings;
  isLoading?: boolean;
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => void;
  updateCustomer: (customer: Customer) => void;
  deleteCustomer: (id: string) => void;
  addBill: (bill: Omit<Bill, 'id' | 'consumption' | 'amount' | 'isPaid'>) => void;
  markBillAsPaid: (id: string) => void;
  deleteBill: (id: string) => void;
  updateSettings: (settings: Settings) => void;
  getCustomerById: (id: string) => Customer | undefined;
  getCustomerBills: (customerId: string) => Bill[];
  getUnpaidBills: () => Bill[];
  setBills: React.Dispatch<React.SetStateAction<Bill[]>>;
}
