import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('rohan@smiledentalcare.demo');
  const [password, setPassword] = useState('demo123456');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setIsLoading(true);
    setError('');

    setTimeout(() => {
      setIsLoading(false);
      // If logging in as admin or doctor demo
      if (email.includes('admin')) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }, 600);
  };

  const handleQuickLogin = (role: 'clinic' | 'admin') => {
    if (role === 'clinic') {
      setEmail('rohan@smiledentalcare.demo');
      setPassword('demo123456');
      navigate('/dashboard');
    } else {
      setEmail('admin@clinicgrowth.ai');
      setPassword('admin123456');
      navigate('/admin');
    }
  };

  return (
    <Card className="shadow-xl border-slate-200/90 bg-white rounded-2xl overflow-hidden">
      <CardContent className="p-6 sm:p-8">
        <div className="text-center mb-6">
          <Badge variant="primary" size="sm" className="mb-2">CLINIC ACCESS PORTAL</Badge>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome Back</h2>
          <p className="text-xs text-slate-500 mt-1">
            Sign in to access your clinic appointments, leads, and AI configuration
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="doctor@smiledentalcare.demo"
            leftIcon={<Mail className="w-4 h-4" />}
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full py-2.5 mt-2"
            isLoading={isLoading}
            rightIcon={<LogIn className="w-4 h-4" />}
          >
            Sign In to Dashboard
          </Button>
        </form>

        {/* Quick Demo Login Credentials */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center mb-3">
            Quick 1-Click Demo Login
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuickLogin('clinic')}
              className="text-xs"
            >
              Smile Dental Demo
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuickLogin('admin')}
              className="text-xs text-indigo-700 border-indigo-200 hover:bg-indigo-50"
            >
              Owner Admin Demo
            </Button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-500">
          Don't have a clinic account?{' '}
          <Link to="/signup" className="text-blue-600 hover:text-blue-800 font-bold">
            Register your clinic
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
