'use client';

import { useEffect, useState } from 'react';
import { Invoice, Customer, CompanyProfile } from '@/db/schema';
import Link from 'next/link';
import Customers from '@/components/Customers';
import CompanyProfiles from '@/components/CompanyProfiles';

// Shadcn/ui components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Settings, CalendarDays } from 'lucide-react';
import { format, isWithinInterval } from 'date-fns';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'invoices' | 'customers' | 'companies'>('invoices');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [companyProfiles, setCompanyProfiles] = useState<CompanyProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Sorting state
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Advanced filtering state
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    status: [],
    customer: '',
    dateRange: {
      start: '',
      end: ''
    },
    amountRange: {
      min: '',
      max: ''
    }
  });
  
  // Settings modal state
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [dashboardSettings, setDashboardSettings] = useState({
    showRollingTotals: false,
    enableCalendarFilter: false,
    showInvoiceGenerationTime: false,
    showPaymentTime: false,
    calendarRange: null as { start: Date; end: Date } | null
  });
  
  // Calendar icon visibility
  const [showCalendarIcon, setShowCalendarIcon] = useState(false);
  const [showCalendarPicker, setShowCalendarPicker] = useState(false);

  useEffect(() => {
    if (activeTab === 'invoices') {
      fetchInvoices();
    } else if (activeTab === 'customers') {
      fetchCustomers();
    } else if (activeTab === 'companies') {
      fetchCompanyProfiles();
    }
  }, [activeTab]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/invoices');
      const data = await response.json();
      setInvoices(data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/customers');
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchCompanyProfiles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/company-profiles');
      const data = await response.json();
      setCompanyProfiles(data);
    } catch (error) {
      console.error('Error fetching company profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/invoices/${id}`, { method: 'DELETE' });
      fetchInvoices();
    } catch (error) {
      console.error('Error deleting invoice:', error);
    }
  };

  const handleDuplicate = async (invoice: Invoice) => {
    try {
      const duplicateData = {
        ...invoice,
        id: undefined,
        invoiceNumber: `${invoice.invoiceNumber}-COPY`,
        status: 'draft',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: '',
      };
      delete duplicateData.id;
      
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(duplicateData),
      });
      
      if (response.ok) {
        fetchInvoices();
        alert('Invoice duplicated successfully!');
      }
    } catch (error) {
      console.error('Error duplicating invoice:', error);
      alert('Error duplicating invoice.');
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const invoice = invoices.find(inv => inv.id === id);
      if (!invoice) return;
      
      // Optimistically update the UI
      setInvoices(prevInvoices => 
        prevInvoices.map(inv => 
          inv.id === id ? { ...inv, status: newStatus } : inv
        )
      );
      
      const response = await fetch(`/api/invoices/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...invoice,
          status: newStatus,
        }),
      });
      
      if (response.ok) {
        // Refresh to ensure we have the latest data
        await fetchInvoices();
      } else {
        // Revert optimistic update on failure
        setInvoices(prevInvoices => 
          prevInvoices.map(inv => 
            inv.id === id ? { ...inv, status: invoice.status } : inv
          )
        );
        console.error('Failed to update invoice status');
      }
    } catch (error) {
      console.error('Error updating invoice status:', error);
      // Revert optimistic update on error
      const originalInvoice = invoices.find(inv => inv.id === id);
      if (originalInvoice) {
        setInvoices(prevInvoices => 
          prevInvoices.map(inv => 
            inv.id === id ? { ...inv, status: originalInvoice.status } : inv
          )
        );
      }
    }
  };

  // Calculate summary statistics
const openInvoices = invoices.filter(inv => inv.status === 'open' || inv.status === 'draft');
  const overdueInvoices = invoices.filter(inv => inv.status === 'overdue');
  const paidInvoices = invoices.filter(inv => inv.status === 'paid');
  
  const openTotal = openInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
  const overdueTotal = overdueInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
  const paidTotal = paidInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
  
  // Calculate rolling totals if enabled
  const calculateRollingTotal = (invoicesList: any[]) => {
    return invoicesList.reduce((acc, invoice, index) => {
      const previousTotal = index > 0 ? acc[index - 1].rollingTotal : 0;
      const currentTotal = previousTotal + (invoice.total || 0);
      acc.push({ ...invoice, rollingTotal: currentTotal });
      return acc;
    }, [] as any[]);
  };

  // Utility function to format dates to MM-DD-YYYY
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };
  
  // Utility function to format times to HH:MM AM/PM
  const formatTime = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };
  
  // Column sorting function
  const handleColumnSort = (column: string) => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column and default to asc
      setSortColumn(column);
      setSortDirection('asc');
    }
  };
  
  // Sort invoices
  const sortedInvoices = [...invoices].sort((a, b) => {
    if (!sortColumn) return 0;
    
    let aValue, bValue;
    
    switch (sortColumn) {
      case 'invoiceNumber':
        aValue = a.invoiceNumber;
        bValue = b.invoiceNumber;
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      case 'dueDate':
        aValue = a.dueDate || '';
        bValue = b.dueDate || '';
        break;
      case 'issueDate':
        aValue = a.issueDate || '';
        bValue = b.issueDate || '';
        break;
      case 'customer':
        const customerA = typeof a.customer === 'string' ? JSON.parse(a.customer) : a.customer;
        const customerB = typeof b.customer === 'string' ? JSON.parse(b.customer) : b.customer;
        aValue = customerA?.name || '';
        bValue = customerB?.name || '';
        break;
      case 'amount':
        aValue = a.total || 0;
        bValue = b.total || 0;
        break;
      default:
        return 0;
    }
    
    // Handle numeric sorting for amount
    if (sortColumn === 'amount') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    // Handle date sorting
    if (sortColumn === 'dueDate' || sortColumn === 'issueDate') {
      const dateA = new Date(aValue);
      const dateB = new Date(bValue);
      return sortDirection === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
    }
    
    // Handle string sorting
    const comparison = aValue.toString().localeCompare(bValue.toString());
    return sortDirection === 'asc' ? comparison : -comparison;
  });
  
  // Filter invoices based on search term, status, and advanced filters
  const filteredInvoices = sortedInvoices.filter(invoice => {
    const customer = typeof invoice.customer === 'string' 
      ? JSON.parse(invoice.customer) 
      : invoice.customer;
    
    // Basic search
    const matchesSearch = !searchTerm || 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.status.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Basic status filter
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    // Advanced filters
    const matchesAdvancedStatus = advancedFilters.status.length === 0 || 
      advancedFilters.status.includes(invoice.status);
    
    const matchesAdvancedCustomer = !advancedFilters.customer || 
      customer?.name?.toLowerCase().includes(advancedFilters.customer.toLowerCase());
    
    const matchesDateRange = (!advancedFilters.dateRange.start || 
      new Date(invoice.issueDate || '') >= new Date(advancedFilters.dateRange.start)) &&
      (!advancedFilters.dateRange.end || 
      new Date(invoice.issueDate || '') <= new Date(advancedFilters.dateRange.end));
    
    const matchesAmountRange = (!advancedFilters.amountRange.min || 
      (invoice.total || 0) >= parseFloat(advancedFilters.amountRange.min)) &&
      (!advancedFilters.amountRange.max || 
      (invoice.total || 0) <= parseFloat(advancedFilters.amountRange.max));
    
    // Calendar filter
    const matchesCalendarFilter = !dashboardSettings.enableCalendarFilter || 
      !dashboardSettings.calendarRange || 
      (invoice.issueDate && isWithinInterval(
        new Date(invoice.issueDate),
        {
          start: dashboardSettings.calendarRange.start,
          end: dashboardSettings.calendarRange.end
        }
      ));
    
    return matchesSearch && matchesStatus && matchesAdvancedStatus && 
           matchesAdvancedCustomer && matchesDateRange && matchesAmountRange && matchesCalendarFilter;
  });
  
  // Apply rolling totals if enabled
  const displayInvoices = dashboardSettings.showRollingTotals 
    ? calculateRollingTotal(filteredInvoices)
    : filteredInvoices;
  
  // Reset advanced filters
  const resetAdvancedFilters = () => {
    setAdvancedFilters({
      status: [],
      customer: '',
      dateRange: {
        start: '',
        end: ''
      },
      amountRange: {
        min: '',
        max: ''
      }
    });
  };
  
  // Apply advanced filters
  const applyAdvancedFilters = () => {
    setShowAdvancedFilter(false);
  };
  
  // Settings modal handlers
  const handleSettingsChange = (key: string, value: any) => {
    setDashboardSettings(prev => ({ ...prev, [key]: value }));
    
    // Show calendar icon when calendar filter is enabled
    if (key === 'enableCalendarFilter') {
      setShowCalendarIcon(value);
    }
  };
  
  const handleCalendarRangeSelect = (range: { start: Date; end: Date }) => {
    setDashboardSettings(prev => ({ ...prev, calendarRange: range }));
  };
  
  const applySettings = () => {
    setShowSettingsModal(false);
  };
  
  const resetSettings = () => {
    setDashboardSettings({
      showRollingTotals: false,
      enableCalendarFilter: false,
      showInvoiceGenerationTime: false,
      showPaymentTime: false,
      calendarRange: null
    });
    setShowCalendarIcon(false);
    setShowCalendarPicker(false);
  };
  
  // Check if advanced filters are active
  const hasAdvancedFilters = advancedFilters.status.length > 0 || 
    advancedFilters.customer || 
    advancedFilters.dateRange.start || 
    advancedFilters.dateRange.end || 
    advancedFilters.amountRange.min || 
    advancedFilters.amountRange.max;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'open': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCreateButtonText = () => {
    switch (activeTab) {
      case 'invoices': return 'Create Invoice';
      case 'customers': return 'Add Customer';
      case 'companies': return 'Add Company';
      default: return 'Create';
    }
  };

  const getCreateButtonLink = () => {
    switch (activeTab) {
      case 'invoices': return '/invoices/new';
      case 'customers': return '/customers/new';
      case 'companies': return '/company-profiles/new';
      default: return '#';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Simple Invoice Dashboard</h1>
          <Button asChild>
            <Link href={getCreateButtonLink()}>
              {getCreateButtonText()}
            </Link>
          </Button>
        </div>

        {/* Main tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="companies">Company Profiles</TabsTrigger>
          </TabsList>

          {/* Tab content */}
          <TabsContent value="invoices" className="mt-6">
            {/* Summary boxes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      ${openTotal.toFixed(2)}
                    </div>
                    <div className="text-lg text-gray-600 mb-1">Open</div>
                    <div className="text-sm text-gray-500">
                      {openInvoices.length === 0 ? 'No Invoices' : `${openInvoices.length} Invoice${openInvoices.length !== 1 ? 's' : ''}`}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600 mb-2">
                      ${overdueTotal.toFixed(2)}
                    </div>
                    <div className="text-lg text-gray-600 mb-1">Overdue</div>
                    <div className="text-sm text-gray-500">
                      {overdueInvoices.length === 0 ? 'No Invoices' : `${overdueInvoices.length} Invoice${overdueInvoices.length !== 1 ? 's' : ''}`}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      ${paidTotal.toFixed(2)}
                    </div>
                    <div className="text-lg text-gray-600 mb-1">Paid</div>
                    <div className="text-sm text-gray-500">
                      {paidInvoices.length === 0 ? 'No Invoices' : `${paidInvoices.length} Invoice${paidInvoices.length !== 1 ? 's' : ''}`}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filter */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <Input
                    type="text"
                    placeholder="Search or filter"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center space-x-1">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                          </svg>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setStatusFilter('all')}>All Status</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setStatusFilter('draft')}>Draft</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setStatusFilter('open')}>Open</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setStatusFilter('paid')}>Paid</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setStatusFilter('overdue')}>Overdue</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    
                    <Dialog open={showAdvancedFilter} onOpenChange={setShowAdvancedFilter}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className={`h-8 w-8 p-0 ${hasAdvancedFilters ? 'text-blue-600' : ''}`}>
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                          </svg>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <DialogHeader>
                          <DialogTitle>Sort & Filter</DialogTitle>
                          <DialogDescription>
                            Apply advanced filters to your invoices
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          {/* Status Filter */}
                          <div>
                            <Label className="text-sm font-medium">Status</Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {['draft', 'open', 'paid', 'overdue'].map((status) => (
                                <div key={status} className="flex items-center space-x-2">
                                  <Checkbox 
                                    id={status}
                                    checked={advancedFilters.status.includes(status)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setAdvancedFilters(prev => ({
                                          ...prev,
                                          status: [...prev.status, status]
                                        }));
                                      } else {
                                        setAdvancedFilters(prev => ({
                                          ...prev,
                                          status: prev.status.filter(s => s !== status)
                                        }));
                                      }
                                    }}
                                  />
                                  <Label htmlFor={status} className="text-sm capitalize">{status}</Label>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {/* Customer Filter */}
                          <div>
                            <Label htmlFor="customer-filter" className="text-sm font-medium">Customer</Label>
                            <Input 
                              id="customer-filter"
                              value={advancedFilters.customer}
                              onChange={(e) => setAdvancedFilters(prev => ({ ...prev, customer: e.target.value }))}
                              placeholder="Filter by customer name"
                              className="mt-1"
                            />
                          </div>
                          
                          {/* Date Range */}
                          <div>
                            <Label className="text-sm font-medium">Issue Date Range</Label>
                            <div className="grid grid-cols-2 gap-2 mt-1">
                              <Input 
                                type="date"
                                value={advancedFilters.dateRange.start}
                                onChange={(e) => setAdvancedFilters(prev => ({ 
                                  ...prev, 
                                  dateRange: { ...prev.dateRange, start: e.target.value } 
                                }))}
                                placeholder="Start date"
                              />
                              <Input 
                                type="date"
                                value={advancedFilters.dateRange.end}
                                onChange={(e) => setAdvancedFilters(prev => ({ 
                                  ...prev, 
                                  dateRange: { ...prev.dateRange, end: e.target.value } 
                                }))}
                                placeholder="End date"
                              />
                            </div>
                          </div>
                          
                          {/* Amount Range */}
                          <div>
                            <Label className="text-sm font-medium">Amount Range</Label>
                            <div className="grid grid-cols-2 gap-2 mt-1">
                              <Input 
                                type="number"
                                value={advancedFilters.amountRange.min}
                                onChange={(e) => setAdvancedFilters(prev => ({ 
                                  ...prev, 
                                  amountRange: { ...prev.amountRange, min: e.target.value } 
                                }))}
                                placeholder="Min amount"
                              />
                              <Input 
                                type="number"
                                value={advancedFilters.amountRange.max}
                                onChange={(e) => setAdvancedFilters(prev => ({ 
                                  ...prev, 
                                  amountRange: { ...prev.amountRange, max: e.target.value } 
                                }))}
                                placeholder="Max amount"
                              />
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex justify-between pt-4">
                            <Button variant="outline" onClick={resetAdvancedFilters}>
                              Clear All
                            </Button>
                            <Button onClick={applyAdvancedFilters}>
                              Apply Filters
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                
                {/* Settings Button */}
                <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Settings
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Dashboard Settings</DialogTitle>
                      <DialogDescription>
                        Configure your dashboard view and filtering options
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6">
                      {/* Rolling Totals */}
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="rollingTotals"
                          checked={dashboardSettings.showRollingTotals}
                          onCheckedChange={(checked) => handleSettingsChange('showRollingTotals', checked)}
                        />
                        <Label htmlFor="rollingTotals" className="text-sm font-medium">
                          Show rolling totals column
                        </Label>
                      </div>
                      
                      {/* Calendar Filter */}
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="calendarFilter"
                            checked={dashboardSettings.enableCalendarFilter}
                            onCheckedChange={(checked) => handleSettingsChange('enableCalendarFilter', checked)}
                          />
                          <Label htmlFor="calendarFilter" className="text-sm font-medium">
                            Enable calendar filtering
                          </Label>
                        </div>
                        
                        {dashboardSettings.enableCalendarFilter && (
                          <div className="ml-6">
                            <Calendar 
                              mode="range"
                              onSelect={(range) => {
                                if (range && range.from && range.to) {
                                  handleCalendarRangeSelect({ start: range.from, end: range.to });
                                }
                              }}
                              className="rounded-md border max-w-md"
                              classNames={{
                                day_range_middle: "bg-blue-100 text-blue-900",
                                day_range_start: "bg-blue-600 text-white",
                                day_range_end: "bg-blue-600 text-white",
                              }}
                            />
                          </div>
                        )}
                      </div>
                      
                      {/* Invoice Generation Time */}
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="invoiceGenerationTime"
                          checked={dashboardSettings.showInvoiceGenerationTime}
                          onCheckedChange={(checked) => handleSettingsChange('showInvoiceGenerationTime', checked)}
                        />
                        <Label htmlFor="invoiceGenerationTime" className="text-sm font-medium">
                          Show invoice generation time
                        </Label>
                      </div>

                      {/* Payment Time */}
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="paymentTime"
                          checked={dashboardSettings.showPaymentTime}
                          onCheckedChange={(checked) => handleSettingsChange('showPaymentTime', checked)}
                        />
                        <Label htmlFor="paymentTime" className="text-sm font-medium">
                          Show payment time
                        </Label>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-between pt-4">
                        <Button variant="outline" onClick={resetSettings}>
                          Reset All
                        </Button>
                        <Button onClick={applySettings}>
                          Apply Settings
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                {/* Calendar Icon - appears when calendar filter is enabled */}
                {showCalendarIcon && (
                  <Dialog open={showCalendarPicker} onOpenChange={setShowCalendarPicker}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4" />
                        {dashboardSettings.calendarRange ? (
                          <span className="text-xs">
                            {format(dashboardSettings.calendarRange.start, 'MMM d')} - {format(dashboardSettings.calendarRange.end, 'MMM d')}
                          </span>
                        ) : (
                          'Select Range'
                        )}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Select Date Range</DialogTitle>
                        <DialogDescription>
                          Choose a date range to filter your invoices
                        </DialogDescription>
                      </DialogHeader>
                      <Calendar 
                        mode="range"
                        onSelect={(range) => {
                          if (range && range.from && range.to) {
                            handleCalendarRangeSelect({ start: range.from, end: range.to });
                          }
                        }}
                        className="rounded-md border"
                        classNames={{
                          day_range_middle: "bg-blue-100 text-blue-900",
                          day_range_start: "bg-blue-600 text-white",
                          day_range_end: "bg-blue-600 text-white",
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>

            {/* Invoice Table */}
            <Card>
              {loading ? (
                <div className="p-8 text-center">Loading invoices...</div>
              ) : filteredInvoices.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  {invoices.length === 0 ? (
                    <>
                      No invoices found. 
                      <Link href="/invoices/new" className="text-blue-600 hover:text-blue-800 ml-1">
                        Create your first invoice
                      </Link>
                    </>
                  ) : (
                    "No invoices match your search criteria."
                  )}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50 select-none"
                        onClick={() => handleColumnSort('invoiceNumber')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Invoice No.</span>
                          {sortColumn === 'invoiceNumber' && (
                            <span className="text-xs">
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50 select-none"
                        onClick={() => handleColumnSort('status')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Status</span>
                          {sortColumn === 'status' && (
                            <span className="text-xs">
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50 select-none"
                        onClick={() => handleColumnSort('dueDate')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Due Date</span>
                          {sortColumn === 'dueDate' && (
                            <span className="text-xs">
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50 select-none"
                        onClick={() => handleColumnSort('customer')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Customer</span>
                          {sortColumn === 'customer' && (
                            <span className="text-xs">
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50 select-none"
                        onClick={() => handleColumnSort('amount')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Amount</span>
                          {sortColumn === 'amount' && (
                            <span className="text-xs">
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </TableHead>
                      {dashboardSettings.showRollingTotals && (
                        <TableHead>Rolling Total</TableHead>
                      )}
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50 select-none"
                        onClick={() => handleColumnSort('issueDate')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Issue Date</span>
                          {sortColumn === 'issueDate' && (
                            <span className="text-xs">
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </TableHead>
                      {dashboardSettings.showInvoiceGenerationTime && (
                        <TableHead>Generation Time</TableHead>
                      )}
                      {dashboardSettings.showPaymentTime && (
                        <TableHead>Payment Time</TableHead>
                      )}
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayInvoices.map((invoice) => {
                      const customer = typeof invoice.customer === 'string' 
                        ? JSON.parse(invoice.customer) 
                        : invoice.customer;
                      
                      return (
                        <TableRow key={invoice.id} className={invoice.status === 'paid' ? 'bg-green-50 opacity-70' : ''}>
                          <TableCell className="font-medium">
                            {invoice.invoiceNumber}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(invoice.status)}>
                              {invoice.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {invoice.dueDate ? formatDate(invoice.dueDate) : 'No due date'}
                          </TableCell>
                          <TableCell>
                            {customer?.name || 'Unknown Customer'}
                          </TableCell>
                          <TableCell>
                            ${invoice.total?.toFixed(2) || '0.00'}
                          </TableCell>
                          {dashboardSettings.showRollingTotals && (
                            <TableCell className="font-medium text-blue-600">
                              ${invoice.rollingTotal?.toFixed(2) || '0.00'}
                            </TableCell>
                          )}
                          <TableCell>
                            {invoice.issueDate ? formatDate(invoice.issueDate) : 'No issue date'}
                          </TableCell>
                          {dashboardSettings.showInvoiceGenerationTime && (
                            <TableCell className="text-sm text-gray-500">
                              {invoice.createdAt ? formatTime(invoice.createdAt) : 'N/A'}
                            </TableCell>
                          )}
                          {dashboardSettings.showPaymentTime && (
                            <TableCell className="text-sm text-gray-500">
                              {invoice.status === 'paid' ? 
                                (invoice.updatedAt ? formatTime(invoice.updatedAt) : 'N/A') : 
                                'Not paid'
                              }
                            </TableCell>
                          )}
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                  </svg>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {invoice.status !== 'paid' && (
                                  <DropdownMenuItem asChild>
                                    <Link href={`/invoices/${invoice.id}/edit`}>
                                      Edit
                                    </Link>
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem 
                                  onClick={() => window.open(`/api/invoices/${invoice.id}/pdf/preview`, '_blank')}
                                >
                                  Download
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => window.open(`/api/invoices/${invoice.id}/pdf/preview`, '_blank')}
                                >
                                  Print
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDuplicate(invoice)}>
                                  Duplicate
                                </DropdownMenuItem>
                                {invoice.status !== 'paid' ? (
                                  <DropdownMenuItem onClick={() => handleStatusChange(invoice.id, 'paid')}>
                                    Mark as Paid
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem onClick={() => handleStatusChange(invoice.id, 'open')}>
                                    Mark as Unpaid
                                  </DropdownMenuItem>
                                )}
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600 focus:text-red-600">
                                      Delete
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Are you sure you want to delete this invoice?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete invoice #{invoice.invoiceNumber} and remove it from your records.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction 
                                        onClick={() => handleDelete(invoice.id)}
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        Delete Invoice
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="customers" className="mt-6">
            <Customers />
          </TabsContent>

          <TabsContent value="companies" className="mt-6">
            <CompanyProfiles />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
