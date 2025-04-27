
interface Window {
  api: {
    // Customer operations
    getCustomers: () => Promise<any[]>;
    addCustomer: (customer: any) => Promise<boolean>;
    updateCustomer: (customer: any) => Promise<boolean>;
    deleteCustomer: (id: string) => Promise<boolean>;
    
    // Bill operations
    getBills: () => Promise<any[]>;
    addBill: (bill: any) => Promise<boolean>;
    markBillPaid: (id: string) => Promise<boolean>;
    deleteBill: (id: string) => Promise<boolean>;
    
    // Settings operations
    getSettings: () => Promise<any>;
    updateSettings: (settings: any) => Promise<boolean>;
  };
}
