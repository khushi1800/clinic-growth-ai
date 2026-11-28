import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Building, Phone, ArrowRight } from 'lucide-react';
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

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const updateField = (field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.clinicName.trim()) {
      errs.clinicName = 'Clinic name is required';
    } else if (formData.clinicName.trim().length < 2) {
      errs.clinicName = 'Clinic name must be at least 2 characters';
    }

    if (!formData.doctorName.trim()) {
      errs.doctorName = 'Doctor name is required';
    }

    if (!formData.phone.trim()) {
      errs.phone = 'Mobile number is required';
    } else {
      const cleanPhone = formData.phone
        .replace(/\D/g, '')
        .replace(/^91(?=\d{10}$)/, '')
        .replace(/^0(?=\d{10}$)/, '');
      if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
        errs.phone = 'Please enter a valid 10-digit Indian mobile number';
      }
    }

    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    if (!formData.agreeTerms) {
      errs.agreeTerms = 'You must agree to the Terms of Service';
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);

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

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            label="Clinic Name *"
            placeholder="e.g. Ivory Dental Studio"
            leftIcon={<Building className="w-4 h-4" />}
            value={formData.clinicName}
            onChange={e => updateField('clinicName', e.target.value)}
            error={formErrors.clinicName}
            required
          />

          <Input
            label="Lead Doctor / Director Name *"
            placeholder="e.g. Dr. Ananya Sharma, MDS"
            leftIcon={<User className="w-4 h-4" />}
            value={formData.doctorName}
            onChange={e => updateField('doctorName', e.target.value)}
            error={formErrors.doctorName}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Clinic Phone *"
              placeholder="e.g. 9845012345"
              leftIcon={<Phone className="w-4 h-4" />}
              value={formData.phone}
              onChange={e => updateField('phone', e.target.value)}
              error={formErrors.phone}
              helperText="10-digit Indian mobile number"
              required
            />
            <Input
              label="Email Address *"
              type="email"
              placeholder="doctor@clinic.com"
              leftIcon={<Mail className="w-4 h-4" />}
              value={formData.email}
              onChange={e => updateField('email', e.target.value)}
              error={formErrors.email}
              required
            />
          </div>

          <Input
            label="Password (min 6 chars) *"
            type="password"
            placeholder="••••••••"
            leftIcon={<Lock className="w-4 h-4" />}
            value={formData.password}
            onChange={e => updateField('password', e.target.value)}
            error={formErrors.password}
            required
          />

          <div className="flex flex-col gap-1 pt-1">
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                checked={formData.agreeTerms}
                onChange={e => updateField('agreeTerms', e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="terms" className="text-[11px] text-slate-500">
                I agree to Clinic Growth AI's Terms of Service, Business Associate Agreement, and Privacy Policy.
              </label>
            </div>
            {formErrors.agreeTerms && (
              <p className="text-[11px] text-red-600">{formErrors.agreeTerms}</p>
            )}
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
