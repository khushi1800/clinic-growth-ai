import React, { useState } from 'react';
import {
  Search,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/Table';
import { useMockData } from '@/hooks/useMockData';

export const CustomersPage: React.FC = () => {
  const { customers } = useMockData();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = customers.filter(
    c =>
      c.clinic_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.doctor_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900">
              Subscribed Dental Clinics
            </h1>
            <Badge variant="primary" size="sm">{customers.length} ACTIVE CUSTOMERS</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage paying dental practices, subscription plans, health scores, and renewals
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by clinic name, city, or doctor..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Customers Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Clinic Name & Doctor</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Subscription Plan</TableHead>
            <TableHead>Monthly Rate</TableHead>
            <TableHead>Health Score</TableHead>
            <TableHead>Next Renewal</TableHead>
            <TableHead className="text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map(cust => (
            <TableRow key={cust.id}>
              <TableCell>
                <p className="font-bold text-slate-900 text-xs">{cust.clinic_name}</p>
                <p className="text-[11px] text-slate-500">{cust.doctor_name}</p>
              </TableCell>
              <TableCell>
                <span className="text-xs text-slate-700 font-medium">{cust.city}</span>
              </TableCell>
              <TableCell>
                <Badge
                  variant={cust.plan === 'premium' ? 'primary' : 'gray'}
                  size="sm"
                >
                  {cust.plan === 'premium' ? 'Premium (₹19,999)' : 'Standard (₹14,999)'}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="font-bold text-slate-900 text-xs">
                  ₹{cust.monthly_rate.toLocaleString('en-IN')}/mo
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      (cust.health_score || 0) >= 90
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-blue-50 text-blue-700'
                    }`}
                  >
                    {cust.health_score}%
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-xs text-slate-600">
                  {cust.next_renewal || '2026-12-01'}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <Badge variant="success" size="sm" dot>
                  Active
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
