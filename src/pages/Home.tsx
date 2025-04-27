import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import { useAppContext } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Check, FilePlus, FileText } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatting';
import { NewInvoiceDialog } from '../components/Dialogs/NewInvoiceDialog';
import { toast } from 'sonner';

const Home = () => {
  const { customers, bills, getUnpaidBills, getCustomerById, addBill, markBillAsPaid } = useAppContext();
  const unpaidBills = getUnpaidBills();

  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [currentReading, setCurrentReading] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Calculate previous reading and last bill date when customer is selected
  const { previousReading, lastBillDate } = selectedCustomer ? 
    (() => {
      const customerBills = bills
        .filter(bill => bill.customerId === selectedCustomer)
        .sort((a, b) => b.date.getTime() - a.date.getTime());
      
      const lastBill = customerBills[0];
      console.log('Customer bills:', customerBills); // Debug log
      console.log('Last bill:', lastBill); // Debug log
      
      return {
        previousReading: lastBill?.currentReading || 0,
        lastBillDate: lastBill?.date || null
      };
    })() : { previousReading: 0, lastBillDate: null };

  const handleAddBill = () => {
    if (!selectedCustomer || !currentReading) {
      toast.error("يرجى ملء جميع الحقول");
      return;
    }

    const customer = getCustomerById(selectedCustomer);
    if (!customer) return;

    const newCurrentReading = parseInt(currentReading);
    
    if (newCurrentReading <= previousReading) {
      toast.error("القراءة الحالية يجب أن تكون أكبر من القراءة السابقة");
      return;
    }

    if (lastBillDate && selectedDate < lastBillDate) {
      toast.error("لا يمكن إضافة فاتورة بتاريخ أقدم من آخر فاتورة");
      return;
    }

    addBill({
      customerId: selectedCustomer,
      previousReading,
      currentReading: newCurrentReading,
      rate: 0.6, // Default rate
      date: selectedDate
    });

    setSelectedCustomer('');
    setCurrentReading('');
    setIsDialogOpen(false);
    toast.success("تمت إضافة الفاتورة بنجاح");
  };

  const handleMarkAsPaid = (billId: string) => {
    markBillAsPaid(billId);
    toast.success("تم تعيين الفاتورة كمدفوعة");
  };

  return (
    <MainLayout title="الصفحة الرئيسية">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>العملاء</span>
              <Button asChild variant="outline" size="sm">
                <Link to="/customers">عرض الكل</Link>
              </Button>
            </CardTitle>
            <CardDescription>قائمة بجميع العملاء المسجلين</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>رقم العداد</TableHead>
                  <TableHead>خيارات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.slice(0, 5).map(customer => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.meterNumber}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <NewInvoiceDialog 
                          isOpen={isDialogOpen}
                          onOpenChange={setIsDialogOpen}
                          customers={customers}
                          selectedCustomer={selectedCustomer}
                          onSelectCustomer={setSelectedCustomer}
                          currentReading={currentReading}
                          onChangeReading={setCurrentReading}
                          onAddBill={handleAddBill}
                          selectedDate={selectedDate}
                          onChangeDate={setSelectedDate}
                          previousReading={previousReading}
                          lastBillDate={lastBillDate}
                          triggerButton={
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setSelectedCustomer(customer.id)}
                            >
                              <FilePlus className="ml-2" size={16} />
                              فاتورة جديدة
                            </Button>
                          }
                        />
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          asChild
                        >
                          <Link to={`/customers/${customer.id}`}>
                            <FileText className="ml-2" size={16} />
                            السجل
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {customers.length === 0 && (
              <div className="text-center py-4">
                <p className="text-muted-foreground">لا يوجد عملاء بعد</p>
                <Button className="mt-2" asChild>
                  <Link to="/customers">إضافة عميل جديد</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>الفواتير غير المدفوعة</span>
              <Button asChild variant="outline" size="sm">
                <Link to="/bills">عرض الكل</Link>
              </Button>
            </CardTitle>
            <CardDescription>الفواتير التي لم يتم دفعها بعد</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>العميل</TableHead>
                  <TableHead>المبلغ</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>خيارات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unpaidBills.slice(0, 5).map(bill => {
                  const customer = getCustomerById(bill.customerId);
                  return (
                    <TableRow key={bill.id}>
                      <TableCell className="font-medium">{customer?.name}</TableCell>
                      <TableCell>{formatCurrency(bill.amount)}</TableCell>
                      <TableCell>{formatDate(bill.date)}</TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleMarkAsPaid(bill.id)}
                        >
                          <Check className="ml-2" size={16} />
                          تم الدفع
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {unpaidBills.length === 0 && (
              <div className="text-center py-4">
                <p className="text-muted-foreground">لا توجد فواتير غير مدفوعة</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Home;
