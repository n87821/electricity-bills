import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import { useAppContext } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Check, FilePlus, Printer, Loader2 } from 'lucide-react';
import { formatCurrency, formatDate, formatConsumption } from '../utils/formatting';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { printBillPDF } from '../utils/pdfGenerator';

const Bills = () => {
  const navigate = useNavigate();
  const { customers, bills, getCustomerById, markBillAsPaid, settings, isLoading } = useAppContext();
  const [filter, setFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState('');

  // Filter bills based on the selected filter
  const filteredBills = bills.filter(bill => {
    if (filter === 'paid') return bill.isPaid;
    if (filter === 'unpaid') return !bill.isPaid;
    return true;
  });

  // Sort bills (newest first)
  const sortedBills = [...filteredBills].sort((a, b) => b.date.getTime() - a.date.getTime());

  const handleMarkAsPaid = (billId: string) => {
    markBillAsPaid(billId);
    toast.success("تم تعيين الفاتورة كمدفوعة");
  };

  const handlePrintBill = (bill: typeof sortedBills[0]) => {
    const customer = getCustomerById(bill.customerId);
    if (!customer) return;
    
    printBillPDF(bill, customer, settings.kwRate, settings);
    toast.success("تم إنشاء ملف PDF للفاتورة");
  };

  const handleCreateBill = () => {
    if (!selectedCustomer) {
      toast.error("يرجى اختيار العميل");
      return;
    }
    navigate(`/bills/new/${selectedCustomer}`);
  };

  if (isLoading) {
    return (
      <MainLayout title="الفواتير">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="mr-2">جاري تحميل البيانات...</span>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="الفواتير">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span>عرض:</span>
          <Select value={filter} onValueChange={(value: 'all' | 'paid' | 'unpaid') => setFilter(value)}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="جميع الفواتير" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الفواتير</SelectItem>
              <SelectItem value="paid">المدفوعة</SelectItem>
              <SelectItem value="unpaid">غير المدفوعة</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setIsCustomerDialogOpen(true)}>
          <FilePlus className="ml-2" size={16} />
          فاتورة جديدة
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة الفواتير</CardTitle>
          <CardDescription>عرض وتعديل الفواتير</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>العميل</TableHead>
                <TableHead>القراءة السابقة</TableHead>
                <TableHead>القراءة الحالية</TableHead>
                <TableHead>الاستهلاك</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedBills.map((bill) => {
                const customer = getCustomerById(bill.customerId);
                return (
                  <TableRow key={bill.id}>
                    <TableCell>{customer?.name}</TableCell>
                    <TableCell>{bill.previousReading}</TableCell>
                    <TableCell>{bill.currentReading}</TableCell>
                    <TableCell>{formatConsumption(bill.consumption)}</TableCell>
                    <TableCell>{formatCurrency(bill.amount)}</TableCell>
                    <TableCell>{formatDate(bill.date)}</TableCell>
                    <TableCell>
                      {bill.isPaid ? (
                        <span className="text-green-600">مدفوع</span>
                      ) : (
                        <span className="text-red-600">غير مدفوع</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePrintBill(bill)}
                        >
                          <Printer className="ml-2" size={16} />
                          طباعة
                        </Button>
                        {!bill.isPaid && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkAsPaid(bill.id)}
                          >
                            <Check className="ml-2" size={16} />
                            تم الدفع
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {sortedBills.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">لا توجد فواتير مطابقة للبحث</p>
              <Button onClick={() => setIsCustomerDialogOpen(true)}>
                <FilePlus className="ml-2" size={16} />
                إضافة فاتورة جديدة
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customer Selection Dialog */}
      <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>اختيار العميل</DialogTitle>
            <DialogDescription>
              اختر العميل لإضافة فاتورة جديدة
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select 
              value={selectedCustomer} 
              onValueChange={setSelectedCustomer}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر العميل" />
              </SelectTrigger>
              <SelectContent>
                {customers.map(customer => (
                  <SelectItem 
                    key={customer.id} 
                    value={customer.id}
                  >
                    {customer.name} - {customer.meterNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCustomerDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleCreateBill}>
              إنشاء الفاتورة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Bills;
