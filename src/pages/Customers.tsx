import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import { useAppContext } from '../context/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Plus, Trash2, FilePlus, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { formatDate } from '../utils/formatting';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const Customers = () => {
  const { customers, addCustomer, deleteCustomer, isLoading } = useAppContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [meterNumber, setMeterNumber] = useState('');

  const resetForm = () => {
    setName('');
    setAddress('');
    setMeterNumber('');
  };

  const handleAddCustomer = () => {
    if (!name || !address || !meterNumber) {
      toast.error("يرجى ملء جميع الحقول");
      return;
    }

    // Check if meter number already exists
    if (customers.some(c => c.meterNumber === meterNumber)) {
      toast.error("رقم العداد موجود بالفعل");
      return;
    }

    addCustomer({
      name,
      address,
      meterNumber
    });

    resetForm();
    setIsDialogOpen(false);
    toast.success("تمت إضافة العميل بنجاح");
  };

  const handleDeleteCustomer = (id: string, customerName: string) => {
    deleteCustomer(id);
    toast.success(`تم حذف ${customerName} بنجاح`);
  };

  if (isLoading) {
    return (
      <MainLayout title="العملاء">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="mr-2">جاري تحميل البيانات...</span>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="العملاء">
      <div className="flex justify-end mb-6">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="ml-2" size={16} />
              عميل جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>إضافة عميل جديد</DialogTitle>
              <DialogDescription>
                أدخل بيانات العميل لإضافته إلى النظام
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  الاسم الكامل
                </Label>
                <Input
                  id="name"
                  className="col-span-3"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address" className="text-right">
                  العنوان
                </Label>
                <Input
                  id="address"
                  className="col-span-3"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="meterNumber" className="text-right">
                  رقم العداد
                </Label>
                <Input
                  id="meterNumber"
                  className="col-span-3"
                  value={meterNumber}
                  onChange={(e) => setMeterNumber(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleAddCustomer}>
                إضافة
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>العنوان</TableHead>
                <TableHead>رقم العداد</TableHead>
                <TableHead>تاريخ التسجيل</TableHead>
                <TableHead>خيارات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map(customer => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.address}</TableCell>
                  <TableCell>{customer.meterNumber}</TableCell>
                  <TableCell>{formatDate(customer.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
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
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        asChild
                      >
                        <Link to={`/bills/new/${customer.id}`}>
                          <FilePlus className="ml-2" size={16} />
                          فاتورة جديدة
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 size={16} />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                            <AlertDialogDescription>
                              سيتم حذف العميل "{customer.name}" وجميع فواتيره المرتبطة به. هذا الإجراء لا يمكن التراجع عنه.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteCustomer(customer.id, customer.name)}>
                              تأكيد الحذف
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {customers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">لا يوجد عملاء بعد</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="ml-2" size={16} />
                إضافة عميل جديد
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </MainLayout>
  );
};

export default Customers;
