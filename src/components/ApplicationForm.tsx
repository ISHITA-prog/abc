// src/components/ApplicationForm.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios, { AxiosError } from 'axios'; // Import AxiosError
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from './ui/use-toast';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useAuth } from '../App';
import { Loader2 } from 'lucide-react';

// Define a base schema for common application fields
const baseFormSchema = z.object({
  projectName: z.string().min(5, { message: 'Project Name is required and must be at least 5 characters.' }),
  companyExperience: z.string().min(10, { message: 'Company Experience is required.' }),
  // Add other common fields
});

// Define schemas for specific departments (example)
const civilFormSchema = baseFormSchema.extend({
  civilSpecificField1: z.string().min(3, { message: 'Civil specific field 1 is required.' }),
  civilSpecificField2: z.number().min(1).optional(),
});

const electricalFormSchema = baseFormSchema.extend({
  electricalSpecificField1: z.string().min(3, { message: 'Electrical specific field 1 is required.' }),
  electricalSpecificField2: z.boolean().optional(),
});

const mechanicalFormSchema = baseFormSchema.extend({
  mechanicalSpecificField1: z.string().min(3, { message: 'Mechanical specific field 1 is required.' }),
  mechanicalSpecificField2: z.string().optional(),
});

// Helper type to infer schema type dynamically
type FormSchemaType = z.infer<typeof civilFormSchema | typeof electricalFormSchema | typeof mechanicalFormSchema>;

interface ApplicationFormProps {
  API_BASE_URL: string;
}

const ApplicationForm: React.FC<ApplicationFormProps> = ({ API_BASE_URL }) => {
  const { department } = useParams<{ department: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { token } = useAuth();
  const [files, setFiles] = useState<FileList | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Determine which schema to use based on department
  let currentSchema: z.ZodObject<any, any, any> = baseFormSchema;
  let departmentName = '';

  switch (department) {
    case 'civil':
      currentSchema = civilFormSchema;
      departmentName = 'Civil Department';
      break;
    case 'electrical':
      currentSchema = electricalFormSchema;
      departmentName = 'Electrical Department';
      break;
    case 'mechanical':
      currentSchema = mechanicalFormSchema;
      departmentName = 'Mechanical Department';
      break;
    default:
      // Handle unknown department or redirect
      toast({
        title: 'Invalid Department',
        description: 'The selected department is not recognized.',
        variant: 'destructive',
      });
      navigate('/dashboard');
      return null;
  }

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(currentSchema),
    defaultValues: {
      projectName: '',
      companyExperience: '',
      // Initialize specific fields based on department
      ...(department === 'civil' && { civilSpecificField1: '', civilSpecificField2: undefined }),
      ...(department === 'electrical' && { electricalSpecificField1: '', electricalSpecificField2: undefined }),
      ...(department === 'mechanical' && { mechanicalSpecificField1: '', mechanicalSpecificField2: '' }),
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(event.target.files);
    }
  };

  const onSubmit = async (values: FormSchemaType) => {
    if (!files || files.length === 0) {
      toast({
        title: 'Document Required',
        description: 'Please upload at least one mandatory document.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('department', department || '');
    formData.append('formData', JSON.stringify(values)); // Convert form data to JSON string

    for (let i = 0; i < files.length; i++) {
      formData.append('documents', files[i]);
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/applications/submit`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Important for file uploads
          Authorization: `Bearer ${token}`,
        },
      });
      toast({
        title: 'Application Submitted!',
        description: response.data.message,
      });
      navigate('/dashboard');
    } catch (error: unknown) { // Changed from error: any to error: unknown
      if (axios.isAxiosError(error)) { // Type guard for AxiosError
        console.error('Application submission failed:', error);
        toast({
          title: 'Submission Failed',
          description: error.response?.data?.message || 'An unexpected error occurred during submission.',
          variant: 'destructive',
        });
      } else if (error instanceof Error) { // Handle generic JavaScript errors
        console.error('An unexpected error occurred:', error);
        toast({
          title: 'Submission Failed',
          description: error.message || 'An unexpected error occurred during submission.',
          variant: 'destructive',
        });
      } else { // Fallback for truly unknown error types
        console.error('An unknown error occurred:', error);
        toast({
          title: 'Submission Failed',
          description: 'An unknown error occurred during submission.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-10 p-8 bg-white rounded-lg shadow-xl border border-gray-200">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
        Application Form for {departmentName}
      </h2>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Common Fields */}
        <div>
          <Label htmlFor="projectName">Project Name</Label>
          <Input id="projectName" type="text" {...form.register('projectName')} />
          {form.formState.errors.projectName && (
            <p className="text-red-500 text-sm mt-1">{form.formState.errors.projectName.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="companyExperience">Company Experience (e.g., "5 years in construction")</Label>
          <Input id="companyExperience" type="text" {...form.register('companyExperience')} />
          {form.formState.errors.companyExperience && (
            <p className="text-red-500 text-sm mt-1">{form.formState.errors.companyExperience.message}</p>
          )}
        </div>

        {/* Department-Specific Fields */}
        {department === 'civil' && (
          <>
            <h3 className="text-xl font-semibold mt-6 mb-4 text-gray-700">Civil Department Specifics</h3>
            <div>
              <Label htmlFor="civilSpecificField1">Civil Field 1 (e.g., Type of Construction)</Label>
              <Input id="civilSpecificField1" type="text" {...form.register('civilSpecificField1')} />
              {form.formState.errors.civilSpecificField1 && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.civilSpecificField1.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="civilSpecificField2">Civil Field 2 (e.g., Number of Engineers)</Label>
              <Input id="civilSpecificField2" type="number" {...form.register('civilSpecificField2', { valueAsNumber: true })} />
              {form.formState.errors.civilSpecificField2 && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.civilSpecificField2.message}</p>
              )}
            </div>
          </>
        )}

        {department === 'electrical' && (
          <>
            <h3 className="text-xl font-semibold mt-6 mb-4 text-gray-700">Electrical Department Specifics</h3>
            <div>
              <Label htmlFor="electricalSpecificField1">Electrical Field 1 (e.g., Power Capacity Handled)</Label>
              <Input id="electricalSpecificField1" type="text" {...form.register('electricalSpecificField1')} />
              {form.formState.errors.electricalSpecificField1 && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.electricalSpecificField1.message}</p>
              )}
            </div>
            {/* Example of a checkbox field */}
            <div className="flex items-center space-x-2">
              <input
                id="electricalSpecificField2"
                type="checkbox"
                {...form.register('electricalSpecificField2')}
                className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out rounded border-gray-300 focus:ring-blue-500"
              />
              <Label htmlFor="electricalSpecificField2">Certified for High Voltage?</Label>
            </div>
          </>
        )}

        {department === 'mechanical' && (
          <>
            <h3 className="text-xl font-semibold mt-6 mb-4 text-gray-700">Mechanical Department Specifics</h3>
            <div>
              <Label htmlFor="mechanicalSpecificField1">Mechanical Field 1 (e.g., Type of Machinery)</Label>
              <Input id="mechanicalSpecificField1" type="text" {...form.register('mechanicalSpecificField1')} />
              {form.formState.errors.mechanicalSpecificField1 && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.mechanicalSpecificField1.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="mechanicalSpecificField2">Mechanical Field 2 (e.g., Fabrication Capabilities)</Label>
              <Input id="mechanicalSpecificField2" type="text" {...form.register('mechanicalSpecificField2')} />
              {form.formState.errors.mechanicalSpecificField2 && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.mechanicalSpecificField2.message}</p>
              )}
            </div>
          </>
        )}

        {/* Document Upload */}
        <div className="mt-6 border-t pt-6">
          <Label htmlFor="documents" className="text-lg font-semibold mb-2 block">Mandatory Documents (PDF Preferred)</Label>
          <Input
            id="documents"
            type="file"
            multiple
            accept=".pdf, .doc, .docx, image/*" // Accept common document and image types
            onChange={handleFileChange}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="text-sm text-gray-500 mt-2">Upload supporting documents (e.g., company certificates, past project reports).</p>
        </div>

        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md py-2 text-lg font-semibold transition-colors duration-200" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Application'
          )}
        </Button>
      </form>
    </div>
  );
};

export default ApplicationForm;
