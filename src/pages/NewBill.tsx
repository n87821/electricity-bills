import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import { useAppContext } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { formatCurrency } from '../utils/formatting';
import { toast } from 'sonner';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface NewBillParams {
  customerId: string;
}

const NewBill = () => {
  const { customerId } = useParams<keyof NewBillParams>() as NewBillParams;
  const navigate = useNavigate();
  const { getCustomerById, addBill, bills, settings } = useAppContext();
  
  const [currentReading, setCurrentReading] = useState('');
  const [previousReading, setPreviousReading] = useState(0);
  const [lastBillDate, setLastBillDate] = useState<Date | null>(null);
  const [consumption, setConsumption] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [date, setDate] = useState<Date>(new Date());
  
  // Validate customer id
  const customer = customerId ? getCustomerById(customerId) : undefined;
  
  useEffect(() => {
    if (customer) {
      // Get the latest bill for this customer to get the previous reading
      const customerBills = bills
        .filter(bill => bill.customerId === customerId)
        .sort((a, b) => b.date.getTime() - a.date.getTime());
      
      const lastBill = customerBills[0];
      setPreviousReading(lastBill?.currentReading || 0);
      setLastBillDate(lastBill?.date || null);
    }
  }, [customer, bills, customerId]);
  
  // Calculate consumption and amount when current reading changes
  useEffect(() => {
    const currentReadingValue = parseInt(currentReading) || 0;
    const calculatedConsumption = Math.max(0, currentReadingValue - previousReading);
    setConsumption(calculatedConsumption);
    setTotalAmount(calculatedConsumption * settings.kwRate);
  }, [currentReading, previousReading, settings.kwRate]);
  
  const handleSubmit = () => {
    if (!customer) {
      toast.error("لم يتم العثور على العميل");
      return;
    }
    
    if (!currentReading) {
      toast.error("يرجى إدخال القراءة الحالية");
      return;
    }
    
    const currentReadingValue = parseInt(currentReading);
    if (currentReadingValue <= previousReading) {
      toast.error("القراءة الحالية يجب أن تكون أكبر من القراءة السابقة");
      return;
    }

    if (lastBillDate && date < lastBillDate) {
      toast.error("لا يمكن إضافة فاتورة بتاريخ أقدم من آخر فاتورة");
      return;
    }
    
    addBill({
      customerId: customer.id,
      previousReading,
      currentReading: currentReadingValue,
      rate: settings.kwRate,
      date: date,
    });
    
    toast.success("تمت إضافة الفاتورة بنجاح");
    navigate(`/customers/${customerId}`);
  };
  
  if (!customer) {
    return (
      <MainLayout title="خطأ">
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

  return (
    <MainLayout title="إضافة فاتورة جديدة">
      <Button 
        variant="outline" 
        className="mb-6"
        onClick={() => navigate(`/customers/${customerId}`)}
      >
        <ArrowLeft className="ml-2" size={16} />
        العودة إلى بيانات العميل
      </Button>
      
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>إضافة فاتورة جديدة</CardTitle>
          <CardDescription>إدخال قراءة عداد جديدة للعميل: {customer.name}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="meterNumber">رقم العداد</Label>
              <Input id="meterNumber" value={customer.meterNumber} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kwRate">سعر الكيلو واط</Label>
              <Input id="kwRate" value={`${settings.kwRate} شيكل`} disabled />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="previousReading">القراءة السابقة</Label>
              <Input id="previousReading" value={previousReading} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentReading">القراءة الحالية</Label>
              <Input 
                id="currentReading" 
                type="number"
                min={previousReading + 1}
                value={currentReading}
                onChange={(e) => setCurrentReading(e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="consumption">الاستهلاك (كيلو واط)</Label>
              <Input id="consumption" value={consumption} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalAmount">المبلغ الإجمالي</Label>
              <Input id="totalAmount" value={formatCurrency(totalAmount)} disabled />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="date">تاريخ الفاتورة</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-right",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="ml-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: ar }) : "اختر تاريخ"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => newDate && setDate(newDate)}
                  locale={ar}
                  disabled={(date) => {
                    if (lastBillDate) {
                      return date < lastBillDate;
                    }
                    return false;
                  }}
                />
              </PopoverContent>
            </Popover>
            {lastBillDate && (
              <p className="text-xs text-muted-foreground mt-1">
                آخر فاتورة بتاريخ: {format(lastBillDate, "PPP", { locale: ar })}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="justify-between">
          <Button variant="outline" onClick={() => navigate(`/customers/${customerId}`)}>
            إلغاء
          </Button>
          <Button onClick={handleSubmit}>
            إضافة الفاتورة
          </Button>
        </CardFooter>
      </Card>
    </MainLayout>
  );
};

export default NewBill;
