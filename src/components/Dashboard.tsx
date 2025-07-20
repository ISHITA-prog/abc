// src/components/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../App';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

interface DashboardProps {
  API_BASE_URL: string;
}

interface Application {
  id: number;
  department: string;
  status: 'Pending Verification' | 'Clarification Requested' | 'Approved' | 'Rejected';
  created_at: string;
}

const Dashboard: React.FC<DashboardProps> = ({ API_BASE_URL }) => {
  const { user, token } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const departments = [
    { name: 'Civil Department', path: 'civil' },
    { name: 'Electrical Department', path: 'electrical' },
    { name: 'Mechanical Department', path: 'mechanical' },
  ];

  useEffect(() => {
    const fetchApplications = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(`${API_BASE_URL}/user/applications`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setApplications(response.data);
      } catch (err: any) {
        console.error('Failed to fetch applications:', err);
        setError(err.response?.data?.message || 'Failed to load applications.');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [API_BASE_URL, token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="ml-2 text-gray-700">Loading applications...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 mt-10">Error: {error}</div>;
  }

  if (!user) {
    return <div className="text-center text-gray-600 mt-10">Please log in to view your dashboard.</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Welcome, {user.uniqueId}!</h1>

      {user.isDmOfficial && (
        <Card className="mb-8 border-blue-400 shadow-lg">
          <CardHeader>
            <CardTitle className="text-blue-700">DMRC Official Access</CardTitle>
            <CardDescription>You have official privileges. Access the DMRC dashboard for all applications.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/dm-dashboard">
              <Button className="bg-blue-600 hover:bg-blue-700">Go to DMRC Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle className="text-gray-800">New Application</CardTitle>
          <CardDescription>Select a department to submit a new empanelment application.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {departments.map((dept) => (
            <Link key={dept.path} to={`/apply/${dept.path}`}>
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white rounded-md py-3 text-lg font-semibold transition-colors duration-200">
                Apply for {dept.name}
              </Button>
            </Link>
          ))}
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-gray-800">Your Applications</CardTitle>
          <CardDescription>Overview of your submitted applications.</CardDescription>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <p className="text-gray-600 text-center py-4">No applications submitted yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Application ID</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submission Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium">{app.id}</TableCell>
                      <TableCell>{departments.find(d => d.path === app.department)?.name || app.department}</TableCell>
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
                      <TableCell>
                        <Link to={`/application/${app.id}`}>
                          <Button variant="outline" size="sm">View Details</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
