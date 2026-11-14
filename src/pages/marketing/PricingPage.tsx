import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  X,
  HelpCircle,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  PhoneCall,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';

export const PricingPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const comparisonFeatures = [
    { name: '24/7 AI Receptionist (WhatsApp & Web)', standard: true, premium: true },
    { name: 'Automated Appointment Scheduling', standard: true, premium: true },
    { name: 'Lead CRM & Pipeline Management', standard: true, premium: true },
    { name: 'Doctor Calendar Sync & Slot Constraints', standard: true, premium: true },
    { name: 'Basic Performance Analytics', standard: true, premium: true },
    { name: 'WhatsApp Follow-Up Automation Engine', standard: false, premium: true },
    { name: '24h Pre-Appointment Reminders & Interactive Confirmation', standard: false, premium: true },
    { name: 'Automated Post-Treatment Google Review Collector', standard: false, premium: true },
    { name: 'Custom AI Voice & Specialty FAQ Persona Training', standard: false, premium: true },
    { name: 'Multi-Branch & Multi-Doctor Smart Routing', standard: false, premium: true },
    { name: 'Dedicated Account Manager & 24/7 SLA Support', standard: false, premium: true },
  ];

  const faqs = [
    {
      q: 'What is included in the ₹9,999 one-time setup fee?',
      a: 'The setup fee includes official Meta WhatsApp Cloud API verification, clinic treatment catalog ingestion (pricing, timings, doctor profiles), custom AI FAQ training, staff workflow onboarding, and 48-hour live go-live support.',
    },
    {
      q: 'Can the AI receptionist handle our clinic’s specific pricing?',
      a: 'Yes. We calibrate the AI with your exact price lists, consultation fees, and package rates. If a treatment requires clinical evaluation before quoting (e.g. complex dental implants or aligners), the AI provides a realistic price range and encourages a clinic visit.',
    },
    {
      q: 'What happens if a patient has an urgent dental emergency?',
      a: 'Our AI has built-in triage protocols developed with dentists. When red flags (such as sudden facial swelling, traumatic bleeding, or excruciating pain) are detected, it immediately provides first-aid guidance and sends an urgent escalation alert to the clinic’s designated emergency mobile number.',
    },
    {
      q: 'Is there a long-term lock-in contract?',
      a: 'No lock-in contracts. You can subscribe on a simple month-to-month basis and cancel anytime. We believe our ROI should speak for itself every single month.',
    },
    {
      q: 'Do we need technical staff or new hardware?',
      a: 'None at all. Clinic Growth AI operates in the cloud. Your clinic staff can manage appointments and leads through our simple browser dashboard or directly from their smartphones.',
    },
  ];

  return (
    <div className="space-y-20 py-12 md:py-16">
      {/* Title */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Badge variant="primary" size="md">TRANSPARENT ROI-DRIVEN PRICING</Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mt-3">
          Predictable Pricing for High-Growth Clinics
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
          One single new implant or clear aligner patient covers your entire monthly investment. No hidden commissions, no per-lead penalties.
        </p>

        {/* Setup fee banner */}
        <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
          <span>One-time ₹9,999 setup & Meta WhatsApp Cloud API onboarding fee applies to all plans.</span>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* STANDARD PLAN */}
          <Card className="border border-slate-200 bg-white p-8 flex flex-col justify-between rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Standard Plan</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Ideal for solo dental practitioners</p>
                </div>
                <Badge variant="gray">SOLO PRACTICE</Badge>
              </div>

              <div className="mt-6">
                <span className="text-4xl font-extrabold text-slate-900">₹14,999</span>
                <span className="text-sm text-slate-500"> / month</span>
                <p className="text-xs text-slate-500 mt-1">+ ₹9,999 one-time onboarding</p>
              </div>

              <div className="mt-8 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Included capabilities:
                </p>
                <ul className="space-y-3 text-xs text-slate-700">
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>24/7 AI Receptionist:</strong> Web chat & WhatsApp answering</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Lead CRM:</strong> Real-time capture & pipeline view</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Chair Booking:</strong> Automated appointment slot management</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Basic Reporting:</strong> Monthly conversion metrics</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Up to 2 Doctor Calendars supported</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <Link to="/demo">
                <Button variant="outline" className="w-full py-2.5">
                  Get Started with Standard
                </Button>
              </Link>
            </div>
          </Card>

          {/* PREMIUM PLAN */}
          <Card className="border-2 border-blue-600 bg-white p-8 flex flex-col justify-between rounded-2xl shadow-xl relative">
            <div className="absolute -top-3.5 right-8">
              <Badge variant="primary" size="md">RECOMMENDED FOR MAX GROWTH</Badge>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Premium Plan</h3>
                  <p className="text-xs text-slate-500 mt-0.5">For busy clinics & multi-doctor teams</p>
                </div>
                <Badge variant="primary">COMPLETE ENGINE</Badge>
              </div>

              <div className="mt-6">
                <span className="text-4xl font-extrabold text-blue-600">₹19,999</span>
                <span className="text-sm text-slate-500"> / month</span>
                <p className="text-xs text-slate-500 mt-1">+ ₹9,999 one-time onboarding</p>
              </div>

              <div className="mt-8 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Everything in Standard, plus:
                </p>
                <ul className="space-y-3 text-xs text-slate-700">
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span><strong>Full Follow-up Automation Engine:</strong> 24h & 2h WhatsApp reminders</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span><strong>Google Review Automator:</strong> Post-treatment rating generation</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span><strong>Custom AI Voice & Knowledge Tuning:</strong> Doctor-specific FAQ responses</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span><strong>Multi-Branch & Multi-Doctor Routing:</strong> Unlimited doctor calendars</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span><strong>Priority VIP Support:</strong> Dedicated WhatsApp support group</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <Link to="/demo">
                <Button variant="primary" className="w-full py-2.5 shadow-md">
                  Choose Premium & Book Demo
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* DETAILED COMPARISON TABLE */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Feature Breakdown Comparison</h2>
          <p className="text-xs text-slate-500 mt-1">See how each tier compares across key clinic workflows</p>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 font-bold text-slate-700 uppercase tracking-wider">Features</th>
                <th className="p-4 font-bold text-slate-700 text-center w-36 uppercase tracking-wider">Standard</th>
                <th className="p-4 font-bold text-blue-600 text-center w-36 uppercase tracking-wider">Premium</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {comparisonFeatures.map((feat, i) => (
                <tr key={i} className="hover:bg-slate-50/60">
                  <td className="p-4 font-medium text-slate-800">{feat.name}</td>
                  <td className="p-4 text-center">
                    {feat.standard ? (
                      <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-slate-300 mx-auto" />
                    )}
                  </td>
                  <td className="p-4 text-center bg-blue-50/30">
                    {feat.premium ? (
                      <Check className="w-4 h-4 text-blue-600 mx-auto font-bold" />
                    ) : (
                      <X className="w-4 h-4 text-slate-300 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ SECTION */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-slate-900">Frequently Asked Questions</h2>
          <p className="text-xs text-slate-500 mt-1">Everything you need to know about getting started</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="border border-slate-200 rounded-xl overflow-hidden bg-white transition-all"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full p-4 text-left font-bold text-slate-900 flex items-center justify-between text-xs sm:text-sm hover:bg-slate-50"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    openFaq === idx ? 'rotate-180 text-blue-600' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-4 pt-1 text-xs text-slate-600 border-t border-slate-100 leading-relaxed bg-slate-50/50">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* FINAL CTA */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="p-8 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-left">
            <h3 className="text-xl font-bold">Have custom multi-location clinic requirements?</h3>
            <p className="text-xs text-slate-400 mt-1">
              We offer bespoke dental hospital chains setups with centralized routing.
            </p>
          </div>
          <Link to="/demo">
            <Button variant="primary" size="lg">
              Speak with a Specialist
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
