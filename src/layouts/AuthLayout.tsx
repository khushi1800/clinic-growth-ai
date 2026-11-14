import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Sparkles, ShieldCheck } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 flex flex-col justify-between">
      {/* Auth Header */}
      <header className="px-6 py-6 flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-teal-500 flex items-center justify-center text-white shadow-sm font-bold text-base">
            CG
          </div>
          <span className="font-extrabold text-slate-900 tracking-tight text-lg">
            Clinic Growth <span className="text-blue-600">AI</span>
          </span>
        </Link>

        <Link
          to="/"
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          ← Back to Homepage
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>

      {/* Auth Footer */}
      <footer className="py-6 text-center text-xs text-slate-500 flex items-center justify-center gap-4">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          HIPAA & DISHA Compliant Cloud
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          Powered by Gemini 1.5 Flash
        </span>
      </footer>
    </div>
  );
};
