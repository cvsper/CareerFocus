import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/services/AuthContext';
import { useToast } from '@/components/ui/Toast';

const DEMO_ACCOUNTS = [
  { label: 'WBLE', email: 'john.smith@email.com', password: 'student123' },
  { label: 'Contractor', email: 'maria.garcia@email.com', password: 'contractor123' },
  { label: 'Employee', email: 'sarah.chen@careerfocus.org', password: 'employee123' },
  { label: 'TTW', email: 'david.martinez@email.com', password: 'ttw123' },
  { label: 'Admin', email: 'admin@careerfocus.org', password: 'admin123' },
];

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
      navigate('/');
    } else {
      setError(result.error || 'Login failed');
    }
  };

  const handleDemoLogin = async (account: typeof DEMO_ACCOUNTS[0]) => {
    setError('');
    setIsLoading(true);

    const result = await login(account.email, account.password);
    setIsLoading(false);

    if (result.success) {
      toast.success(`Welcome! Logged in as demo ${account.label}`);
      navigate('/');
    } else {
      setError(`Demo login failed. Please seed the database first. Error: ${result.error}`);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="mb-8 text-center relative animate-fade-in">
        <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20 animate-pulse-glow">
          <GraduationCap className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold text-gradient">
          Career Focus Portal
        </h1>
        <p className="text-muted-foreground mt-2">
          Workforce Development Platform
        </p>
      </div>

      <Card className="w-full max-w-md shadow-xl glass-card relative animate-fade-in-up">
        <CardHeader className="text-center">
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription>Please sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="flex justify-end">
                <button type="button" className="text-sm text-primary hover:text-primary/80 font-medium">
                  Forgot password?
                </button>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <Button
                type="submit"
                variant="gradient"
                className="w-full"
                size="lg"
                isLoading={isLoading}
              >
                Sign In
                {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Demo accounts
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {DEMO_ACCOUNTS.slice(0, 3).map((account) => (
                  <Button
                    key={account.label}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleDemoLogin(account)}
                    disabled={isLoading}
                    className="text-xs"
                  >
                    {account.label}
                  </Button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {DEMO_ACCOUNTS.slice(3).map((account) => (
                  <Button
                    key={account.label}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleDemoLogin(account)}
                    disabled={isLoading}
                    className="text-xs"
                  >
                    {account.label}
                  </Button>
                ))}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <p className="mt-8 text-center text-sm text-muted-foreground relative animate-fade-in animate-delay-300">
        &copy; 2026 Career Focus. All rights reserved.
      </p>
    </div>
  );
}
