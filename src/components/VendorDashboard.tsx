import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from "@/components/ui/separator";
import demo_profile_image from "../../public/download.png"

import { 
  Building2, 
  Lock,
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  User, 
  LogOut,
  Plus,
  Download,
  Upload,
  Bell
} from 'lucide-react';
import ApplicationForm from '@/components/ApplicationForm';
import DocumentUpload from '@/components/DocumentUpload';
import { toast } from '@/hooks/use-toast';

const VendorDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [applications, setApplications] = useState([
    {
      id: 'APP001',
      item: 'Construction Materials',
      department: 'Civil',
      status: 'Under Review',
      stage: 'HOD Review',
      submittedDate: '2024-01-15',
      progress: 60
    },
    {
      id: 'APP002',
      item: 'Electrical Components',
      department: 'Electrical',
      status: 'Clarification Required',
      stage: 'Dy. HOD Review',
      submittedDate: '2024-01-10',
      progress: 40
    }
  ]);

  const [notifications] = useState([
    {
      id: 1,
      type: 'clarification',
      message: 'Clarification required for Application APP002',
      date: '2024-01-20',
      read: false
    },
    {
      id: 2,
      type: 'status',
      message: 'Application APP001 moved to HOD Review stage',
      date: '2024-01-18',
      read: true
    }
  ]);

  const getStatusBadge = (status) => {
    const colors = {
      'Under Review': 'bg-blue-100 text-blue-800',
      'Clarification Required': 'bg-yellow-100 text-yellow-800',
      'Approved': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleNewApplication = () => {
    setActiveTab('new-application');
  };


  console.log(user);
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">DMRC Vendor Portal</h1>
                <p className="text-sm text-gray-600">Welcome, {user.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-blue-600 border-blue-600">
                ID: {user.uniqueId || 'VND123456'}
              </Badge>
              <Button variant="outline" onClick={onLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="new-application">New Application</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Applications</p>
                      <p className="text-2xl font-bold text-gray-900">2</p>
                    </div>
                    <FileText className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Under Review</p>
                      <p className="text-2xl font-bold text-blue-600">1</p>
                    </div>
                    <Clock className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Approved</p>
                      <p className="text-2xl font-bold text-green-600">0</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Action Required</p>
                      <p className="text-2xl font-bold text-yellow-600">1</p>
                    </div>
                    <Bell className="w-8 h-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Applications */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {applications.map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold">{app.item}</h3>
                          <Badge className={getStatusBadge(app.status)}>
                            {app.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Department: {app.department} | Stage: {app.stage}
                        </p>
                        <Progress value={app.progress} className="w-full h-2" />
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Submitted</p>
                        <p className="text-sm font-medium">{app.submittedDate}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <Alert key={notification.id} className={!notification.read ? 'border-blue-200 bg-blue-50' : ''}>
                      <Bell className="w-4 h-4" />
                      <AlertDescription>
                        <div className="flex justify-between">
                          <span>{notification.message}</span>
                          <span className="text-sm text-gray-500">{notification.date}</span>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>My Applications</CardTitle>
                <Button onClick={handleNewApplication}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Application
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {applications.map((app) => (
                    <div key={app.id} className="border rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">{app.item}</h3>
                          <p className="text-gray-600">Application ID: {app.id}</p>
                        </div>
                        <Badge className={getStatusBadge(app.status)}>
                          {app.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Department</p>
                          <p className="font-medium">{app.department}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Current Stage</p>
                          <p className="font-medium">{app.stage}</p>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{app.progress}%</span>
                        </div>
                        <Progress value={app.progress} className="h-2" />
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                        {app.status === 'Clarification Required' && (
                          <Button size="sm">
                            Respond to Clarification
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="new-application">
            <ApplicationForm />
          </TabsContent>

          <TabsContent value="documents">
            <DocumentUpload />
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Vendor Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Image + Name */}
                <div className="flex items-center gap-6">
                  <img
                    src={user.image || demo_profile_image} 
                    alt="Vendor Logo"
                    className="w-24 h-24 rounded-full border shadow object-cover"
                  />
                  <div>
                    <p className="text-2xl font-semibold">{user.name}</p>
                    <p className="text-muted-foreground text-sm">{user.email}</p>
                  </div>
                </div>
                <Separator />
                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Company Name</label>
                    <p className="text-lg font-semibold">{user.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Unique ID</label>
                    <p className="text-lg font-semibold">{user.uniqueId || "VND123456"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p>{user.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Registration Date</label>
                    <p>January 1, 2024</p>
                  </div>
                </div>

                <Separator />

                {/* PAN & GSTIN Section */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium flex items-center gap-1 text-muted-foreground">
                      PAN
                      <Badge variant="outline" className="text-xs flex items-center gap-1">
                        <Lock size={12} /> Locked
                      </Badge>
                    </label>
                    <p>{user.pan || "ABCDE1234F"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium flex items-center gap-1 text-muted-foreground">
                      GSTIN
                      <Badge variant="outline" className="text-xs flex items-center gap-1">
                        <Lock size={12} /> Locked
                      </Badge>
                    </label>
                    <p>{user.gstin || "22AAAAA0000A1Z5"}</p>
                  </div>
                </div>

                <Alert>
                  <AlertDescription>
                    <span className="font-medium">Note:</span> PAN and GSTIN are critical identifiers and cannot be modified after registration. Please contact <span className="font-semibold">DMRC Support</span> for any corrections.
                  </AlertDescription>
                </Alert>

              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
};

export default VendorDashboard;
