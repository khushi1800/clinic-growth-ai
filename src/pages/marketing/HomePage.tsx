import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  PhoneCall,
  CalendarCheck,
  MessageSquareCode,
  TrendingUp,
  ShieldCheck,
  Clock,
  ArrowRight,
  CheckCircle2,
  Users,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';

export const HomePage: React.FC = () => {
  return (
    <div className="space-y-24 pb-20">
      {/* HERO SECTION */}
      <section className="relative pt-12 md:pt-20 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-blue-400/20 to-teal-300/20 blur-3xl -z-10 rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-6 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Built exclusively for modern Indian dental clinics</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.15]">
            Your AI Receptionist That{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-teal-600 to-indigo-600">
              Never Misses a Patient Call
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Stop losing high-value RCT, implant, and aligner patients after 7 PM. Our intelligent dental AI receptionist answers inquiries on WhatsApp & Web, books doctor chairs, and follows up instantly.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/demo">
              <Button size="lg" className="w-full sm:w-auto text-base px-8 py-3.5" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Schedule Clinic Demo
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-6">
                Explore Demo Dashboard
              </Button>
            </Link>
          </div>

          {/* Micro Trust metrics */}
          <div className="mt-12 pt-8 border-t border-slate-100 flex flex-wrap items-center justify-center gap-8 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Instant WhatsApp Cloud Integration</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>No Staff Training Required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Setup in under 48 hours</span>
            </div>
          </div>

          {/* Product Preview Card */}
          <div className="mt-12 relative max-w-5xl mx-auto rounded-2xl border border-slate-200/80 bg-white p-3 sm:p-5 shadow-2xl">
            <div className="rounded-xl bg-slate-900 p-4 sm:p-6 text-left text-white overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                  <span className="text-xs text-slate-400 font-mono ml-2">Live WhatsApp Dental Assistant</span>
                </div>
                <Badge variant="success" size="sm" dot>24/7 ACTIVE</Badge>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Conversation mockup */}
                <div className="bg-slate-950 rounded-xl p-4 space-y-3 font-sans text-xs border border-slate-800">
                  <div className="flex items-start gap-2.5">
                    <div className="bg-slate-800 text-slate-200 px-3 py-2 rounded-2xl rounded-tl-none max-w-[85%]">
                      <p className="font-semibold text-slate-400 text-[10px]">Patient (Sunday 9:45 PM):</p>
                      <p className="mt-0.5">Hi doctor, my molar tooth hurts when eating hot food. Can I get an appointment tomorrow?</p>
                    </div>
                  </div>

                  <div className="flex items-start justify-end gap-2.5">
                    <div className="bg-blue-600 text-white px-3.5 py-2.5 rounded-2xl rounded-tr-none max-w-[85%] shadow-md">
                      <p className="font-semibold text-blue-200 text-[10px] flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Maya (AI Dental Receptionist):
                      </p>
                      <p className="mt-1">
                        Namaste! That sounds like acute sensitivity or pulp inflammation. Dr. Rohan Sharma has an opening tomorrow (Monday) at 11:30 AM at our Indiranagar clinic. Would you like me to reserve that chair for you?
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="bg-slate-800 text-slate-200 px-3 py-2 rounded-2xl rounded-tl-none max-w-[85%]">
                      <p className="font-semibold text-slate-400 text-[10px]">Patient:</p>
                      <p className="mt-0.5">Yes please! What is the consultation charge?</p>
                    </div>
                  </div>

                  <div className="flex items-start justify-end gap-2.5">
                    <div className="bg-blue-600 text-white px-3.5 py-2.5 rounded-2xl rounded-tr-none max-w-[85%] shadow-md">
                      <p className="font-semibold text-blue-200 text-[10px] flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Maya (AI Dental Receptionist):
                      </p>
                      <p className="mt-1">
                        The checkup fee is ₹600. Your appointment is locked for 11:30 AM tomorrow. We just sent your WhatsApp confirmation with clinic Google Maps directions! 🦷
                      </p>
                    </div>
                  </div>
                </div>

                {/* Automation outcome card */}
                <div className="flex flex-col justify-between p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400">
                      Automated Lead Extraction
                    </span>
                    <h4 className="text-base font-bold text-white mt-1">
                      Patient Converted in 90 Seconds
                    </h4>
                    <p className="text-slate-300 mt-2 text-xs leading-relaxed">
                      While your front desk was closed on Sunday night, the AI captured the patient, evaluated symptoms, answered pricing, and booked chair time without human effort.
                    </p>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between p-2 rounded bg-slate-900/80 border border-slate-800">
                        <span className="text-slate-400">Chief Complaint</span>
                        <span className="text-white font-medium">Molar Pulpitis / Pain</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-slate-900/80 border border-slate-800">
                        <span className="text-slate-400">Assigned Doctor</span>
                        <span className="text-white font-medium">Dr. Rohan Sharma, MDS</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-slate-900/80 border border-slate-800">
                        <span className="text-slate-400">Est. Treatment Value</span>
                        <span className="text-emerald-400 font-bold">₹4,500 – ₹8,500</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-700 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Syncs with Clinic Dashboard</span>
                    <span className="text-teal-400 font-semibold">Zero No-Show Risk</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES GRID */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="primary" size="md">ENGINEERED FOR DENTISTRY</Badge>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
            Everything your dental practice needs to grow revenue and retain patients
          </h2>
          <p className="mt-3 text-sm text-slate-600">
            Replaces scattered WhatsApp messages, missed evening calls, and messy manual registers with one unified AI automation engine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-md transition-shadow border-slate-200">
            <CardContent className="p-6 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">24/7 AI Receptionist</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Answers phone queries, website visitors, and WhatsApp chats instantly even at 11 PM or Sunday afternoons when staff is offline.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow border-slate-200">
            <CardContent className="p-6 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Smart Chair Booking</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Understands treatment procedure durations (e.g. 60 mins for RCT, 20 mins for suture removal) and schedules slots with zero double bookings.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow border-slate-200">
            <CardContent className="p-6 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <MessageSquareCode className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">WhatsApp Follow-Up Engine</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Automated reminders at 24 hours and 2 hours before the visit cut no-shows by 65%. Automated post-op checks boost Google reviews.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow border-slate-200">
            <CardContent className="p-6 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Clinical Safety Triage</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Detects medical red flags (facial swelling, fever, bleeding, traumatic injury) and immediately escalates urgent cases to doctor’s mobile.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow border-slate-200">
            <CardContent className="p-6 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Lead CRM & Pipeline</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Track every lead from initial chat to converted treatment. Never let high-ticket orthodontic or implant consultations slip away.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow border-slate-200">
            <CardContent className="p-6 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Multi-Doctor & Multi-Branch</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Seamlessly routes patients between specialists (Endodontist, Orthodontist, Periodontist) and multiple branch locations.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* SOCIAL PROOF & PILOT CLINICS SECTION */}
      <section className="bg-slate-50 py-16 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge variant="secondary" size="md">PILOT PROGRAM RESULTS [DEMO AUDIT]</Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              Trusted by Leading Dental Practitioners
            </h2>
            <p className="text-xs text-slate-500 mt-2">
              Real performance data from verified pilot dental clinics in Bengaluru and Chennai.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white">
              <CardContent className="p-6 space-y-4">
                <div className="text-amber-400 flex items-center gap-1 text-sm">
                  ★★★★★
                </div>
                <p className="text-xs text-slate-700 italic leading-relaxed">
                  "We used to miss at least 6 to 8 patient enquiries every weekend because our front desk is closed. In the first 30 days of using Clinic Growth AI, we recovered 22 appointments worth ₹1,80,000 in procedures."
                </p>
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-900">Dr. Rohan Sharma, MDS</p>
                  <p className="text-[11px] text-slate-500">Chief Endodontist, Smile Dental Clinic, Indiranagar</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="p-6 space-y-4">
                <div className="text-amber-400 flex items-center gap-1 text-sm">
                  ★★★★★
                </div>
                <p className="text-xs text-slate-700 italic leading-relaxed">
                  "Our no-show rate for aligner consultations dropped from 35% down to under 10% because the automated WhatsApp reminders send interactive confirmation buttons directly to patients."
                </p>
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-900">Dr. Pooja Iyer, BDS</p>
                  <p className="text-[11px] text-slate-500">Aesthetic Dentist & Aligner Specialist, Bengaluru</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="p-6 space-y-4">
                <div className="text-amber-400 flex items-center gap-1 text-sm">
                  ★★★★★
                </div>
                <p className="text-xs text-slate-700 italic leading-relaxed">
                  "The patient experience is phenomenal. Patients love getting instant answers at night regarding treatment costs and pre-visit precautions without waiting until morning."
                </p>
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-900">Dr. S. Rao, MDS</p>
                  <p className="text-[11px] text-slate-500">Dr. Rao's Micro Endodontics, Chennai</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* PRICING PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Badge variant="primary" size="md">TRANSPARENT VALUE</Badge>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
          Simple, Predictable Clinic Investment
        </h2>
        <p className="text-sm text-slate-600 mt-2 max-w-xl mx-auto">
          One single new implant or clear aligner patient pays for your entire month's subscription.
        </p>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto text-left">
          {/* Standard */}
          <Card className="border-slate-200 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Standard Plan</h3>
                <Badge variant="gray">Solo Clinics</Badge>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-extrabold text-slate-900">₹14,999</span>
                <span className="text-xs text-slate-500"> / month</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">+ ₹9,999 one-time setup & training fee</p>
              <ul className="mt-6 space-y-2.5 text-xs text-slate-700">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> 24/7 AI Receptionist (Web & WhatsApp)</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Appointment Booking & Slot Management</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Lead Management CRM</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Basic Reports & Analytics</li>
              </ul>
            </div>
            <div className="mt-6">
              <Link to="/demo">
                <Button variant="outline" className="w-full">
                  Schedule Clinic Demo
                </Button>
              </Link>
            </div>
          </Card>

          {/* Premium */}
          <Card className="border-2 border-blue-600 p-6 flex flex-col justify-between relative shadow-lg">
            <div className="absolute -top-3 right-6">
              <Badge variant="primary" size="md">MOST POPULAR</Badge>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Premium Plan</h3>
                <Badge variant="primary">Growing Clinics</Badge>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-extrabold text-slate-900">₹19,999</span>
                <span className="text-xs text-slate-500"> / month</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">+ ₹9,999 one-time setup & training fee</p>
              <ul className="mt-6 space-y-2.5 text-xs text-slate-700">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> <strong>Everything in Standard</strong></li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Automated WhatsApp Follow-up Rules Engine</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Priority 24/7 Support & Dedicated Account Rep</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Custom Clinic AI Voice & Doctor FAQ Tuning</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Multi-branch & multi-doctor routing</li>
              </ul>
            </div>
            <div className="mt-6">
              <Link to="/demo">
                <Button variant="primary" className="w-full">
                  Schedule Clinic Demo
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* FINAL CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-teal-600 p-8 sm:p-14 text-white text-center shadow-xl">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to stop missing patient calls today?
          </h2>
          <p className="mt-4 text-sm sm:text-base text-blue-100 max-w-xl mx-auto leading-relaxed">
            Schedule a personalized 15-minute walkthrough for your clinic. See exactly how our AI receptionist answers your specific treatments and pricing questions.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/demo">
              <Button size="lg" className="bg-white text-blue-700 hover:bg-slate-100 px-8 py-3.5 font-bold shadow-md">
                Schedule Clinic Demo
              </Button>
            </Link>
            <Link to="/pricing">
              <Button size="lg" variant="ghost" className="text-white hover:bg-blue-600/50">
                Compare Pricing Tiers
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
