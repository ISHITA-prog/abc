// src/components/RegisterForm.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useToast } from './ui/use-toast';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

// Define validation schema using Zod
const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  mobileNumber: z.string().min(10, { message: 'Mobile number must be at least 10 digits.' }).max(15, { message: 'Mobile number must not exceed 15 digits.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  companyName: z.string().min(2, { message: 'Company name must be at least 2 characters.' }),
  companyAddress: z.string().min(5, { message: 'Company address must be at least 5 characters.' }),
  legalStructure: z.string().min(2, { message: 'Legal structure must be at least 2 characters.' }),
  panNumber: z.string().min(10).max(10).optional(), // PAN is often 10 alphanumeric characters
  gstin: z.string().min(15).max(15).optional(), // GSTIN is 15 alphanumeric characters
});

interface RegisterFormProps {
  API_BASE_URL: string;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ API_BASE_URL }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      mobileNumber: '',
      password: '',
      companyName: '',
      companyAddress: '',
      legalStructure: '',
      panNumber: '',
      gstin: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, values);
      toast({
        title: 'Registration Successful!',
        description: response.data.message,});
        
      navigate('/login'); // Redirect to login page after successful registration
    } catch (error: any) {
      console.error('Registration failed:', error);
      toast({
        title: 'Registration Failed',
        description: error.response?.data?.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="max-w-xl mx-auto my-10 p-8 bg-white rounded-lg shadow-xl border border-gray-200">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Vendor Registration</h2>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...form.register('email')} />
          {form.formState.errors.email && (
            <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="mobileNumber">Mobile Number</Label>
          <Input id="mobileNumber" type="text" {...form.register('mobileNumber')} />
          {form.formState.errors.mobileNumber && (
            <p className="text-red-500 text-sm mt-1">{form.formState.errors.mobileNumber.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" {...form.register('password')} />
          {form.formState.errors.password && (
            <p className="text-red-500 text-sm mt-1">{form.formState.errors.password.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="companyName">Company Name</Label>
          <Input id="companyName" type="text" {...form.register('companyName')} />
          {form.formState.errors.companyName && (
            <p className="text-red-500 text-sm mt-1">{form.formState.errors.companyName.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="companyAddress">Company Address</Label>
          <Input id="companyAddress" type="text" {...form.register('companyAddress')} />
          {form.formState.errors.companyAddress && (
            <p className="text-red-500 text-sm mt-1">{form.formState.errors.companyAddress.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="legalStructure">Legal Structure (e.g., LLP, Pvt Ltd)</Label>
          <Input id="legalStructure" type="text" {...form.register('legalStructure')} />
          {form.formState.errors.legalStructure && (
            <p className="text-red-500 text-sm mt-1">{form.formState.errors.legalStructure.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="panNumber">PAN Number (Optional)</Label>
          <Input id="panNumber" type="text" {...form.register('panNumber')} />
          {form.formState.errors.panNumber && (
            <p className="text-red-500 text-sm mt-1">{form.formState.errors.panNumber.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="gstin">GSTIN (Optional)</Label>
          <Input id="gstin" type="text" {...form.register('gstin')} />
          {form.formState.errors.gstin && (
            <p className="text-red-500 text-sm mt-1">{form.formState.errors.gstin.message}</p>
          )}
        </div>
        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md py-2 text-lg font-semibold transition-colors duration-200">
          Register
        </Button>
      </form>
    </div>
  );
};

export default RegisterForm;
