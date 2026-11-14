import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Search,
  Menu,
  Sparkles,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';

interface HeaderProps {
  onMenuClick?: () => void;
  title?: string;
  isAdmin?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, title, isAdmin = false }) => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  return (
    <header className="h-16 border-b border-slate-200 bg-white px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base md:text-lg font-bold text-slate-900 flex items-center gap-2">
            {title || (isAdmin ? 'Executive Business Dashboard' : 'Smile Dental Clinic')}
            <Badge variant="primary" size="sm" className="hidden sm:inline-flex">
              {isAdmin ? 'ADMIN' : 'AI ACTIVE'}
            </Badge>
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        {/* Search trigger */}
        <div className="relative hidden md:block w-48 lg:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search patients, leads, phone..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Live Notification Indicator */}
        <div className="relative">
          <button
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse" />
          </button>

          {notificationOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-900">Recent Notifications</span>
                <span className="text-[10px] text-blue-600 font-medium">Clear all</span>
              </div>
              <div className="space-y-2 mt-2">
                <div className="p-2 rounded-lg bg-blue-50/70 border border-blue-100">
                  <div className="flex items-center gap-1.5 text-blue-800 font-semibold text-[11px]">
                    <Sparkles className="w-3.5 h-3.5" />
                    New AI Lead Booked
                  </div>
                  <p className="text-slate-600 mt-1">
                    Aarav Mehta requested Saturday 11:30 AM RCT slot via WhatsApp.
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 block">5 minutes ago</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-slate-800 font-semibold text-[11px]">
                    WhatsApp Follow-up Sent
                  </div>
                  <p className="text-slate-600 mt-1">
                    Automated quote delivered to Priya Nair (Laser whitening enquiry).
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 block">1 hour ago</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Avatar name={isAdmin ? 'Business Owner' : 'Dr. Rohan Sharma'} size="sm" />
            <div className="hidden sm:block text-left text-xs">
              <p className="font-semibold text-slate-900 leading-tight">
                {isAdmin ? 'Clinic Growth Admin' : 'Dr. Rohan Sharma'}
              </p>
              <p className="text-[10px] text-slate-500">
                {isAdmin ? 'Platform Owner' : 'Clinic Director'}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="font-bold text-slate-900">Signed in as</p>
                <p className="text-slate-500 truncate">
                  {isAdmin ? 'admin@clinicgrowth.ai' : 'rohan@smiledentalcare.demo'}
                </p>
              </div>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  navigate('/settings/clinic');
                }}
                className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Clinic Settings
              </button>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  navigate('/pricing');
                }}
                className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Subscription & Pricing
              </button>
              <div className="border-t border-slate-100 my-1" />
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  navigate('/login');
                }}
                className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 flex items-center gap-1.5 transition-colors font-medium"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
