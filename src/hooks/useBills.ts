import { useState, useEffect } from 'react';
import { Bill, Settings } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { toast } from 'sonner';

export const useBills = (
  settings: Settings, 
  deletedCustomerId?: string | null
) => {
  const { saveToStorage, loadFromStorage } = useLocalStorage();
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load data from Electron or fallback to localStorage
  useEffect(() => {
    const loadBills = async () => {
      setIsLoading(true);
      try {
        if (window.api) {
          // In Electron environment
          const electronBills = await window.api.getBills();
          setBills(electronBills);
        } else {
          // In browser environment (fallback)
          const storedBills = loadFromStorage<any[]>('bills', []);
          const billsWithDates = storedBills
            .map((b: any) => ({
              ...b,
              date: new Date(b.date)
            }))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setBills(billsWithDates);
        }
      } catch (error) {
        console.error('Error loading bills:', error);
        toast.error('حدث خطأ أثناء تحميل الفواتير');
        const storedBills = loadFromStorage<any[]>('bills', []);
        const billsWithDates = storedBills
          .map((b: any) => ({
            ...b,
            date: new Date(b.date)
          }))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setBills(billsWithDates);
      } finally {
        setIsLoading(false);
      }
    };

    loadBills();
  }, []);

  // Save data
  useEffect(() => {
    if (!isLoading && bills.length > 0 && !window.api) {
      // Save to localStorage only in browser environment
      saveToStorage('bills', bills);
    }
  }, [bills, isLoading]);

  const addBill = async (billData: Omit<Bill, 'id' | 'consumption' | 'amount' | 'isPaid'> & { date?: Date }) => {
    const consumption = billData.currentReading - billData.previousReading;
    const amount = consumption * settings.kwRate;
    const newBill: Bill = {
      ...billData,
      id: Date.now().toString(),
      consumption,
      amount,
      date: billData.date || new Date(),
      isPaid: false
    };

    try {
      if (window.api) {
        await window.api.addBill(newBill);
      }
      setBills(prevBills => {
        const updatedBills = [...prevBills, newBill];
        // Sort by date in descending order
        updatedBills.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        console.log('Updated bills after adding:', updatedBills); // Debug log
        return updatedBills;
      });
    } catch (error) {
      console.error('Error adding bill:', error);
      toast.error('حدث خطأ أثناء إضافة الفاتورة');
    }
  };

  const markBillAsPaid = async (id: string) => {
    try {
      if (window.api) {
        await window.api.markBillPaid(id);
      }
      setBills(bills.map(bill => 
        bill.id === id ? { ...bill, isPaid: true } : bill
      ));
    } catch (error) {
      console.error('Error marking bill as paid:', error);
      toast.error('حدث خطأ أثناء تحديث حالة الفاتورة');
    }
  };

  const getCustomerBills = (customerId: string) => {
    return bills.filter(bill => bill.customerId === customerId);
  };

  const getUnpaidBills = () => {
    return bills.filter(bill => !bill.isPaid);
  };

  const deleteBill = async (billId: string) => {
    try {
      if (window.api) {
        await window.api.deleteBill(billId);
      }
      setBills(prevBills => prevBills.filter(bill => bill.id !== billId));
      toast.success("تم حذف الفاتورة بنجاح");
    } catch (error) {
      console.error('Error deleting bill:', error);
      toast.error('حدث خطأ أثناء حذف الفاتورة');
    }
  };

  // Remove bills for deleted customer if deletedCustomerId is provided
  useEffect(() => {
    if (deletedCustomerId) {
      const updatedBills = bills.filter(bill => bill.customerId !== deletedCustomerId);
      
      // Update local state
      setBills(updatedBills);
      
      // Update in Electron or localStorage
      const updateStorage = async () => {
        try {
          if (window.api) {
            // In Electron environment, delete bills in the database
            for (const bill of bills) {
              if (bill.customerId === deletedCustomerId) {
                await window.api.deleteBill(bill.id);
              }
            }
          } else if (!isLoading) {
            // In browser environment, update localStorage
            saveToStorage('bills', updatedBills);
          }
        } catch (error) {
          console.error('Error removing customer bills:', error);
        }
      };
      
      updateStorage();
    }
  }, [deletedCustomerId]);

  return {
    bills,
    setBills,
    addBill,
    markBillAsPaid,
    getCustomerBills,
    getUnpaidBills,
    deleteBill,
    isLoading
  };
};
