import React, { useState, useEffect } from 'react';
import { CompanyProfile } from '@/db/schema';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export default function CompanyProfiles() {
  const router = useRouter();
  const [companyProfiles, setCompanyProfiles] = useState<CompanyProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanyProfiles();
  }, []);

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
      await fetch(`/api/company-profiles/${id}`, { method: 'DELETE' });
      fetchCompanyProfiles();
    } catch (error) {
      console.error('Error deleting company profile:', error);
    }
  };

  return (
    <Card>
      {loading ? (
        <div className="p-8 text-center">Loading company profiles...</div>
      ) : companyProfiles.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          No company profiles found.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companyProfiles.map((profile) => (
              <TableRow key={profile.id}>
                <TableCell className="font-medium">
                  {profile.name}
                </TableCell>
                <TableCell>
                  {profile.email || 'No email'}
                </TableCell>
                <TableCell>
                  {profile.address || 'No address'}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/company-profiles/${profile.id}/edit`)}
                    >
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive">
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the company profile.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(profile.id)}>
                            Delete
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
      )}
    </Card>
  );
}

