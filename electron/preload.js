
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
  // Customer operations
  getCustomers: () => ipcRenderer.invoke('get-customers'),
  addCustomer: (customer) => ipcRenderer.invoke('add-customer', customer),
  updateCustomer: (customer) => ipcRenderer.invoke('update-customer', customer),
  deleteCustomer: (id) => ipcRenderer.invoke('delete-customer', id),
  
  // Bill operations
  getBills: () => ipcRenderer.invoke('get-bills'),
  addBill: (bill) => ipcRenderer.invoke('add-bill', bill),
  markBillPaid: (id) => ipcRenderer.invoke('mark-bill-paid', id),
  deleteBill: (id) => ipcRenderer.invoke('delete-bill', id),
  
  // Settings operations
  getSettings: () => ipcRenderer.invoke('get-settings'),
  updateSettings: (settings) => ipcRenderer.invoke('update-settings', settings)
});
