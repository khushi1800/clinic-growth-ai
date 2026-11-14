import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Building, Phone, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    clinicName: '',
    doctorName: '',
    phone: '',
    email: '',
    password: '',
    agreeTerms: true,
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clinicName || !formData.doctorName || !formData.email || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setError('');

    setTimeout(() => {
      setIsLoading(false);
      navigate('/dashboard');
    }, 800);
  };

  return (
    <Card className="shadow-xl border-slate-200/90 bg-white rounded-2xl overflow-hidden">
      <CardContent className="p-6 sm:p-8">
        <div className="text-center mb-6">
          <Badge variant="primary" size="sm" className="mb-2">START 14-DAY CLINIC PILOT</Badge>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Create Clinic Account</h2>
          <p className="text-xs text-slate-500 mt-1">
            Empower your clinic with automated 24/7 AI reception & WhatsApp booking
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
            label="Clinic Name *"
            placeholder="e.g. Ivory Dental Studio"
            leftIcon={<Building className="w-4 h-4" />}
            value={formData.clinicName}
            onChange={e => setFormData({ ...formData, clinicName: e.target.value })}
            required
          />

          <Input
            label="Lead Doctor / Director Name *"
            placeholder="e.g. Dr. Ananya Sharma, MDS"
            leftIcon={<User className="w-4 h-4" />}
            value={formData.doctorName}
            onChange={e => setFormData({ ...formData, doctorName: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Clinic Phone *"
              placeholder="+91 98450..."
              leftIcon={<Phone className="w-4 h-4" />}
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              required
            />
            <Input
              label="Email Address *"
              type="email"
              placeholder="doctor@clinic.com"
              leftIcon={<Mail className="w-4 h-4" />}
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <Input
            label="Password (min 6 chars) *"
            type="password"
            placeholder="••••••••"
            leftIcon={<Lock className="w-4 h-4" />}
            value={formData.password}
            onChange={e => setFormData({ ...formData, password: e.target.value })}
            required
          />

          <div className="flex items-start gap-2 pt-1">
            <input
              type="checkbox"
              id="terms"
              checked={formData.agreeTerms}
              onChange={e => setFormData({ ...formData, agreeTerms: e.target.checked })}
              className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="terms" className="text-[11px] text-slate-500">
              I agree to Clinic Growth AI's Terms of Service, Business Associate Agreement, and Privacy Policy.
            </label>
          </div>

          <Button
            type="submit"
            className="w-full py-2.5 mt-2"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Create Clinic & Launch Setup
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-800 font-bold">
            Sign In here
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
