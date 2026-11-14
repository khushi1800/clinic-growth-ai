import React from 'react';
import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';
import {
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
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface SidebarProps {
  isAdmin?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isAdmin = false }) => {
  const clinicNavItems = [
    { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { name: 'Leads CRM', to: '/leads', icon: Users, badge: '7' },
    { name: 'Appointments', to: '/appointments', icon: Calendar, badge: '4' },
    { name: 'Conversations', to: '/conversations', icon: MessageSquare, badge: 'Live' },
    { name: 'AI Playground', to: '/ai-playground', icon: Bot, isNew: true },
  ];

  const settingsNavItems = [
    { name: 'Clinic Profile', to: '/settings/clinic', icon: Settings },
    { name: 'Staff & Doctors', to: '/settings/staff', icon: UserCheck },
    { name: 'AI FAQ Knowledge', to: '/settings/faq', icon: HelpCircle },
    { name: 'Follow-up Rules', to: '/settings/follow-ups', icon: Clock },
  ];

  const adminNavItems = [
    { name: 'Owner Overview', to: '/admin', icon: LayoutDashboard },
    { name: 'Sales CRM / Prospects', to: '/admin/prospects', icon: Users, badge: '4' },
    { name: 'Subscribed Clinics', to: '/admin/customers', icon: ShieldCheck, badge: '6' },
    { name: 'Revenue & Finance', to: '/admin/finance', icon: Sparkles },
  ];

  return (
    <aside className="hidden lg:flex lg:flex-col w-64 border-r border-slate-200 bg-white min-h-screen shrink-0 justify-between select-none">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100 gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-teal-500 flex items-center justify-center text-white shadow-sm font-bold text-lg">
            CG
          </div>
          <div className="leading-tight">
            <span className="font-extrabold text-slate-900 tracking-tight text-base block">
              Clinic Growth <span className="text-blue-600">AI</span>
            </span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              {isAdmin ? 'Owner Admin Mode' : 'Dental Receptionist v2.0'}
            </span>
          </div>
        </div>

        {/* Clinic Info Banner if not admin */}
        {!isAdmin && (
          <div className="p-4 mx-3 my-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 truncate">Smile Dental Clinic</span>
              <Badge variant="primary" size="sm">DEMO</Badge>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Indiranagar & Koramangala</p>
          </div>
        )}

        {/* Navigation Links */}
        <div className="px-3 py-2 space-y-6">
          {isAdmin ? (
            <div>
              <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Business Management
              </p>
              <nav className="space-y-1">
                {adminNavItems.map(item => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/admin'}
                    className={({ isActive }: { isActive: boolean }) =>
                      clsx(
                        'flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all',
                        isActive
                          ? 'bg-blue-600 text-white shadow-xs font-semibold'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      )
                    }
                  >
                    {({ isActive }: { isActive: boolean }) => (
                      <>
                        <div className="flex items-center gap-3">
                          <item.icon className={clsx('w-4 h-4', isActive ? 'text-white' : 'text-slate-500')} />
                          <span>{item.name}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={clsx(
                              'text-[10px] px-1.5 py-0.5 rounded-full font-bold',
                              isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </nav>
            </div>
          ) : (
            <>
              <div>
                <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Clinic Operations
                </p>
                <nav className="space-y-1">
                  {clinicNavItems.map(item => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === '/dashboard'}
                      className={({ isActive }: { isActive: boolean }) =>
                        clsx(
                          'flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all',
                          isActive
                            ? 'bg-blue-600 text-white shadow-xs font-semibold'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        )
                      }
                    >
                      {({ isActive }: { isActive: boolean }) => (
                        <>
                          <div className="flex items-center gap-3">
                            <item.icon className={clsx('w-4 h-4', isActive ? 'text-white' : 'text-slate-500')} />
                            <span>{item.name}</span>
                          </div>
                          {item.badge && (
                            <span
                              className={clsx(
                                'text-[10px] px-1.5 py-0.5 rounded-full font-bold',
                                isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                              )}
                            >
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  ))}
                </nav>
              </div>

              <div>
                <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Configuration
                </p>
                <nav className="space-y-1">
                  {settingsNavItems.map(item => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }: { isActive: boolean }) =>
                        clsx(
                          'flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all',
                          isActive
                            ? 'bg-blue-600 text-white shadow-xs font-semibold'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        )
                      }
                    >
                      {({ isActive }: { isActive: boolean }) => (
                        <div className="flex items-center gap-3">
                          <item.icon className={clsx('w-4 h-4', isActive ? 'text-white' : 'text-slate-500')} />
                          <span>{item.name}</span>
                        </div>
                      )}
                    </NavLink>
                  ))}
                </nav>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer Switcher & Public Link */}
      <div className="p-3 border-t border-slate-100 space-y-2">
        <NavLink
          to={isAdmin ? '/dashboard' : '/admin'}
          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Switch to {isAdmin ? 'Clinic View' : 'Owner Admin'}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </NavLink>

        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5" />
            Marketing Landing Page
          </span>
        </a>
      </div>
    </aside>
  );
};
