import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Customer } from '../../types';

interface NewInvoiceDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  customers: Customer[];
  selectedCustomer: string;
  onSelectCustomer: (id: string) => void;
  currentReading: string;
  onChangeReading: (reading: string) => void;
  onAddBill: () => void;
  selectedDate: Date;
  onChangeDate: (date: Date) => void;
  previousReading: number;
  lastBillDate: Date | null;
  triggerButton?: React.ReactNode;
}

export const NewInvoiceDialog = ({
  isOpen,
  onOpenChange,
  customers,
  selectedCustomer,
  onSelectCustomer,
  currentReading,
  onChangeReading,
  onAddBill,
  selectedDate,
  onChangeDate,
  previousReading,
  lastBillDate,
  triggerButton
}: NewInvoiceDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {triggerButton && <DialogTrigger asChild>{triggerButton}</DialogTrigger>}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>إضافة فاتورة جديدة</DialogTitle>
          <DialogDescription>
            أدخل قراءة العداد الحالية لإنشاء فاتورة جديدة
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="customerName" className="text-right">
              العميل
            </Label>
            <Select 
              value={selectedCustomer} 
              onValueChange={onSelectCustomer}
            >
              <SelectTrigger className="col-span-3">
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
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="previousReading" className="text-right">
              القراءة السابقة
            </Label>
            <Input
              id="previousReading"
              className="col-span-3"
              value={previousReading}
              disabled
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reading" className="text-right">
              القراءة الحالية
            </Label>
            <Input
              id="reading"
              type="number"
              min={previousReading + 1}
              className="col-span-3"
              value={currentReading}
              onChange={(e) => onChangeReading(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              التاريخ
            </Label>
            <div className="col-span-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-right",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="ml-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP", { locale: ar }) : "اختر تاريخ"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && onChangeDate(date)}
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
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={onAddBill}>
            إضافة الفاتورة
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
