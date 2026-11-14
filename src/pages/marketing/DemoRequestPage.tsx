import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  Building,
  User,
  Phone,
  Mail,
  MapPin,
  Stethoscope,
  Laptop,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export const DemoRequestPage: React.FC = () => {
  const [formData, setFormData] = useState({
    clinicName: '',
    contactPerson: '',
    phone: '',
    email: '',
    city: 'Bengaluru',
    doctorCount: '1-3 Doctors',
    currentSoftware: 'Practo',
    preferredTime: 'Morning (10 AM - 1 PM)',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.clinicName.trim()) newErrors.clinicName = 'Clinic name is required';
    if (!formData.contactPerson.trim()) newErrors.contactPerson = 'Contact doctor/person name is required';
    if (!formData.phone.trim()) {
      newErrors.phone = 'Mobile number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone.replace(/[\s\-\+91]/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit Indian mobile number';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1000);
  };

  return (
    <div className="py-12 md:py-20 bg-slate-50 min-h-[calc(100vh-140px)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Context & Proof */}
          <div className="lg:col-span-5 space-y-6">
            <Badge variant="primary" size="md">15-MINUTE PERSONALIZED DEMO</Badge>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              See the AI receptionist live for your clinic
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Experience how Maya answers patients on WhatsApp, assesses pain symptoms, schedules into open doctor slots, and confirms with zero double-bookings.
            </p>

            <div className="space-y-4 pt-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-700 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Custom Treatment Calibration</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    We simulate your actual clinic pricing, doctor schedules, and cancellation policies.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-teal-100 text-teal-700 shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Live WhatsApp Chat Test</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    We will send a live test message to your personal WhatsApp during the call so you experience the patient flow.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Zero Pressure Guarantee</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    No aggressive sales pitches. If our solution does not fit your clinic's volume, we tell you openly.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <p className="text-xs text-slate-600 italic">
                "Seeing Maya reply in natural dental language in 2 seconds on WhatsApp convinced us immediately. Our front desk staff was thrilled."
              </p>
              <p className="text-[11px] font-bold text-slate-900 mt-2">
                — Dr. Rohan Sharma, Smile Dental Clinic
              </p>
            </div>
          </div>

          {/* Right Column: Form or Success */}
          <div className="lg:col-span-7">
            <Card className="border border-slate-200/90 shadow-xl bg-white rounded-2xl overflow-hidden">
              <CardContent className="p-6 sm:p-8">
                {isSubmitted ? (
                  <div className="text-center py-10 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <Badge variant="success" size="md">DEMO RESERVED</Badge>
                    <h3 className="text-2xl font-bold text-slate-900">
                      Thank You, Dr. {formData.contactPerson || 'Doctor'}!
                    </h3>
                    <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                      We have received your demo request for <strong>{formData.clinicName}</strong>. Our clinical specialist will message you on WhatsApp at <strong>{formData.phone}</strong> within 2 hours to confirm your video call link.
                    </p>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs text-left max-w-sm mx-auto space-y-1">
                      <p className="text-slate-500"><strong>City:</strong> {formData.city}</p>
                      <p className="text-slate-500"><strong>Doctors:</strong> {formData.doctorCount}</p>
                      <p className="text-slate-500"><strong>Preferred Time:</strong> {formData.preferredTime}</p>
                    </div>

                    <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                      <Link to="/dashboard">
                        <Button variant="primary" size="md">
                          Explore Live Demo Dashboard
                        </Button>
                      </Link>
                      <Link to="/">
                        <Button variant="outline" size="md">
                          Back to Home
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="pb-3 border-b border-slate-100">
                      <h2 className="text-xl font-bold text-slate-900">Request Your Clinic Demo</h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Fill in your clinic details to get tailored dental AI scenarios.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Clinic Name *"
                        placeholder="e.g. Ivory Dental Care"
                        leftIcon={<Building className="w-4 h-4" />}
                        value={formData.clinicName}
                        onChange={e => setFormData({ ...formData, clinicName: e.target.value })}
                        error={errors.clinicName}
                      />
                      <Input
                        label="Contact Person / Doctor Name *"
                        placeholder="e.g. Dr. Sneha Reddy"
                        leftIcon={<User className="w-4 h-4" />}
                        value={formData.contactPerson}
                        onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
                        error={errors.contactPerson}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="WhatsApp Phone Number *"
                        placeholder="e.g. 9845012345"
                        leftIcon={<Phone className="w-4 h-4" />}
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        error={errors.phone}
                        helperText="We send the live WhatsApp test to this number"
                      />
                      <Input
                        label="Email Address *"
                        placeholder="doctor@clinic.com"
                        type="email"
                        leftIcon={<Mail className="w-4 h-4" />}
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        error={errors.email}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Select
                        label="City"
                        value={formData.city}
                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                        options={[
                          { label: 'Bengaluru', value: 'Bengaluru' },
                          { label: 'Mumbai', value: 'Mumbai' },
                          { label: 'Delhi-NCR', value: 'Delhi-NCR' },
                          { label: 'Hyderabad', value: 'Hyderabad' },
                          { label: 'Chennai', value: 'Chennai' },
                          { label: 'Pune', value: 'Pune' },
                          { label: 'Kolkata', value: 'Kolkata' },
                          { label: 'Ahmedabad', value: 'Ahmedabad' },
                          { label: 'Other Indian City', value: 'Other' },
                        ]}
                      />
                      <Select
                        label="Number of Doctors"
                        value={formData.doctorCount}
                        onChange={e => setFormData({ ...formData, doctorCount: e.target.value })}
                        options={[
                          { label: 'Solo Practice (1)', value: 'Solo' },
                          { label: '2 - 3 Doctors', value: '1-3 Doctors' },
                          { label: '4 - 8 Doctors', value: '4-8 Doctors' },
                          { label: 'Chain / Multi-Branch', value: 'Multi-Branch' },
                        ]}
                      />
                      <Select
                        label="Current Software"
                        value={formData.currentSoftware}
                        onChange={e => setFormData({ ...formData, currentSoftware: e.target.value })}
                        options={[
                          { label: 'Practo', value: 'Practo' },
                          { label: 'Dentee', value: 'Dentee' },
                          { label: 'Paper / Excel / WhatsApp', value: 'Manual' },
                          { label: 'Other Software', value: 'Other' },
                        ]}
                      />
                    </div>

                    <Select
                      label="Preferred Time for 15-min Call"
                      value={formData.preferredTime}
                      onChange={e => setFormData({ ...formData, preferredTime: e.target.value })}
                      options={[
                        { label: 'Morning (10:00 AM - 01:00 PM)', value: 'Morning (10 AM - 1 PM)' },
                        { label: 'Afternoon (02:00 PM - 05:00 PM)', value: 'Afternoon (2 PM - 5 PM)' },
                        { label: 'Evening (06:00 PM - 08:30 PM)', value: 'Evening (6 PM - 8:30 PM)' },
                      ]}
                    />

                    <div className="pt-2">
                      <Button
                        type="submit"
                        size="lg"
                        className="w-full text-base py-3"
                        isLoading={isSubmitting}
                      >
                        Confirm 15-Min Live Demo Booking
                      </Button>
                      <p className="text-[11px] text-center text-slate-400 mt-2">
                        🔒 We respect your privacy. No spam, no unsolicited calls.
                      </p>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
