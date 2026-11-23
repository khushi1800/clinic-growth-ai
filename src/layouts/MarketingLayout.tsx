import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowRight, ShieldCheck, HeartHandshake } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const MarketingLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Features', href: '/#features' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Live Demo', href: '/demo' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Public Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-teal-500 flex items-center justify-center text-white shadow-sm font-extrabold text-base">
              CG
            </div>
            <div className="leading-tight">
              <span className="font-extrabold text-slate-900 tracking-tight text-lg">
                Clinic Growth <span className="text-blue-600">AI</span>
              </span>
              <span className="hidden sm:block text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                India's #1 Dental AI Receptionist
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <Link
                key={link.name}
                to={link.href}
                className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="inline-flex items-center justify-center font-medium rounded-lg text-xs px-3.5 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              Clinic Sign In
            </Link>
            <Link
              to="/demo"
              className="inline-flex items-center justify-center font-medium rounded-lg text-xs px-3.5 py-2 bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-colors gap-1.5"
            >
              <span>Schedule Clinic Demo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3">
            {navLinks.map(link => (
              <Link
                key={link.name}
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-base font-semibold text-slate-700"
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 px-4 rounded-lg border border-slate-300 text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors"
              >
                Clinic Sign In
              </Link>
              <Link
                to="/demo"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 px-4 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-colors"
              >
                Schedule Clinic Demo
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
            <div className="space-y-4 md:col-span-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                  CG
                </div>
                <span className="font-bold text-white text-lg">Clinic Growth AI</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Empowering modern dental clinics across India with automated 24/7 AI receptionists,
                smart WhatsApp booking, and zero chair-time waste.
              </p>
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-medium">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>DISHA & WhatsApp Cloud API Verified</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Product</h4>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li><Link to="/#features" className="hover:text-white transition-colors">24/7 AI Receptionist</Link></li>
                <li><Link to="/#features" className="hover:text-white transition-colors">WhatsApp Automation</Link></li>
                <li><Link to="/#features" className="hover:text-white transition-colors">Appointment Scheduling</Link></li>
                <li><Link to="/pricing" className="hover:text-white transition-colors">Transparent Pricing</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Clinics & Doctors</h4>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li><Link to="/demo" className="hover:text-white transition-colors">Request Guided Demo</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Clinic Staff Portal</Link></li>
                <li><Link to="/dashboard" className="hover:text-white transition-colors">Live Interactive Demo</Link></li>
                <li><Link to="/admin" className="hover:text-white transition-colors">Owner Operations Hub</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Contact & Support</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Designed for dental practitioners in Bengaluru, Mumbai, Delhi-NCR, Hyderabad, and Pune.
              </p>
              <p className="text-xs text-slate-300 font-semibold mt-3">
                Email: support@clinicgrowth.ai
              </p>
              <p className="text-xs text-slate-300 font-semibold mt-1">
                WhatsApp Hotline: +91 98450 12345
              </p>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>© 2026 Clinic Growth AI Technologies Pvt. Ltd. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-1.5 text-slate-400">
                <HeartHandshake className="w-4 h-4 text-rose-400" />
                Crafted for Doctors with Care
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
