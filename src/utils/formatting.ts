
export const formatCurrency = (amount: number): string => {
  return `${amount.toFixed(2)} ₪`;
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('ar-EG', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }).format(date);
};

export const formatShortDate = (date: Date): string => {
  return new Intl.DateTimeFormat('ar-EG', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit'
  }).format(date);
};

export const formatConsumption = (consumption: number): string => {
  return `${consumption} كيلوواط`;
};
