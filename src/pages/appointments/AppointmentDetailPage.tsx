import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Phone,
  MapPin,
  Stethoscope,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useMockData } from '@/hooks/useMockData';

export const AppointmentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { appointments, updateAppointmentStatus } = useMockData();

  const appointment = appointments.find(a => a.id === id) || appointments[0];
  const [status, setStatus] = useState(appointment.status);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({
    date: appointment.appointment_date,
    time: appointment.appointment_time,
  });

  const handleAction = (newStatus: any) => {
    setStatus(newStatus);
    updateAppointmentStatus(appointment.id, newStatus);
  };

  const handleReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    handleAction('rescheduled');
    setIsRescheduleOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/appointments">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-extrabold text-slate-900">
                {appointment.treatment}
              </h1>
              <Badge
                variant={
                  status === 'confirmed'
                    ? 'success'
                    : status === 'completed'
                    ? 'primary'
                    : status === 'cancelled'
                    ? 'danger'
                    : 'warning'
                }
                size="sm"
                dot
              >
                {status.toUpperCase()}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Appointment #{appointment.id} • Registered via Automated Receptionist
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {status !== 'confirmed' && status !== 'completed' && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
              onClick={() => handleAction('confirmed')}
            >
              Confirm Booking
            </Button>
          )}

          {status === 'confirmed' && (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
              onClick={() => handleAction('completed')}
            >
              Mark as Completed
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={() => setIsRescheduleOpen(true)}
          >
            Reschedule
          </Button>

          {status !== 'cancelled' && (
            <Button
              variant="danger"
              size="sm"
              leftIcon={<XCircle className="w-4 h-4" />}
              onClick={() => handleAction('cancelled')}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Appointment Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              Patient Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Full Name</span>
              <span className="font-bold text-slate-900">{appointment.patient_name}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Contact Number</span>
              <a href={`tel:${appointment.patient_phone}`} className="font-bold text-blue-600 hover:underline">
                {appointment.patient_phone}
              </a>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Clinical History / Notes</span>
              <span className="font-medium text-slate-800 text-right max-w-xs">
                {appointment.notes || 'None noted.'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              Slot & Doctor Assignment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Scheduled Date</span>
              <span className="font-bold text-slate-900">{appointment.appointment_date}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Scheduled Time</span>
              <span className="font-bold text-slate-900">
                {appointment.appointment_time.slice(0, 5)} ({appointment.duration_minutes} minutes)
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Attending Doctor</span>
              <span className="font-bold text-slate-900">{appointment.doctor_name}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Clinic Branch</span>
              <span className="font-bold text-slate-900">{appointment.branch_name}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* WhatsApp Automation Status */}
      <Card className="bg-slate-900 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                WhatsApp Patient Communication
              </span>
              <h3 className="text-base font-bold mt-1">Automated Reminders & Feedback Sequence</h3>
            </div>
            <Badge variant="success" size="sm">ACTIVE CAMPAIGN</Badge>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
            <div className="p-3 rounded-lg bg-slate-800 border border-slate-700">
              <p className="text-slate-400 font-semibold text-[11px]">1. Instant Confirmation</p>
              <p className="mt-1 text-emerald-400 font-bold">✓ Sent on booking</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-800 border border-slate-700">
              <p className="text-slate-400 font-semibold text-[11px]">2. 24h Prior Reminder</p>
              <p className="mt-1 text-amber-400 font-bold">⏰ Scheduled (Auto)</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-800 border border-slate-700">
              <p className="text-slate-400 font-semibold text-[11px]">3. Post-Treatment Google Review</p>
              <p className="mt-1 text-slate-400 font-bold">Triggered after completion</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reschedule Modal */}
      <Modal
        isOpen={isRescheduleOpen}
        onClose={() => setIsRescheduleOpen(false)}
        title="Reschedule Appointment"
        description="Select a new date and time for the patient visit."
        size="sm"
      >
        <form onSubmit={handleReschedule} className="space-y-4">
          <Input
            label="New Date"
            type="date"
            value={rescheduleData.date}
            onChange={e => setRescheduleData({ ...rescheduleData, date: e.target.value })}
            required
          />
          <Input
            label="New Time"
            type="time"
            value={rescheduleData.time}
            onChange={e => setRescheduleData({ ...rescheduleData, time: e.target.value })}
            required
          />
          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsRescheduleOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save New Schedule
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
