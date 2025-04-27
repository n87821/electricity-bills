
import { useState, useEffect } from 'react';
import { Customer } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { toast } from 'sonner';

export const useCustomers = () => {
  const { saveToStorage, loadFromStorage } = useLocalStorage();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletedCustomerId, setDeletedCustomerId] = useState<string | null>(null);
  
  // Load data from Electron or fallback to localStorage
  useEffect(() => {
    const loadCustomers = async () => {
      setIsLoading(true);
      try {
        if (window.api) {
          // In Electron environment
          const electronCustomers = await window.api.getCustomers();
          setCustomers(electronCustomers);
        } else {
          // In browser environment (fallback)
          const storedCustomers = loadFromStorage<any[]>('customers', []);
          const customersWithDates = storedCustomers.map((c: any) => ({
            ...c,
            createdAt: new Date(c.createdAt)
          }));
          setCustomers(customersWithDates);
        }
      } catch (error) {
        console.error('Error loading customers:', error);
        toast.error('حدث خطأ أثناء تحميل بيانات العملاء');
        // Fallback to localStorage if Electron API fails
        const storedCustomers = loadFromStorage<any[]>('customers', []);
        const customersWithDates = storedCustomers.map((c: any) => ({
          ...c,
          createdAt: new Date(c.createdAt)
        }));
        setCustomers(customersWithDates);
      } finally {
        setIsLoading(false);
      }
    };

    loadCustomers();
  }, []);

  // Save data
  useEffect(() => {
    if (!isLoading && customers.length > 0) {
      if (!window.api) {
        // Save to localStorage only in browser environment
        saveToStorage('customers', customers);
      }
    }
  }, [customers, isLoading]);

  const addCustomer = async (customer: Omit<Customer, 'id' | 'createdAt'>) => {
    const newCustomer: Customer = {
      ...customer,
      id: Date.now().toString(),
      createdAt: new Date()
    };

    try {
      if (window.api) {
        await window.api.addCustomer(newCustomer);
      }
      setCustomers([...customers, newCustomer]);
    } catch (error) {
      console.error('Error adding customer:', error);
      toast.error('حدث خطأ أثناء إضافة العميل');
    }
  };

  const updateCustomer = async (updatedCustomer: Customer) => {
    try {
      if (window.api) {
        await window.api.updateCustomer(updatedCustomer);
      }
      setCustomers(customers.map(cust => 
        cust.id === updatedCustomer.id ? updatedCustomer : cust
      ));
    } catch (error) {
      console.error('Error updating customer:', error);
      toast.error('حدث خطأ أثناء تحديث بيانات العميل');
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      if (window.api) {
        await window.api.deleteCustomer(id);
      }
      setCustomers(customers.filter(customer => customer.id !== id));
      
      // Set the deleted customer ID so useBills can react to it
      setDeletedCustomerId(id);
      
      // Reset the deleted customer ID after a short delay
      setTimeout(() => {
        setDeletedCustomerId(null);
      }, 500);
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast.error('حدث خطأ أثناء حذف العميل');
    }
  };

  const getCustomerById = (id: string) => {
    return customers.find(customer => customer.id === id);
  };

  return {
    customers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerById,
    setCustomers,
    isLoading,
    deletedCustomerId
  };
};
