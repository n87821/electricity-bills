import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import { useAppContext } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Check, FilePlus, Printer, Trash2 } from 'lucide-react';
import { formatCurrency, formatDate, formatConsumption } from '../utils/formatting';
import { toast } from 'sonner';
import { printBillPDF } from '../utils/pdfGenerator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bill } from '../types';

interface CustomerDetailParams {
  id: string;
}

const CustomerDetail = () => {
  const { id } = useParams<keyof CustomerDetailParams>() as CustomerDetailParams;
  const navigate = useNavigate();
  const { getCustomerById, getCustomerBills, markBillAsPaid, deleteBill, settings, bills, setBills } = useAppContext();
  
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [newReading, setNewReading] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [billToDelete, setBillToDelete] = useState<Bill | null>(null);
  
  if (!id) {
    navigate('/customers');
    return null;
  }
  
  const customer = getCustomerById(id);
  const customerBills = customer ? getCustomerBills(id) : [];
  
  // Sort bills by date (newest first)
  const sortedBills = [...customerBills].sort((a, b) => b.date.getTime() - a.date.getTime());
  
  // Stats
  const totalBills = sortedBills.length;
  const unpaidBills = sortedBills.filter(bill => !bill.isPaid).length;
  const totalConsumption = sortedBills.reduce((total, bill) => total + bill.consumption, 0);
  const totalAmount = sortedBills.reduce((total, bill) => total + bill.amount, 0);
  
  if (!customer) {
    return (
      <MainLayout title="العميل غير موجود">
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">لم يتم العثور على العميل المطلوب</p>
          <Button onClick={() => navigate('/customers')}>
            <ArrowLeft className="ml-2" size={16} />
            العودة إلى قائمة العملاء
          </Button>
        </div>
      </MainLayout>
    );
  }

  const handleMarkAsPaid = (billId: string) => {
    markBillAsPaid(billId);
    toast.success("تم تعيين الفاتورة كمدفوعة");
  };
  
  const handlePrintBill = (bill: Bill) => {
    printBillPDF(bill, customer, settings.kwRate, settings);
    toast.success("تم إنشاء ملف PDF للفاتورة");
  };
  
  const handleEditBill = (bill: Bill) => {
    setEditingBill(bill);
    setNewReading(bill.currentReading.toString());
    setDialogOpen(true);
  };

  const handleDeleteBill = (bill: Bill) => {
    setBillToDelete(bill);
    setDeleteDialogOpen(true);
  };
  
  const handleUpdateBill = () => {
    if (!editingBill) return;
    
    const newReadingValue = parseInt(newReading);
    if (newReadingValue <= editingBill.previousReading) {
      toast.error("القراءة الحالية يجب أن تكون أكبر من القراءة السابقة");
      return;
    }
    
    const consumption = newReadingValue - editingBill.previousReading;
    const amount = consumption * editingBill.rate;
    
    const updatedBills = bills.map(bill => {
      if (bill.id === editingBill.id) {
        return {
          ...bill,
          currentReading: newReadingValue,
          consumption,
          amount
        };
      }
      return bill;
    });
    
    // Update context
    setBills(updatedBills);
    
    // Reset state
    setEditingBill(null);
    setDialogOpen(false);
    toast.success("تم تحديث الفاتورة بنجاح");
  };

  const confirmDeleteBill = async () => {
    if (billToDelete) {
      try {
        await deleteBill(billToDelete.id);
        toast.success("تم حذف الفاتورة بنجاح");
        setDeleteDialogOpen(false);
        setBillToDelete(null);
      } catch (error) {
        console.error('Error deleting bill:', error);
        toast.error('حدث خطأ أثناء حذف الفاتورة');
      }
    }
  };

  return (
    <MainLayout title={`بيانات العميل - ${customer.name}`}>
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" onClick={() => navigate('/customers')}>
          <ArrowLeft className="ml-2" size={16} />
          العودة إلى العملاء
        </Button>
        <Button onClick={() => navigate(`/bills/new/${customer.id}`)}>
          <FilePlus className="ml-2" size={16} />
          إضافة فاتورة جديدة
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">العنوان</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">{customer.address}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">رقم العداد</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">{customer.meterNumber}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">تاريخ التسجيل</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">{formatDate(customer.createdAt)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">عدد الفواتير</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">{totalBills} فاتورة</p>
            <p className="text-xs text-muted-foreground">
              {unpaidBills} غير مدفوعة
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 mb-8 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>إجمالي الاستهلاك</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatConsumption(totalConsumption)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>إجمالي المبالغ</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(totalAmount)}</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>سجل الفواتير</CardTitle>
          <CardDescription>عرض وتعديل فواتير العميل</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
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
              {sortedBills.map((bill, index) => (
                <TableRow key={bill.id}>
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
                      {index === 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteBill(bill)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="ml-2" size={16} />
                          حذف
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {sortedBills.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">لا توجد فواتير مسجلة لهذا العميل</p>
              <Button onClick={() => navigate(`/bills/new/${customer.id}`)}>
                <FilePlus className="ml-2" size={16} />
                إضافة فاتورة جديدة
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل قراءة الفاتورة</DialogTitle>
            <DialogDescription>
              يمكنك تعديل القراءة الحالية للفاتورة. سيتم إعادة حساب الاستهلاك والمبلغ تلقائياً.
            </DialogDescription>
          </DialogHeader>
          
          {editingBill && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="previousReading">القراءة السابقة</Label>
                  <Input id="previousReading" value={editingBill.previousReading} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentReading">القراءة الحالية</Label>
                  <Input 
                    id="currentReading" 
                    type="number" 
                    min={editingBill.previousReading + 1}
                    value={newReading} 
                    onChange={(e) => setNewReading(e.target.value)} 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>الاستهلاك الجديد</Label>
                <Input 
                  value={formatConsumption(Math.max(0, parseInt(newReading) - editingBill.previousReading || 0))} 
                  disabled 
                />
              </div>
              
              <div className="space-y-2">
                <Label>المبلغ الجديد</Label>
                <Input 
                  value={formatCurrency(Math.max(0, parseInt(newReading) - editingBill.previousReading || 0) * editingBill.rate)} 
                  disabled 
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleUpdateBill}>تحديث الفاتورة</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف هذه الفاتورة؟ لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              إلغاء
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteBill}
            >
              <Trash2 className="ml-2" size={16} />
              حذف الفاتورة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default CustomerDetail;
