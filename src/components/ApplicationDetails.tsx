// src/components/ApplicationDetails.tsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../App';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Loader2, Download } from 'lucide-react';
import { format } from 'date-fns';

// Import the Zod schemas from ApplicationForm.tsx
// We define them here again or import them directly if they were exported.
// For simplicity and to avoid circular dependencies in a small example,
// I'll re-define the types based on the Zod schemas here.
// In a larger project, you might have a shared `types.ts` file.

interface BaseFormDataType {
  projectName: string;
  companyExperience: string;
  // Add other common fields if they exist in your baseFormSchema
}

interface CivilFormDataType extends BaseFormDataType {
  civilSpecificField1: string;
  civilSpecificField2?: number; // Optional as per schema
}

interface ElectricalFormDataType extends BaseFormDataType {
  electricalSpecificField1: string;
  electricalSpecificField2?: boolean; // Optional as per schema
}

interface MechanicalFormDataType extends BaseFormDataType {
  mechanicalSpecificField1: string;
  mechanicalSpecificField2?: string; // Optional as per schema
}

// Union type for all possible form data structures
type ApplicationFormData = CivilFormDataType | ElectricalFormDataType | MechanicalFormDataType | BaseFormDataType;


interface ApplicationDetailsProps {
  API_BASE_URL: string;
}

interface ApplicationData {
  id: number;
  user_id: number;
  department: string;
  form_data: ApplicationFormData; // Changed from 'any' to specific union type
  status: 'Pending Verification' | 'Clarification Requested' | 'Approved' | 'Rejected';
  rejection_reason: string | null;
  created_at: string;
  vendor_unique_id: string;
  company_name: string;
  documents: { id: number; fileName: string; fileUrl: string; mimeType: string }[];
}

const ApplicationDetails: React.FC<ApplicationDetailsProps> = ({ API_BASE_URL }) => {
  const { id } = useParams<{ id: string }>();
  const { token, user } = useAuth();
  const [application, setApplication] = useState<ApplicationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplicationDetails = async () => {
      if (!token || !id) {
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(`${API_BASE_URL}/applications/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        // The backend sends form_data as a JSON string, so parse it
        // MySQL JSON column returns a string that needs to be parsed in JS
        const data = {
          ...response.data,
          form_data: typeof response.data.form_data === 'string'
                       ? JSON.parse(response.data.form_data)
                       : response.data.form_data
        };
        setApplication(data);
      } catch (err: any) {
        console.error('Failed to fetch application details:', err);
        setError(err.response?.data?.message || 'Failed to load application details.');
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationDetails();
  }, [API_BASE_URL, token, id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="ml-2 text-gray-700">Loading application details...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 mt-10">Error: {error}</div>;
  }

  if (!application) {
    return <div className="text-center text-gray-600 mt-10">Application not found.</div>;
  }

  // Helper to render form data dynamically
  const renderFormData = (data: ApplicationFormData) => { // Type data as ApplicationFormData
    if (!data) return <p>No additional form data.</p>;
    return (
      <ul className="list-disc list-inside space-y-1">
        {Object.entries(data).map(([key, value]) => (
          <li key={key}>
            <span className="font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span> {String(value)}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-gray-800">Application #{application.id} Details</CardTitle>
          <CardDescription>
            <p>Submitted by: <span className="font-semibold">{application.company_name} ({application.vendor_unique_id})</span></p>
            <p>Department: <span className="font-semibold">{application.department}</span></p>
            <p>Status:
              <span className={`ml-2 px-3 py-1 rounded-full text-sm font-semibold
                ${application.status === 'Approved' ? 'bg-green-100 text-green-800' : ''}
                ${application.status === 'Rejected' ? 'bg-red-100 text-red-800' : ''}
                ${application.status === 'Clarification Requested' ? 'bg-yellow-100 text-yellow-800' : ''}
                ${application.status === 'Pending Verification' ? 'bg-blue-100 text-blue-800' : ''}
              `}>
                {application.status}
              </span>
            </p>
            <p>Submitted On: {format(new Date(application.created_at), 'PPP')}</p>
            {application.rejection_reason && (
              <p className="text-red-600 mt-2">Rejection Reason: <span className="font-medium">{application.rejection_reason}</span></p>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-3 text-gray-700">Form Data</h3>
            {renderFormData(application.form_data)}
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3 text-gray-700">Uploaded Documents</h3>
            {application.documents && application.documents.length > 0 ? (
              <ul className="space-y-2">
                {application.documents.map((doc) => (
                  <li key={doc.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-md border border-gray-200">
                    <span className="font-medium text-gray-700">{doc.fileName}</span>
                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="flex items-center">
                        <Download className="mr-2 h-4 w-4" /> View/Download
                      </Button>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">No documents uploaded for this application.</p>
            )}
          </div>

          <div className="flex justify-end mt-6">
            {user?.isDmOfficial ? (
              <Link to="/dm-dashboard">
                <Button variant="outline" className="mr-2">Back to DMRC Dashboard</Button>
              </Link>
            ) : (
              <Link to="/dashboard">
                <Button variant="outline" className="mr-2">Back to Dashboard</Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApplicationDetails;
