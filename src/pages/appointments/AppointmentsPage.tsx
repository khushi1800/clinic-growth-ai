import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Plus,
  Filter,
  CheckCircle,
  MapPin,
  Stethoscope,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/Table';
import { EmptyState } from '@/components/ui/EmptyState';
import { useMockData } from '@/hooks/useMockData';

export const AppointmentsPage: React.FC = () => {
  const { appointments } = useMockData();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [doctorFilter, setDoctorFilter] = useState('ALL');

  const filteredAppointments = appointments.filter(apt => {
    const matchesStatus = statusFilter === 'ALL' || apt.status === statusFilter;
    const matchesDoctor = doctorFilter === 'ALL' || apt.doctor_name.includes(doctorFilter);
    return matchesStatus && matchesDoctor;
  });

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; variant: BadgeVariant }> = {
      requested: { label: 'Requested', variant: 'warning' },
      confirmed: { label: 'Confirmed', variant: 'success' },
      completed: { label: 'Completed', variant: 'primary' },
      cancelled: { label: 'Cancelled', variant: 'danger' },
      no_show: { label: 'No Show', variant: 'gray' },
      rescheduled: { label: 'Rescheduled', variant: 'secondary' },
    };

    const config = map[status] || { label: status, variant: 'default' };
    return (
      <Badge variant={config.variant} size="sm" dot>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900">Appointments</h1>
            <Badge variant="primary" size="sm">{filteredAppointments.length} SCHEDULED</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Chair management, doctor schedules, and patient consultation slots
          </p>
        </div>

        <Link to="/leads">
          <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
            Book New Chair
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="border border-slate-200">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full py-2 px-3 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="ALL">All Appointment Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="requested">Pending Confirmation</option>
                <option value="completed">Completed Visits</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Filter by Doctor
              </label>
              <select
                value={doctorFilter}
                onChange={e => setDoctorFilter(e.target.value)}
                className="w-full py-2 px-3 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="ALL">All Doctors & Specialists</option>
                <option value="Rohan">Dr. Rohan Sharma, MDS</option>
                <option value="Pooja">Dr. Pooja Iyer, BDS</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      {filteredAppointments.length === 0 ? (
        <EmptyState
          icon={<CalendarIcon className="w-8 h-8 text-blue-500" />}
          title="No appointments found"
          description="Try clearing your status filters to see all patient bookings."
          actionLabel="Reset Filters"
          onAction={() => {
            setStatusFilter('ALL');
            setDoctorFilter('ALL');
          }}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date & Time</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Treatment / Procedure</TableHead>
              <TableHead>Doctor & Clinic</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAppointments.map(apt => (
              <TableRow key={apt.id}>
                <TableCell>
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <CalendarIcon className="w-3.5 h-3.5 text-blue-600" />
                    <span>{apt.appointment_date}</span>
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{apt.appointment_time.slice(0, 5)} ({apt.duration_minutes} min)</span>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="font-bold text-slate-900 text-xs">{apt.patient_name}</p>
                  <p className="text-xs text-slate-500">{apt.patient_phone}</p>
                </TableCell>
                <TableCell>
                  <span className="font-semibold text-slate-800 text-xs">
                    {apt.treatment}
                  </span>
                </TableCell>
                <TableCell>
                  <p className="text-xs font-medium text-slate-900">{apt.doctor_name}</p>
                  <p className="text-[11px] text-slate-400">{apt.branch_name}</p>
                </TableCell>
                <TableCell>{getStatusBadge(apt.status)}</TableCell>
                <TableCell className="text-right">
                  <Link to={`/appointments/${apt.id}`}>
                    <Button variant="outline" size="sm" className="text-xs">
                      Manage Visit
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};
