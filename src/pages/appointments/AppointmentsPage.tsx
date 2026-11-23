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
  Phone,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { useMockData } from '@/hooks/useMockData';

export const AppointmentsPage: React.FC = () => {
  const { appointments, addAppointment, staff, branches } = useMockData();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [doctorFilter, setDoctorFilter] = useState('ALL');
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const [bookingForm, setBookingForm] = useState({
    patient_name: '',
    patient_phone: '',
    doctor_name: 'Dr. Rohan Sharma, MDS',
    treatment: 'Root Canal Treatment (RCT)',
    branch_name: 'Indiranagar Main Clinic',
    appointment_date: new Date().toISOString().split('T')[0],
    appointment_time: '11:00:00',
    duration_minutes: 30,
    notes: '',
  });

  const [bookingErrors, setBookingErrors] = useState<Record<string, string>>({});

  const updateBookingField = (field: string, value: any) => {
    setBookingForm(prev => ({ ...prev, [field]: value }));
    if (bookingErrors[field]) {
      setBookingErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateBookingForm = () => {
    const errors: Record<string, string> = {};

    if (!bookingForm.patient_name.trim()) {
      errors.patient_name = 'Patient name is required';
    } else if (bookingForm.patient_name.trim().length < 2) {
      errors.patient_name = 'Patient name must be at least 2 characters';
    }

    if (!bookingForm.patient_phone.trim()) {
      errors.patient_phone = 'Mobile number is required';
    } else {
      const cleanPhone = bookingForm.patient_phone
        .replace(/\D/g, '')
        .replace(/^91(?=\d{10}$)/, '')
        .replace(/^0(?=\d{10}$)/, '');
      if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
        errors.patient_phone = 'Please enter a valid 10-digit Indian mobile number (e.g. 9845012345)';
      }
    }

    if (!bookingForm.appointment_date) {
      errors.appointment_date = 'Appointment date is required';
    }

    if (!bookingForm.appointment_time) {
      errors.appointment_time = 'Appointment time is required';
    }

    setBookingErrors(errors);
    return Object.keys(errors).length === 0;
  };

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

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateBookingForm()) return;

    addAppointment({
      patient_name: bookingForm.patient_name.trim(),
      patient_phone: bookingForm.patient_phone.trim(),
      doctor_name: bookingForm.doctor_name,
      treatment: bookingForm.treatment,
      branch_name: bookingForm.branch_name,
      appointment_date: bookingForm.appointment_date,
      appointment_time: bookingForm.appointment_time,
      duration_minutes: Number(bookingForm.duration_minutes) || 30,
      status: 'confirmed',
      notes: bookingForm.notes,
    });

    setIsBookModalOpen(false);
    setBookingSuccess(true);
    setTimeout(() => setBookingSuccess(false), 3000);

    setBookingForm({
      patient_name: '',
      patient_phone: '',
      doctor_name: 'Dr. Rohan Sharma, MDS',
      treatment: 'Root Canal Treatment (RCT)',
      branch_name: 'Indiranagar Main Clinic',
      appointment_date: new Date().toISOString().split('T')[0],
      appointment_time: '11:00:00',
      duration_minutes: 30,
      notes: '',
    });
    setBookingErrors({});
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

        <div className="flex items-center gap-3">
          {bookingSuccess && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Appointment booked & confirmed!</span>
            </div>
          )}
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsBookModalOpen(true)}
          >
            Book New Appointment
          </Button>
        </div>
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
                <option value="Dr. Rohan">Dr. Rohan Sharma (Endodontics)</option>
                <option value="Dr. Pooja">Dr. Pooja Iyer (Cosmetic)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointments Table */}
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

      {/* Book New Appointment Modal */}
      <Modal
        isOpen={isBookModalOpen}
        onClose={() => {
          setIsBookModalOpen(false);
          setBookingErrors({});
        }}
        title="Schedule Patient Appointment"
      >
        <form onSubmit={handleCreateAppointment} className="space-y-4" noValidate>
          <p className="text-xs text-slate-500">
            Book a chair directly for a patient consultation or procedure. Confirms immediately in the system.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Patient Name *"
              placeholder="e.g. Meera Krishnan"
              leftIcon={<User className="w-4 h-4" />}
              value={bookingForm.patient_name}
              onChange={e => updateBookingField('patient_name', e.target.value)}
              error={bookingErrors.patient_name}
              required
            />
            <Input
              label="Mobile Number *"
              placeholder="e.g. 9845012345"
              leftIcon={<Phone className="w-4 h-4" />}
              value={bookingForm.patient_phone}
              onChange={e => updateBookingField('patient_phone', e.target.value)}
              error={bookingErrors.patient_phone}
              helperText="10-digit Indian mobile number"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Select Doctor"
              value={bookingForm.doctor_name}
              onChange={e => updateBookingField('doctor_name', e.target.value)}
              options={[
                { label: 'Dr. Rohan Sharma, MDS (Endodontist)', value: 'Dr. Rohan Sharma, MDS' },
                { label: 'Dr. Pooja Iyer, BDS (Cosmetic)', value: 'Dr. Pooja Iyer, BDS' },
              ]}
            />
            <Select
              label="Clinic Branch"
              value={bookingForm.branch_name}
              onChange={e => updateBookingField('branch_name', e.target.value)}
              options={[
                { label: 'Indiranagar Main Clinic', value: 'Indiranagar Main Clinic' },
                { label: 'Koramangala Center', value: 'Koramangala Center' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Appointment Date *"
              type="date"
              value={bookingForm.appointment_date}
              onChange={e => updateBookingField('appointment_date', e.target.value)}
              error={bookingErrors.appointment_date}
              required
            />
            <Input
              label="Appointment Time *"
              type="time"
              value={bookingForm.appointment_time}
              onChange={e => updateBookingField('appointment_time', e.target.value)}
              error={bookingErrors.appointment_time}
              required
            />
            <Select
              label="Duration"
              value={String(bookingForm.duration_minutes)}
              onChange={e => updateBookingField('duration_minutes', Number(e.target.value))}
              options={[
                { label: '30 Minutes', value: '30' },
                { label: '45 Minutes', value: '45' },
                { label: '60 Minutes', value: '60' },
              ]}
            />
          </div>

          <Select
            label="Treatment / Clinical Procedure"
            value={bookingForm.treatment}
            onChange={e => updateBookingField('treatment', e.target.value)}
            options={[
              { label: 'Root Canal Treatment (RCT)', value: 'Root Canal Treatment (RCT)' },
              { label: 'Dental Implants Consultation', value: 'Dental Implants Consultation' },
              { label: 'Teeth Whitening & Scaling', value: 'Teeth Whitening & Scaling' },
              { label: 'Clear Aligners / Braces Assessment', value: 'Clear Aligners / Braces Assessment' },
              { label: 'Tooth Extraction / Surgery', value: 'Tooth Extraction / Surgery' },
              { label: 'General Consultation & Digital X-Ray', value: 'General Consultation & Digital X-Ray' },
            ]}
          />

          <Input
            label="Clinical Notes / Pre-visit Instructions"
            placeholder="e.g. Sensitivity to hot/cold, wants RVG digital X-ray"
            value={bookingForm.notes}
            onChange={e => updateBookingField('notes', e.target.value)}
          />

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => {
                setIsBookModalOpen(false);
                setBookingErrors({});
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Confirm Appointment Booking
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
