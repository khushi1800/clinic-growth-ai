import React from 'react';
import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';
import {
  X,
  LayoutDashboard,
  Users,
  Calendar,
  MessageSquare,
  Bot,
  Settings,
  HelpCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose, isAdmin = false }) => {
  if (!isOpen) return null;

  const clinicNavItems = [
    { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { name: 'Leads CRM', to: '/leads', icon: Users },
    { name: 'Appointments', to: '/appointments', icon: Calendar },
    { name: 'Conversations', to: '/conversations', icon: MessageSquare },
    { name: 'AI Playground', to: '/ai-playground', icon: Bot },
    { name: 'Clinic Settings', to: '/settings/clinic', icon: Settings },
    { name: 'Staff & Doctors', to: '/settings/staff', icon: UserCheck },
    { name: 'AI FAQ Knowledge', to: '/settings/faq', icon: HelpCircle },
    { name: 'Follow-up Rules', to: '/settings/follow-ups', icon: Clock },
  ];

  const adminNavItems = [
    { name: 'Owner Overview', to: '/admin', icon: LayoutDashboard },
    { name: 'Sales CRM / Prospects', to: '/admin/prospects', icon: Users },
    { name: 'Subscribed Clinics', to: '/admin/customers', icon: ShieldCheck },
    { name: 'Revenue & Finance', to: '/admin/finance', icon: Sparkles },
  ];

  const items = isAdmin ? adminNavItems : clinicNavItems;

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onClose} />

      {/* Drawer */}
      <div className="relative w-72 max-w-[80vw] bg-white h-full shadow-2xl flex flex-col justify-between z-10 p-5">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                CG
              </div>
              <span className="font-extrabold text-slate-900 text-sm">Clinic Growth AI</span>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="mt-4 space-y-1">
            {items.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }: { isActive: boolean }) =>
                  clsx(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs font-semibold'
                      : 'text-slate-700 hover:bg-slate-100'
                  )
                }
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-100 space-y-2">
          <NavLink
            to={isAdmin ? '/dashboard' : '/admin'}
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg bg-slate-100 text-xs font-semibold text-slate-800"
          >
            Switch to {isAdmin ? 'Clinic View' : 'Owner Admin'}
          </NavLink>
        </div>
      </div>
    </div>
  );
};
