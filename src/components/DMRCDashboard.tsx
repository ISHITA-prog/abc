
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Building2, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  User, 
  LogOut,
  Users,
  Filter,
  MessageSquare,
  Download
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const DMRCDashboard = ({ user, role, onLogout }) => {
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [applications, setApplications] = useState([
    {
      id: 'APP001',
      vendorName: 'ABC Industries',
      item: 'Construction Materials',
      department: 'Civil',
      status: 'Pending Review',
      stage: 'HOD Review',
      submittedDate: '2024-01-15',
      currentReviewer: 'HOD Civil',
      priority: 'Normal',
      daysInStage: 5
    },
    {
      id: 'APP002',
      vendorName: 'XYZ Electronics',
      item: 'Electrical Components',
      department: 'Electrical',
      status: 'Committee Review',
      stage: 'Dy. HOD Committee',
      submittedDate: '2024-01-10',
      currentReviewer: 'Committee',
      priority: 'High',
      daysInStage: 3
    },
    {
      id: 'APP003',
      vendorName: 'Design Pro',
      item: 'Architectural Services',
      department: 'Architecture',
      status: 'Director Approval',
      stage: 'Final Approval',
      submittedDate: '2024-01-08',
      currentReviewer: 'Director',
      priority: 'High',
      daysInStage: 2
    }
  ]);

  const [selectedApplication, setSelectedApplication] = useState(null);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewAction, setReviewAction] = useState('');

  const getRoleTitle = (role) => {
    const titles = {
      'hod_civil': 'Head of Department - Civil',
      'hod_electrical': 'Head of Department - Electrical', 
      'hod_architecture': 'Head of Department - Architecture',
      'dy_hod': 'Deputy Head of Department',
      'director': 'Director',
      'gm_planning': 'General Manager - Planning'
    };
    return titles[role] || 'DMRC Official';
  };

  const getStatusBadge = (status) => {
    const colors = {
      'Pending Review': 'bg-yellow-100 text-yellow-800',
      'Committee Review': 'bg-blue-100 text-blue-800',
      'Director Approval': 'bg-purple-100 text-purple-800',
      'Approved': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Clarification Required': 'bg-orange-100 text-orange-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      'High': 'bg-red-100 text-red-800',
      'Normal': 'bg-blue-100 text-blue-800',
      'Low': 'bg-gray-100 text-gray-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const canReviewApplication = (app) => {
    const permissions = {
      'hod_civil': app.department === 'Civil' && app.stage === 'HOD Review',
      'hod_electrical': app.department === 'Electrical' && app.stage === 'HOD Review',
      'hod_architecture': app.department === 'Architecture' && app.stage === 'HOD Review',
      'dy_hod': app.stage === 'Dy. HOD Review' || app.stage === 'Dy. HOD Committee',
      'director': app.stage === 'Final Approval',
      'gm_planning': true // Can coordinate all stages
    };
    return permissions[role] || false;
  };

  const handleReviewSubmit = (action) => {
    if (!reviewComment.trim()) {
      toast({
        title: "Comment Required",
        description: "Please add a comment before submitting your review.",
        variant: "destructive"
      });
      return;
    }

    const updatedApplications = applications.map(app => {
      if (app.id === selectedApplication.id) {
        let newStage = app.stage;
        let newStatus = app.status;

        // Update status based on action and role
        if (action === 'approve') {
          if (role === 'director') {
            newStatus = 'Approved';
            newStage = 'Completed';
          } else if (role.includes('hod')) {
            newStage = 'Dy. HOD Review';
            newStatus = 'Committee Review';
          } else if (role === 'dy_hod') {
            newStage = 'Final Approval';
            newStatus = 'Director Approval';
          }
        } else if (action === 'reject') {
          newStatus = 'Rejected';
          newStage = 'Completed';
        } else if (action === 'clarification') {
          newStatus = 'Clarification Required';
          newStage = 'Vendor Response Required';
        }

        return {
          ...app,
          status: newStatus,
          stage: newStage,
          daysInStage: 0
        };
      }
      return app;
    });

    setApplications(updatedApplications);
    setSelectedApplication(null);
    setReviewComment('');
    
    toast({
      title: "Review Submitted",
      description: `Application ${selectedApplication.id} has been ${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'sent for clarification'}.`
    });
  };

  const filteredApplications = selectedDepartment === 'all' 
    ? applications 
    : applications.filter(app => app.department.toLowerCase() === selectedDepartment);

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
                <h1 className="text-xl font-bold text-gray-900">DMRC Official Portal</h1>
                <p className="text-sm text-gray-600">{getRoleTitle(role)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-blue-600 border-blue-600">
                {user.name}
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
        {/* Department Filter */}
        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Department Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="civil">Civil</SelectItem>
                    <SelectItem value="electrical">Electrical</SelectItem>
                    <SelectItem value="architecture">Architecture</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex space-x-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{filteredApplications.length}</p>
                    <p className="text-sm text-gray-600">Total Applications</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-600">
                      {filteredApplications.filter(app => canReviewApplication(app)).length}
                    </p>
                    <p className="text-sm text-gray-600">Pending Review</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {filteredApplications.filter(app => app.status === 'Approved').length}
                    </p>
                    <p className="text-sm text-gray-600">Approved</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="applications" className="space-y-6">
          <TabsList>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="vendor-management">Vendor Management</TabsTrigger>
          </TabsList>

          <TabsContent value="applications">
            <Card>
              <CardHeader>
                <CardTitle>Application Review Queue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredApplications.map((app) => (
                    <div key={app.id} className="border rounded-lg p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold">{app.item}</h3>
                            <Badge className={getStatusBadge(app.status)}>
                              {app.status}
                            </Badge>
                            <Badge className={getPriorityBadge(app.priority)}>
                              {app.priority}
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-2">Vendor: {app.vendorName} | ID: {app.id}</p>
                          <p className="text-sm text-gray-500">
                            Current Stage: {app.stage} | Days in stage: {app.daysInStage}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Submitted</p>
                          <p className="text-sm font-medium">{app.submittedDate}</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                          <Button variant="outline" size="sm">
                            <FileText className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                        
                        {canReviewApplication(app) && (
                          <Button 
                            onClick={() => setSelectedApplication(app)}
                            size="sm"
                          >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Review Application
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Reports & Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center">
                        <h3 className="text-lg font-semibold mb-2">Applications This Month</h3>
                        <p className="text-3xl font-bold text-blue-600">24</p>
                        <p className="text-sm text-gray-500">+12% from last month</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center">
                        <h3 className="text-lg font-semibold mb-2">Average Processing Time</h3>
                        <p className="text-3xl font-bold text-green-600">12 days</p>
                        <p className="text-sm text-gray-500">-3 days from last month</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center">
                        <h3 className="text-lg font-semibold mb-2">Approval Rate</h3>
                        <p className="text-3xl font-bold text-purple-600">78%</p>
                        <p className="text-sm text-gray-500">+5% from last month</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vendor-management">
            <Card>
              <CardHeader>
                <CardTitle>Vendor Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Alert>
                  <AlertDescription>
                    Vendor blacklisting and management features available. 
                    Configure cooling periods and manage approved vendor lists.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Review Modal */}
        {selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Review Application {selectedApplication.id}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Vendor</p>
                    <p className="font-medium">{selectedApplication.vendorName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Item</p>
                    <p className="font-medium">{selectedApplication.item}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Review Comments</label>
                  <Textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Enter your review comments..."
                    className="min-h-[100px]"
                  />
                </div>
                
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setSelectedApplication(null)}>
                    Cancel
                  </Button>
                  <div className="space-x-2">
                    {role === 'director' ? (
                      <>
                        <Button 
                          variant="destructive" 
                          onClick={() => handleReviewSubmit('reject')}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                        <Button onClick={() => handleReviewSubmit('approve')}>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          variant="outline" 
                          onClick={() => handleReviewSubmit('clarification')}
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Seek Clarification
                        </Button>
                        <Button 
                          variant="destructive" 
                          onClick={() => handleReviewSubmit('reject')}
                        >
                          Not Recommended
                        </Button>
                        <Button onClick={() => handleReviewSubmit('approve')}>
                          Recommend
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default DMRCDashboard;
