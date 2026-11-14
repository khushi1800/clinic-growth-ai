import React, { useState } from 'react';
import {
  Building,
  Clock,
  MapPin,
  Phone,
  Mail,
  Globe,
  Save,
  Plus,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useMockData } from '@/hooks/useMockData';

export const ClinicSettingsPage: React.FC = () => {
  const { clinic, setClinic, branches } = useMockData();
  const [form, setForm] = useState({
    name: clinic.name,
    phone: clinic.phone || '',
    email: clinic.email || '',
    website: clinic.website || '',
    address: clinic.address || '',
    city: clinic.city || '',
    state: clinic.state || '',
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setClinic({ ...clinic, ...form });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900">
              Clinic Profile & Operating Hours
            </h1>
            <Badge variant="primary" size="sm">CONFIG</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            These settings feed directly into the AI receptionist's clinic context and appointment constraints
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Settings saved successfully!</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Profile form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSave}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Building className="w-4 h-4 text-blue-600" />
                  Clinic Identity & Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Clinic Display Name *"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Official Phone / WhatsApp Hotline *"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    leftIcon={<Phone className="w-4 h-4" />}
                    required
                  />
                  <Input
                    label="Official Email *"
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    leftIcon={<Mail className="w-4 h-4" />}
                    required
                  />
                </div>

                <Input
                  label="Website URL"
                  value={form.website}
                  onChange={e => setForm({ ...form, website: e.target.value })}
                  leftIcon={<Globe className="w-4 h-4" />}
                />

                <Input
                  label="Address / Landmark *"
                  value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                  leftIcon={<MapPin className="w-4 h-4" />}
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="City *"
                    value={form.city}
                    onChange={e => setForm({ ...form, city: e.target.value })}
                    required
                  />
                  <Input
                    label="State *"
                    value={form.state}
                    onChange={e => setForm({ ...form, state: e.target.value })}
                    required
                  />
                </div>

                <div className="pt-2">
                  <Button type="submit" variant="primary" size="md" leftIcon={<Save className="w-4 h-4" />}>
                    Save Clinic Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>

          {/* Branch management */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-600" />
                Clinic Branches ({branches.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {branches.map(branch => (
                <div
                  key={branch.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{branch.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{branch.address}</p>
                    <p className="text-[11px] text-blue-600 mt-1">{branch.phone}</p>
                  </div>
                  <Badge variant="success" size="sm">ACTIVE</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Operating hours (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-600" />
                Weekly Business Hours
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-slate-500">
                The AI receptionist automatically notifies patients when booking slots outside these hours.
              </p>

              <div className="space-y-2 pt-2 divide-y divide-slate-100 text-xs">
                {daysOfWeek.map(day => {
                  const isSunday = day === 'Sunday';
                  const isSaturday = day === 'Saturday';
                  return (
                    <div key={day} className="pt-2 flex items-center justify-between">
                      <span className="font-semibold text-slate-800">{day}</span>
                      <div className="text-right">
                        <span className="font-medium text-slate-600">
                          {isSunday
                            ? '10:00 AM – 02:00 PM'
                            : isSaturday
                            ? '09:30 AM – 07:00 PM'
                            : '09:00 AM – 08:00 PM'}
                        </span>
                        <Badge
                          variant={isSunday ? 'warning' : 'primary'}
                          size="sm"
                          className="ml-2 text-[10px]"
                        >
                          {isSunday ? 'Emergency & Scheduled' : 'Open'}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
