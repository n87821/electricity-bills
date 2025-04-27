import React, { createContext, useContext, ReactNode } from 'react';
import { AppContextType, Customer, Bill } from '../types';
import { useCustomers } from '../hooks/useCustomers';
import { useBills } from '../hooks/useBills';
import { useSettings } from '../hooks/useSettings';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { settings, updateSettings, isLoading: settingsLoading } = useSettings();
  const { 
    customers, 
    addCustomer, 
    updateCustomer, 
    deleteCustomer, 
    getCustomerById, 
    isLoading: customersLoading,
    deletedCustomerId 
  } = useCustomers();
  
  const { 
    bills, 
    setBills, 
    addBill, 
    markBillAsPaid, 
    deleteBill,
    getCustomerBills, 
    getUnpaidBills, 
    isLoading: billsLoading 
  } = useBills(settings, deletedCustomerId);
  
  const isLoading = settingsLoading || customersLoading || billsLoading;

  const value: AppContextType = {
    customers,
    bills,
    settings,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addBill,
    markBillAsPaid,
    deleteBill,
    updateSettings,
    getCustomerById,
    getCustomerBills,
    getUnpaidBills,
    setBills,
    isLoading
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
