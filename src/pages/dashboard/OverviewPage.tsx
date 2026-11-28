import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  CalendarCheck,
  TrendingUp,
  Bot,
  Plus,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  Clock,
  Phone,
} from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useMockData } from '@/hooks/useMockData';

export const OverviewPage: React.FC = () => {
  const { leads, appointments, conversations, clinic } = useMockData();

  const newLeadsToday = leads.filter(l => l.status === 'new').length;

  return (
    <div className="space-y-6">
      {/* Welcome & Live Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900">
              Good afternoon, Dr. Rohan Sharma
            </h1>
            <Badge variant="success" size="sm" dot>AI RECEPTION LIVE</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {clinic.name} • Indiranagar & Koramangala branches are operating normally
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/ai-playground">
            <Button variant="outline" size="sm" leftIcon={<Bot className="w-4 h-4 text-blue-600" />}>
              Test AI Playground
            </Button>
          </Link>
          <Link to="/leads">
            <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
              New Lead
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Leads"
          value={leads.length}
          change="+18% this week"
          isPositive={true}
          subtitle="Captured across WhatsApp & Web"
          icon={<Users className="w-5 h-5" />}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          title="New Today"
          value={newLeadsToday}
          change="3 via WhatsApp AI"
          isPositive={true}
          subtitle="Awaiting front-desk follow-up"
          icon={<Sparkles className="w-5 h-5" />}
          iconBg="bg-teal-50"
          iconColor="text-teal-600"
        />
        <StatCard
          title="Appointments"
          value={appointments.length}
          change="2 today scheduled"
          isPositive={true}
          subtitle="Zero chair idle time"
          icon={<CalendarCheck className="w-5 h-5" />}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
        />
        <StatCard
          title="Conversion Rate"
          value="42.8%"
          change="+6.2% vs last mo"
          isPositive={true}
          subtitle="Visitor to treatment visit"
          icon={<TrendingUp className="w-5 h-5" />}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
      </div>

      {/* Main Content: 2-column split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: Recent Leads & Conversations */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active AI Escalation Alert (if any) */}
          <div className="p-4 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-900 flex items-start justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-100 text-amber-700 shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                  Clinical Triage Alert (AI Escalated)
                </span>
                <p className="text-xs text-amber-900 font-semibold mt-0.5">
                  Aarav Mehta reported acute pulpitis pain (8/10) via WhatsApp.
                </p>
                <p className="text-[11px] text-amber-700 mt-1">
                  AI proposed Saturday 11:30 AM slot with Dr. Rohan. Review and confirm chair.
                </p>
              </div>
            </div>
            <Link to="/leads/lead-01">
              <Button size="sm" variant="outline" className="text-xs border-amber-300 bg-white">
                Review Lead
              </Button>
            </Link>
          </div>

          {/* Recent Leads */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <div>
                <CardTitle>Recent Patient Inquiries</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">Automated leads captured in last 48 hours</p>
              </div>
              <Link to="/leads" className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                View All Leads <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {leads.slice(0, 4).map(lead => (
                  <div key={lead.id} className="p-4 hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Link to={`/leads/${lead.id}`} className="text-xs font-bold text-slate-900 hover:text-blue-600 truncate">
                          {lead.name}
                        </Link>
                        <Badge
                          size="sm"
                          variant={
                            lead.status === 'new'
                              ? 'primary'
                              : lead.status === 'appointment_requested' || lead.status === 'appointment_confirmed'
                              ? 'success'
                              : lead.status === 'converted'
                              ? 'purple'
                              : 'gray'
                          }
                        >
                          {lead.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 truncate">
                        {lead.treatment_interest || lead.notes}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {lead.phone}
                        </span>
                        <span>•</span>
                        <span className="capitalize">{lead.source.replace('_', ' ')}</span>
                      </div>
                    </div>

                    <Link to={`/leads/${lead.id}`}>
                      <Button variant="ghost" size="sm" className="text-xs">
                        Details
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 5 cols: Upcoming Appointments & AI Conversations */}
        <div className="lg:col-span-5 space-y-6">
          {/* Upcoming Appointments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <div>
                <CardTitle>Upcoming Appointments</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">Next scheduled clinic visits</p>
              </div>
              <Link to="/appointments" className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {appointments.slice(0, 3).map(apt => (
                  <div key={apt.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-900">{apt.patient_name}</p>
                        <p className="text-xs text-blue-600 font-medium mt-0.5">{apt.treatment}</p>
                      </div>
                      <Badge
                        size="sm"
                        variant={apt.status === 'confirmed' ? 'success' : 'warning'}
                      >
                        {apt.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{apt.appointment_date} at {apt.appointment_time.slice(0, 5)}</span>
                      <span>•</span>
                      <span>{apt.doctor_name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Receptionist Live Activity */}
          <Card>
            <CardHeader className="py-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-blue-600" />
                  AI Receptionist Real-Time Stream
                </CardTitle>
                <Badge variant="primary" size="sm">3 CONVERSATIONS</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
              {conversations.map(conv => (
                <Link
                  key={conv.id}
                  to="/conversations"
                  className="block p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{conv.lead_name}</span>
                    <span className="text-[10px] text-slate-400">WhatsApp AI</span>
                  </div>
                  <p className="text-slate-600 mt-1 line-clamp-1 italic">
                    "{conv.last_message}"
                  </p>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
