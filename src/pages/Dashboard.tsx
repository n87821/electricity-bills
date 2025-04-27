import React, { useState } from 'react';
import MainLayout from '../components/Layout/MainLayout';
import { useAppContext } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartBar, Users, FileText, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency } from '../utils/formatting';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { customers, bills, getUnpaidBills } = useAppContext();
  const [startMonthIndex, setStartMonthIndex] = useState(0);
  const navigate = useNavigate();
  
  const unpaidBills = getUnpaidBills();
  const totalConsumption = bills.reduce((acc, bill) => acc + bill.consumption, 0);
  const totalRevenue = bills.reduce((acc, bill) => acc + bill.amount, 0);
  const paidRevenue = bills.filter(bill => bill.isPaid).reduce((acc, bill) => acc + bill.amount, 0);
  
  // Get monthly data
  const currentYear = new Date().getFullYear();
  const getMonthlyData = () => {
    const monthlyData = Array(12).fill(0).map((_, i) => ({
      month: i + 1,
      consumption: 0,
      revenue: 0
    }));
    
    bills.forEach(bill => {
      if (bill.date.getFullYear() === currentYear) {
        const monthIndex = bill.date.getMonth();
        monthlyData[monthIndex].consumption += bill.consumption;
        monthlyData[monthIndex].revenue += bill.amount;
      }
    });
    
    return monthlyData;
  };

  const monthlyData = getMonthlyData();
  
  const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 
                      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

  // Get visible months data (5 months at a time)
  const getVisibleMonthsData = () => {
    const visibleMonths = [];
    for (let i = 0; i < 5; i++) {
      const monthIndex = (startMonthIndex + i) % 12;
      visibleMonths.push({
        name: monthNames[monthIndex],
        استهلاك: monthlyData[monthIndex].consumption,
        مبلغ: monthlyData[monthIndex].revenue
      });
    }
    return visibleMonths;
  };

  // Navigation handlers
  const goToPreviousMonth = () => {
    setStartMonthIndex((prev) => (prev - 1 + 12) % 12);
  };
  
  const goToNextMonth = () => {
    setStartMonthIndex((prev) => (prev + 1) % 12);
  };

  const visibleMonths = getVisibleMonthsData();
  const monthRange = `${monthNames[startMonthIndex]} - ${monthNames[(startMonthIndex + 4) % 12]}`;

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  return (
    <MainLayout title="لوحة المعلومات">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">لوحة التحكم</h1>
        <Button onClick={handleLogout} variant="outline">
          تسجيل الخروج
        </Button>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="stats-card border-l-teal-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Users className="text-teal-600" size={20} />
              <span>العملاء</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{customers.length}</p>
            <p className="text-xs text-muted-foreground mt-1">عميل مسجل في النظام</p>
          </CardContent>
        </Card>

        <Card className="stats-card border-l-blue-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <FileText className="text-blue-600" size={20} />
              <span>الفواتير غير المدفوعة</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{unpaidBills.length}</p>
            <p className="text-xs text-muted-foreground mt-1">فاتورة في انتظار الدفع</p>
          </CardContent>
        </Card>

        <Card className="stats-card border-l-amber-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Calendar className="text-amber-600" size={20} />
              <span>إجمالي الاستهلاك</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalConsumption}</p>
            <p className="text-xs text-muted-foreground mt-1">كيلو واط</p>
          </CardContent>
        </Card>

        <Card className="stats-card border-l-emerald-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <ChartBar className="text-emerald-600" size={20} />
              <span>إجمالي الفواتير</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(totalRevenue)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              تم تحصيل {formatCurrency(paidRevenue)} ({Math.round((paidRevenue/totalRevenue || 0) * 100)}%)
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 mt-8 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>الاستهلاك الشهري (كيلوواط)</CardTitle>
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                className="rounded-full h-8 w-8 p-0" 
                onClick={goToPreviousMonth}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">الشهر السابق</span>
              </Button>
              <span className="font-bold text-lg">{monthRange}</span>
              <Button 
                variant="outline" 
                className="rounded-full h-8 w-8 p-0" 
                onClick={goToNextMonth}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">الشهر التالي</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={visibleMonths}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="استهلاك" fill="#0d9488" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>الإيرادات الشهرية (شيكل)</CardTitle>
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                className="rounded-full h-8 w-8 p-0" 
                onClick={goToPreviousMonth}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">الشهر السابق</span>
              </Button>
              <span className="font-bold text-lg">{monthRange}</span>
              <Button 
                variant="outline" 
                className="rounded-full h-8 w-8 p-0" 
                onClick={goToNextMonth}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">الشهر التالي</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={visibleMonths}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="مبلغ" stroke="#0d9488" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
