// src/components/LoginForm.tsx
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
import { useAuth } from '../App'; // Import useAuth context

// Define validation schema using Zod
const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

interface LoginFormProps {
  API_BASE_URL: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ API_BASE_URL }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth(); // Use the login function from AuthContext

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, values);
      const { token, user } = response.data;

      login(token, user); // Store token and user data in context and local storage

      toast({
        title: 'Login Successful!',
        description: 'You have been logged in.',
      });

      // Redirect based on user role
      if (user.isDmOfficial) {
        navigate('/dm-dashboard');
      } else {
        navigate('/dashboard');
      }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Login failed:', error);
      toast({
        title: 'Login Failed',
        description: error.response?.data?.message || 'An unexpected error occurred. Please check your credentials.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="max-w-md mx-auto my-10 p-8 bg-white rounded-lg shadow-xl border border-gray-200">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Login to Vendor Portal</h2>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...form.register('email')} />
          {form.formState.errors.email && (
            <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" {...form.register('password')} />
          {form.formState.errors.password && (
            <p className="text-red-500 text-sm mt-1">{form.formState.errors.password.message}</p>
          )}
        </div>
        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md py-2 text-lg font-semibold transition-colors duration-200">
          Login
        </Button>
      </form>
    </div>
  );
};

export default LoginForm;
