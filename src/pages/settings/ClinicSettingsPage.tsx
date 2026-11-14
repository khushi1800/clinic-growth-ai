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
  Calendar,
  Sparkles,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useMockData } from '@/hooks/useMockData';

interface DaySchedule {
  open: string;
  close: string;
  isOpen: boolean;
}

const DEFAULT_HOURS: Record<string, DaySchedule> = {
  monday: { open: '09:00', close: '20:00', isOpen: true },
  tuesday: { open: '09:00', close: '20:00', isOpen: true },
  wednesday: { open: '09:00', close: '20:00', isOpen: true },
  thursday: { open: '09:00', close: '20:00', isOpen: true },
  friday: { open: '09:00', close: '20:00', isOpen: true },
  saturday: { open: '09:30', close: '19:00', isOpen: true },
  sunday: { open: '10:00', close: '14:00', isOpen: true },
};

const TIME_OPTIONS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
  '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00',
];

export const ClinicSettingsPage: React.FC = () => {
  const { clinic, setClinic, updateBusinessHours, branches } = useMockData();

  const [form, setForm] = useState({
    name: clinic.name,
    phone: clinic.phone || '',
    email: clinic.email || '',
    website: clinic.website || '',
    address: clinic.address || '',
    city: clinic.city || '',
    state: clinic.state || '',
  });

  const [profileSuccess, setProfileSuccess] = useState(false);
  const [hoursSuccess, setHoursSuccess] = useState(false);

  // Initialize hours from clinic or default
  const [hours, setHours] = useState<Record<string, DaySchedule>>(() => {
    if (clinic.business_hours && typeof clinic.business_hours === 'object') {
      const merged: Record<string, DaySchedule> = {};
      Object.keys(DEFAULT_HOURS).forEach(day => {
        const val = (clinic.business_hours as any)[day];
        if (val && typeof val === 'object') {
          merged[day] = {
            open: val.open || '09:00',
            close: val.close || '20:00',
            isOpen: val.isOpen !== false,
          };
        } else {
          merged[day] = DEFAULT_HOURS[day];
        }
      });
      return merged;
    }
    return DEFAULT_HOURS;
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setClinic({ ...clinic, ...form });
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 2500);
  };

  const handleDayToggle = (dayKey: string) => {
    setHours(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        isOpen: !prev[dayKey].isOpen,
      },
    }));
  };

  const handleTimeChange = (dayKey: string, field: 'open' | 'close', value: string) => {
    setHours(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        [field]: value,
      },
    }));
  };

  const handleSaveHours = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusinessHours(hours);
    setHoursSuccess(true);
    setTimeout(() => setHoursSuccess(false), 2500);
  };

  const applyPresetWeekdays = () => {
    setHours(prev => ({
      ...prev,
      monday: { open: '09:00', close: '20:00', isOpen: true },
      tuesday: { open: '09:00', close: '20:00', isOpen: true },
      wednesday: { open: '09:00', close: '20:00', isOpen: true },
      thursday: { open: '09:00', close: '20:00', isOpen: true },
      friday: { open: '09:00', close: '20:00', isOpen: true },
      saturday: { open: '09:30', close: '19:00', isOpen: true },
    }));
  };

  const daysList: { key: string; label: string }[] = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
  ];

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
            These settings feed directly into the AI receptionist's clinic context and appointment scheduling constraints
          </p>
        </div>

        <div className="flex items-center gap-2">
          {profileSuccess && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Profile saved!</span>
            </div>
          )}
          {hoursSuccess && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Operating hours saved!</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Profile form (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <form onSubmit={handleSaveProfile}>
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

        {/* Operating hours editor (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-600" />
                  Weekly Operating Hours
                </CardTitle>
                <p className="text-xs text-slate-500 mt-1">
                  Configure opening and closing times. The AI uses these to enforce appointment slots.
                </p>
              </div>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSaveHours} className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-700">Days & Time Slots</span>
                  <button
                    type="button"
                    onClick={applyPresetWeekdays}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Set Weekdays 09:00 - 20:00
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {daysList.map(({ key, label }) => {
                    const day = hours[key] || DEFAULT_HOURS[key];
                    const isSunday = key === 'sunday';

                    return (
                      <div key={key} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        {/* Day & Toggle */}
                        <div className="flex items-center gap-2 min-w-[120px]">
                          <input
                            type="checkbox"
                            id={`toggle-${key}`}
                            checked={day.isOpen}
                            onChange={() => handleDayToggle(key)}
                            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                          />
                          <label
                            htmlFor={`toggle-${key}`}
                            className={`text-xs font-semibold cursor-pointer ${
                              day.isOpen ? 'text-slate-900' : 'text-slate-400 line-through'
                            }`}
                          >
                            {label}
                          </label>
                        </div>

                        {/* Hours selector or Closed badge */}
                        <div className="flex items-center gap-2">
                          {day.isOpen ? (
                            <>
                              <select
                                value={day.open}
                                onChange={e => handleTimeChange(key, 'open', e.target.value)}
                                className="text-xs px-2 py-1 rounded border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              >
                                {TIME_OPTIONS.map(time => (
                                  <option key={time} value={time}>
                                    {time}
                                  </option>
                                ))}
                              </select>
                              <span className="text-xs text-slate-400 font-medium">to</span>
                              <select
                                value={day.close}
                                onChange={e => handleTimeChange(key, 'close', e.target.value)}
                                className="text-xs px-2 py-1 rounded border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              >
                                {TIME_OPTIONS.map(time => (
                                  <option key={time} value={time}>
                                    {time}
                                  </option>
                                ))}
                              </select>
                              {isSunday && (
                                <Badge variant="warning" size="sm" className="text-[10px] hidden sm:inline-block">
                                  Emergency
                                </Badge>
                              )}
                            </>
                          ) : (
                            <Badge variant="gray" size="sm" className="text-[10px]">
                              Closed / Holiday
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <Button type="submit" variant="primary" size="md" leftIcon={<Save className="w-4 h-4" />}>
                    Save Operating Hours
                  </Button>
                  <p className="text-[11px] text-slate-400">
                    Auto-syncs with AI receptionist
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
