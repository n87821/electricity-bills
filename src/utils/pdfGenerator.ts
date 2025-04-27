import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts'; // مؤقتاً
import { Bill, Customer } from '../types';
import { formatCurrency, formatDate, formatConsumption } from './formatting';
import { toast } from 'sonner';

// دالة لعكس الكلمات العربية
function reverseWords(text: string): string {
  return text.split(' ').reverse().join('  ');
}

// إعداد تحميل الخطوط الخاصة
const loadCustomFonts = async () => {
  const loadFont = async (url: string) => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  };

  const amiriRegular = await loadFont('/fonts/amiri-regular.ttf');
  const amiriBold = await loadFont('/fonts/amiri-bold.ttf');

  pdfMake.vfs = {
    'Amiri-Regular.ttf': amiriRegular.split(',')[1],
    'Amiri-Bold.ttf': amiriBold.split(',')[1],
  };

  pdfMake.fonts = {
    Amiri: {
      normal: 'Amiri-Regular.ttf',
      bold: 'Amiri-Bold.ttf',
      italics: 'Amiri-Regular.ttf',
      bolditalics: 'Amiri-Bold.ttf',
    },
  };
};

export const generateBillPDF = async (
  bill: Bill,
  customer: Customer,
  kwRate: number,
  settings: { companyName: string; systemName: string; logo?: string }
) => {
  try {
    console.log('Starting PDF generation...');
    await loadCustomFonts();

    const docDefinition: any = {
      pageSize: 'A4',
      pageMargins: [40, 60, 40, 60],
      defaultStyle: {
        font: 'Amiri',
        fontSize: 13,
        alignment: 'right',
      },
      content: [],
    };

    // Header (Company Name)
    docDefinition.content.push({
      text: reverseWords(settings.companyName),
      fontSize: 24,
      bold: true,
      alignment: 'center',
      margin: [0, 0, 0, 20],
    });
    docDefinition.content.push({
      text: reverseWords(settings.systemName),
      fontSize: 16,
      bold: false,
      alignment: 'center',
      margin: [0, 0, 0, 20],
    });

    
    // Customer Info
    docDefinition.content.push({
      columns: [
        { text: reverseWords(`اسم العميل: ${customer.name}`), fontSize: 12 },
      ],
      margin: [0, 0, 0, 5],
    });

    

    docDefinition.content.push({
      text: reverseWords(`رقم العداد: ${customer.meterNumber}`),
      fontSize: 12,
      margin: [0, 0, 0, 15],
    });
    docDefinition.content.push({
      text: reverseWords(`تاريخ الفاتورة: ${bill.date.getDate()}/${bill.date.getMonth() + 1}/${bill.date.getFullYear()}`),
      fontSize: 12,
      margin: [0, 0, 0, 5],
    });
    docDefinition.content.push({
      columns: [
        { text: reverseWords(`رقم الفاتورة:  ${bill.id}`), fontSize: 12 },
      ],
      margin: [0, 0, 0, 5],
    });
    // Table Title
    docDefinition.content.push({
      text: reverseWords('تفاصيل الفاتورة'),
      style: 'subheader',
      fontSize: 16,
      bold: true,
      margin: [0, 0, 0, 10],
    });

    // Bill Table
    docDefinition.content.push({
      table: {
        headerRows: 1,
        widths: ['*', '*', '*', '*', '*'],
        body: [
          [
            { text: reverseWords('المبلغ '), style: 'tableHeader', alignment: 'center' },
            { text: reverseWords('سعر الكيلو واط '), style: 'tableHeader', alignment: 'center' },
            { text: 'الاستهلاك ', style: 'tableHeader', alignment: 'center' },
            { text: reverseWords('القراءة الحالية'), style: 'tableHeader', alignment: 'center' },
            { text: reverseWords('القراءة السابقة'), style: 'tableHeader', alignment: 'center' },
          ],
          [
            { text: `${bill.amount.toFixed(2)} `, alignment: 'center' },
            { text: `${kwRate.toFixed(2)} `, alignment: 'center' },
            { text: reverseWords(formatConsumption(bill.consumption)), alignment: 'center' },
            { text: bill.currentReading.toString(), alignment: 'center' },
            { text: bill.previousReading.toString(), alignment: 'center' },
          ],
        ],
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 20],
    });

    // Total amount
    docDefinition.content.push({
      text: reverseWords(`المبلغ الإجمالي: ${bill.amount.toFixed(2)} شيكل ` ),
      fontSize: 16,
      bold: true,
      alignment: 'right',
      margin: [0, 10, 0, 0],
    });

    // Footer
    docDefinition.footer = (currentPage: number, pageCount: number) => {
      return {
        text: [
          { text: reverseWords(settings.companyName), bold: true },
          { text: ' | ' },
          { text: reverseWords(settings.systemName) },
          
          
        ],
        alignment: 'center',
        fontSize: 10,
        margin: [0, 10, 0, 0],
      };
    };

    return pdfMake.createPdf(docDefinition);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

export const printBillPDF = async (
  bill: Bill,
  customer: Customer,
  kwRate: number,
  settings: { companyName: string; systemName: string; logo?: string }
) => {
  try {
    console.log('Starting PDF print process...');
    const pdfDoc = await generateBillPDF(bill, customer, kwRate, settings);
    const fileName = `فاتورة_${customer.name.replace(/[^\u0621-\u064A0-9]/g, '_')}_${bill.id}.pdf`;

    pdfDoc.download(fileName);
    console.log('PDF saved successfully');
    toast.success('تم إنشاء ملف PDF بنجاح');
  } catch (error) {
    console.error('Error saving PDF:', error);
    toast.error('حدث خطأ أثناء حفظ ملف PDF');
  }
};
