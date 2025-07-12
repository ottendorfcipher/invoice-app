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

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'invoices' | 'customers' | 'companies'>('invoices');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [companyProfiles, setCompanyProfiles] = useState<CompanyProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

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
        fetchInvoices();
      }
    } catch (error) {
      console.error('Error updating invoice status:', error);
    }
  };

  // Calculate summary statistics
const openInvoices = invoices.filter(inv => inv.status === 'open' || inv.status === 'draft');
  const overdueInvoices = invoices.filter(inv => inv.status === 'overdue');
  const paidInvoices = invoices.filter(inv => inv.status === 'paid');
  
  const openTotal = openInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
  const overdueTotal = overdueInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
  const paidTotal = paidInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);

  // Filter invoices based on search term and status
  const filteredInvoices = invoices.filter(invoice => {
    const customer = typeof invoice.customer === 'string' 
      ? JSON.parse(invoice.customer) 
      : invoice.customer;
    
    const matchesSearch = !searchTerm || 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.status.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
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
                  </div>
                </div>
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
                      <TableHead>Invoice No.</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Issue Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((invoice) => {
                      const customer = typeof invoice.customer === 'string' 
                        ? JSON.parse(invoice.customer) 
                        : invoice.customer;
                      
                      return (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">
                            {invoice.invoiceNumber}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(invoice.status)}>
                              {invoice.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {invoice.dueDate || 'No due date'}
                          </TableCell>
                          <TableCell>
                            {customer?.name || 'Unknown Customer'}
                          </TableCell>
                          <TableCell>
                            ${invoice.total?.toFixed(2) || '0.00'}
                          </TableCell>
                          <TableCell>
                            {invoice.issueDate || 'No issue date'}
                          </TableCell>
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
                                <DropdownMenuItem asChild>
                                  <Link href={`/invoices/${invoice.id}/edit`}>
                                    Open
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => window.open(`/api/invoices/${invoice.id}/pdf/preview`, '_blank')}
                                >
                                  Download
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
