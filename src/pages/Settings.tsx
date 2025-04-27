
import React, { useState, useRef } from 'react';
import MainLayout from '../components/Layout/MainLayout';
import { useAppContext } from '../context/AppContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Upload, Download } from 'lucide-react';
import { format } from 'date-fns';

const Settings = () => {
  const { settings, updateSettings, customers, bills } = useAppContext();
  const [kwRate, setKwRate] = useState(settings.kwRate.toString());
  const [companyName, setCompanyName] = useState(settings.companyName);
  const [systemName, setSystemName] = useState(settings.systemName);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const backupInputRef = useRef<HTMLInputElement>(null);
  
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 500000) { // 500KB limit
        toast.error("حجم الشعار يجب أن يكون أقل من 500 كيلوبايت");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        updateSettings({
          ...settings,
          logo: reader.result as string
        });
        toast.success("تم تحديث الشعار بنجاح");
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSaveSettings = () => {
    const rateValue = parseFloat(kwRate);
    
    if (isNaN(rateValue) || rateValue <= 0) {
      toast.error("يرجى إدخال قيمة صحيحة وموجبة");
      return;
    }
    
    if (!companyName.trim() || !systemName.trim()) {
      toast.error("جميع الحقول مطلوبة");
      return;
    }
    
    updateSettings({
      ...settings,
      kwRate: rateValue,
      companyName: companyName.trim(),
      systemName: systemName.trim()
    });
    
    toast.success("تم حفظ الإعدادات بنجاح");
  };

  const handleBackup = () => {
    const data = {
      customers,
      bills,
      settings
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('تم إنشاء نسخة احتياطية بنجاح');
  };

  const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        // Validate backup data structure
        if (!data.customers || !data.bills || !data.settings) {
          throw new Error('Invalid backup file format');
        }
        
        // Update all data
        if (window.api) {
          // Update in Electron
          Promise.all([
            ...data.customers.map((c: any) => window.api.addCustomer(c)),
            ...data.bills.map((b: any) => window.api.addBill(b)),
            window.api.updateSettings(data.settings)
          ]).then(() => {
            toast.success('تم استعادة النسخة الاحتياطية بنجاح');
            window.location.reload();
          });
        } else {
          // Update in localStorage
          localStorage.setItem('customers', JSON.stringify(data.customers));
          localStorage.setItem('bills', JSON.stringify(data.bills));
          localStorage.setItem('settings', JSON.stringify(data.settings));
          toast.success('تم استعادة النسخة الاحتياطية بنجاح');
          window.location.reload();
        }
      } catch (error) {
        console.error('Error restoring backup:', error);
        toast.error('حدث خطأ أثناء استعادة النسخة الاحتياطية');
      }
    };
    reader.readAsText(file);
  };

  return (
    <MainLayout title="الإعدادات">
      <div className="max-w-xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>إعدادات النظام</CardTitle>
            <CardDescription>تخصيص إعدادات نظام الفواتير</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">اسم الشركة</Label>
                <Input 
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="systemName">اسم النظام</Label>
                <Input 
                  id="systemName"
                  value={systemName}
                  onChange={(e) => setSystemName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="kwRate">سعر الكيلو واط (شيكل)</Label>
                <Input 
                  id="kwRate" 
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={kwRate}
                  onChange={(e) => setKwRate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>شعار الشركة</Label>
                <div className="flex items-center gap-4">
                  {settings.logo && (
                    <img 
                      src={settings.logo} 
                      alt="شعار الشركة" 
                      className="h-16 w-16 object-contain"
                    />
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 ml-2" />
                    تحميل شعار
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleLogoUpload}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  يجب أن يكون حجم الملف أقل من 500 كيلوبايت
                </p>
              </div>

              <div className="space-y-2">
                <Label>النسخ الاحتياطي واستعادة البيانات</Label>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBackup}
                  >
                    <Download className="w-4 h-4 ml-2" />
                    إنشاء نسخة احتياطية
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => backupInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 ml-2" />
                    استعادة من نسخة احتياطية
                  </Button>
                  <input
                    type="file"
                    ref={backupInputRef}
                    className="hidden"
                    accept=".json"
                    onChange={handleRestore}
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handleSaveSettings}>
              حفظ الإعدادات
            </Button>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Settings;
