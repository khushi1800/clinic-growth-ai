import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 700);
  };

  return (
    <Card className="shadow-xl border-slate-200/90 bg-white rounded-2xl overflow-hidden">
      <CardContent className="p-6 sm:p-8">
        <div className="text-center mb-6">
          <Badge variant="gray" size="sm" className="mb-2">ACCOUNT RECOVERY</Badge>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Reset Password</h2>
          <p className="text-xs text-slate-500 mt-1">
            Enter your clinic registered email to receive a password reset link
          </p>
        </div>

        {isSubmitted ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Check Your Inbox</h3>
            <p className="text-xs text-slate-600">
              We've sent password reset instructions to <strong>{email}</strong>.
            </p>
            <div className="pt-2">
              <Link to="/login">
                <Button variant="outline" size="sm" className="w-full">
                  Return to Login
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Clinic Email Address"
              type="email"
              placeholder="doctor@smiledentalcare.demo"
              leftIcon={<Mail className="w-4 h-4" />}
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />

            <Button
              type="submit"
              className="w-full py-2.5 mt-2"
              isLoading={isLoading}
            >
              Send Password Reset Link
            </Button>

            <div className="pt-3 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
};
