
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoginForm from '@/components/LoginForm';
import VendorDashboard from '@/components/VendorDashboard';
import DMRCDashboard from '@/components/DmDashboard';
import { Building2, Shield, FileText, Users, CheckCircle, Clock } from 'lucide-react';

const Index = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);

  const handleLogin = (user, role) => {
    setCurrentUser(user);
    setUserRole(role);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUserRole(null);
  };

  if (currentUser) {
    return userRole === 'vendor' ? (
      <VendorDashboard user={currentUser} onLogout={handleLogout} />
    ) : (
      <DMRCDashboard user={currentUser} role={userRole} onLogout={handleLogout} />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-blue-600">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">DMRC</h1>
                <p className="text-blue-600 font-semibold">Delhi Metro Rail Corporation</p>
              </div>
            </div>
            <Badge variant="outline" className="text-blue-600 border-blue-600 px-4 py-2">
              Vendor Empanelment Portal
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Vendor Empanelment Portal
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Streamlined online portal for vendor registration, application submission, 
            and empanelment process management for DMRC projects across Civil, 
            Electrical, and Architectural departments.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md">
              <FileText className="w-12 h-12 text-blue-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Application Submission</h3>
              <p className="text-sm text-gray-600 text-center">Submit and track empanelment applications online</p>
            </div>
            <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md">
              <Shield className="w-12 h-12 text-green-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Secure Process</h3>
              <p className="text-sm text-gray-600 text-center">Two-factor authentication and secure document handling</p>
            </div>
            <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md">
              <Users className="w-12 h-12 text-purple-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Multi-Role Access</h3>
              <p className="text-sm text-gray-600 text-center">Role-based access for vendors and DMRC officials</p>
            </div>
            <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md">
              <Clock className="w-12 h-12 text-orange-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Real-time Tracking</h3>
              <p className="text-sm text-gray-600 text-center">Monitor application status and workflow progress</p>
            </div>
          </div>
        </div>

        {/* Login Section */}
        <div className="max-w-md mx-auto">
          <LoginForm onLogin={handleLogin} />
        </div>

        {/* Process Overview */}
        <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Empanelment Process Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Registration</h4>
              <p className="text-sm text-gray-600">Create vendor account with business details</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">2</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Application</h4>
              <p className="text-sm text-gray-600">Submit empanelment application with documents</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">3</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Review</h4>
              <p className="text-sm text-gray-600">Multi-level verification and approval process</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Approval</h4>
              <p className="text-sm text-gray-600">Final approval and vendor empanelment</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2">© 2024 Delhi Metro Rail Corporation Ltd. All rights reserved.</p>
          <p className="text-gray-400">Vendor Empanelment Portal - Secure & Efficient</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
