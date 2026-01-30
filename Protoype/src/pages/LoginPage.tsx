import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowRight, Lock, Mail } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
interface LoginPageProps {
  onLogin: (type: 'student' | 'admin') => void;
}
export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const handleLogin = (type: 'student' | 'admin') => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onLogin(type);
      navigate(type === 'student' ? '/dashboard' : '/admin');
    }, 800);
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
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-slate-900">
              Welcome Back
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Please sign in to your account
            </p>
          </div>

          <div className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@student.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4" />} />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-4 h-4" />} />

            <div className="flex justify-end">
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Forgot password?
              </button>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <Button
              className="w-full"
              size="lg"
              onClick={() => handleLogin('student')}
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}>

              Sign In as Student
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500">
                  Or for demo purposes
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleLogin('admin')}
              disabled={isLoading}>

              Sign In as Administrator
            </Button>
          </div>
        </div>
      </Card>

      <p className="mt-8 text-center text-sm text-slate-400">
        &copy; 2024 WBLE Portal. All rights reserved.
      </p>
    </div>);

}