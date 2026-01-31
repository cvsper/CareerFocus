import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowRight, Lock, Mail, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { useAuth } from '../services/AuthContext';
import { useToast } from '../components/ui/Toast';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      toast.success('Welcome back! Logging you in...');
      // Navigation handled by App.tsx based on user role
      navigate('/');
    } else {
      setError(result.error || 'Login failed');
    }
  };

  const handleDemoLogin = async (type: 'student' | 'admin') => {
    setError('');
    setIsLoading(true);

    const credentials = type === 'admin'
      ? { email: 'admin@careerfocus.org', password: 'admin123' }
      : { email: 'john.smith@email.com', password: 'student123' };

    const result = await login(credentials.email, credentials.password);
    setIsLoading(false);

    if (result.success) {
      toast.success(`Welcome! Logged in as demo ${type}`);
      navigate('/');
    } else {
      setError(`Demo login failed. Please seed the database first. Error: ${result.error}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="mb-8 text-center">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/20">
          <GraduationCap className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">
          WBLE Student Portal
        </h1>
        <p className="text-slate-500 mt-2">
          Work Based Learning Experience Platform
        </p>
      </div>

      <Card className="w-full max-w-md shadow-xl border-slate-200">
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-slate-900">
              Welcome Back
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Please sign in to your account
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4" />}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-4 h-4" />}
            />

            <div className="flex justify-end">
              <button type="button" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Forgot password?
              </button>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500">
                  Demo accounts
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDemoLogin('student')}
                disabled={isLoading}
              >
                Demo Student
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDemoLogin('admin')}
                disabled={isLoading}
              >
                Demo Admin
              </Button>
            </div>

            <p className="text-xs text-center text-slate-400 mt-2">
              Student: john.smith@email.com / student123<br />
              Admin: admin@careerfocus.org / admin123
            </p>
          </div>
        </form>
      </Card>

      <p className="mt-8 text-center text-sm text-slate-400">
        &copy; 2024 Career Focus. All rights reserved.
      </p>
    </div>
  );
}
