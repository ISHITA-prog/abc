// src/components/DmDashboard.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../App';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { useToast } from './ui/use-toast';

interface DmDashboardProps {
  API_BASE_URL: string;
}

interface Application {
  id: number;
  department: string;
  status: 'Pending Verification' | 'Clarification Requested' | 'Approved' | 'Rejected';
  created_at: string;
  vendor_unique_id: string;
  company_name: string;
}

const DmDashboard: React.FC<DmDashboardProps> = ({ API_BASE_URL }) => {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentApplicationId, setCurrentApplicationId] = useState<number | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchAllApplications = async () => {
    if (!token || !user?.isDmOfficial) {
      setLoading(false);
      return;
    }
    try {
      const response = await axios.get(`${API_BASE_URL}/dm/applications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setApplications(response.data);
    } catch (err: any) {
      console.error('Failed to fetch all applications:', err);
      setError(err.response?.data?.message || 'Failed to load applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllApplications();
  }, [API_BASE_URL, token, user]);

  const handleStatusChangeClick = (appId: number, currentStatus: string) => {
    setCurrentApplicationId(appId);
    setNewStatus(currentStatus); // Pre-fill with current status
    setRejectionReason(''); // Clear previous reason
    setIsDialogOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!currentApplicationId || !newStatus) return;

    setIsUpdatingStatus(true);
    try {
      await axios.put(`${API_BASE_URL}/dm/applications/${currentApplicationId}/status`,
        { status: newStatus, rejectionReason: newStatus === 'Rejected' ? rejectionReason : null },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast({
        title: 'Status Updated',
        description: `Application ${currentApplicationId} status changed to ${newStatus}.`,
      });
      setIsDialogOpen(false);
      fetchAllApplications(); // Re-fetch applications to update the list
    } catch (err: any) {
      console.error('Failed to update status:', err);
      toast({
        title: 'Status Update Failed',
        description: err.response?.data?.message || 'An error occurred while updating status.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="ml-2 text-gray-700">Loading DMRC Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 mt-10">Error: {error}</div>;
  }

  if (!user?.isDmOfficial) {
    return <div className="text-center text-red-500 mt-10">Access Denied. You are not authorized to view this page.</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">DMRC Official Dashboard</h1>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-gray-800">All Vendor Applications</CardTitle>
          <CardDescription>Review and manage all submitted applications.</CardDescription>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <p className="text-gray-600 text-center py-4">No applications found.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>App ID</TableHead>
                    <TableHead>Vendor ID</TableHead>
                    <TableHead>Company Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted On</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium">{app.id}</TableCell>
                      <TableCell>{app.vendor_unique_id}</TableCell>
                      <TableCell>{app.company_name}</TableCell>
                      <TableCell>{app.department}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold
                          ${app.status === 'Approved' ? 'bg-green-100 text-green-800' : ''}
                          ${app.status === 'Rejected' ? 'bg-red-100 text-red-800' : ''}
                          ${app.status === 'Clarification Requested' ? 'bg-yellow-100 text-yellow-800' : ''}
                          ${app.status === 'Pending Verification' ? 'bg-blue-100 text-blue-800' : ''}
                        `}>
                          {app.status}
                        </span>
                      </TableCell>
                      <TableCell>{format(new Date(app.created_at), 'PPP')}</TableCell>
                      <TableCell className="space-x-2">
                        <Link to={`/application/${app.id}`}>
                          <Button variant="outline" size="sm">View</Button>
                        </Link>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleStatusChangeClick(app.id, app.status)}
                        >
                          Update Status
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Update Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white rounded-lg shadow-xl">
          <DialogHeader>
            <DialogTitle>Update Application Status</DialogTitle>
            <DialogDescription>
              Change the status for Application ID: {currentApplicationId}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <select
                id="status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="col-span-3 p-2 border border-gray-300 rounded-md"
              >
                <option value="Pending Verification">Pending Verification</option>
                <option value="Clarification Requested">Clarification Requested</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            {newStatus === 'Rejected' && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="rejectionReason" className="text-right">
                  Reason
                </Label>
                <Input
                  id="rejectionReason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="col-span-3"
                  placeholder="Reason for rejection (mandatory for 'Rejected')"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateStatus} disabled={isUpdatingStatus}>
              {isUpdatingStatus ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DmDashboard;
