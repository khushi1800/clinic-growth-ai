import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Phone,
  Mail,
  Clock,
  Sparkles,
  CalendarPlus,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useMockData } from '@/hooks/useMockData';
import type { LeadStatus } from '@/types/enums';

export const LeadDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { leads, updateLeadStatus, staff, addAppointment } = useMockData();

  const lead = leads.find(l => l.id === id) || leads[0];

  const [currentStatus, setCurrentStatus] = useState(lead.status);
  const [assignedStaff, setAssignedStaff] = useState(lead.assigned_to || 'staff-01');
  const [notes, setNotes] = useState<string>(lead.notes || '');
  const [newNote, setNewNote] = useState('');
  const [isAptModalOpen, setIsAptModalOpen] = useState(false);

  const [aptForm, setAptForm] = useState({
    date: new Date().toISOString().split('T')[0],
    time: '11:00:00',
    doctor: 'Dr. Rohan Sharma',
    treatment: lead.treatment_interest || 'General Consultation',
    branch: 'Indiranagar Main Clinic',
  });

  const handleStatusChange = (newStat: LeadStatus) => {
    setCurrentStatus(newStat);
    updateLeadStatus(lead.id, newStat);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setNotes((prev: string) => `${prev ? prev + '\n\n' : ''}[${new Date().toLocaleDateString('en-IN')}] ${newNote}`);
    setNewNote('');
  };

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    addAppointment({
      lead_id: lead.id,
      patient_name: lead.name,
      patient_phone: lead.phone || '+91 99999 99999',
      doctor_name: aptForm.doctor,
      treatment: aptForm.treatment,
      branch_name: aptForm.branch,
      appointment_date: aptForm.date,
      appointment_time: aptForm.time,
      status: 'confirmed',
      notes: `Converted from lead ${lead.name}`,
    });
    handleStatusChange('appointment_confirmed');
    setIsAptModalOpen(false);
    navigate('/appointments');
  };

  return (
    <div className="space-y-6">
      {/* Back button & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/leads">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-extrabold text-slate-900">{lead.name}</h1>
              <Badge variant="primary" size="sm">{lead.source.toUpperCase()}</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Lead ID: {lead.id} • Registered {new Date(lead.created_at).toLocaleDateString('en-IN')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="sm"
            leftIcon={<CalendarPlus className="w-4 h-4" />}
            onClick={() => setIsAptModalOpen(true)}
          >
            Convert to Appointment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Lead Info & Status */}
        <div className="lg:col-span-5 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Patient & Lead Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase text-slate-500">Pipeline Status</label>
                <select
                  value={currentStatus}
                  onChange={e => handleStatusChange(e.target.value as LeadStatus)}
                  className="mt-1 w-full py-2 px-3 text-xs rounded-lg border border-slate-300 bg-white font-semibold focus:ring-1 focus:ring-blue-500"
                >
                  <option value="new">New Lead</option>
                  <option value="contacted">Contacted</option>
                  <option value="interested">Interested</option>
                  <option value="appointment_requested">Appointment Requested</option>
                  <option value="appointment_confirmed">Appointment Confirmed</option>
                  <option value="converted">Converted Patient</option>
                  <option value="lost">Lost</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-slate-500">Assigned Doctor / Staff</label>
                <select
                  value={assignedStaff}
                  onChange={e => setAssignedStaff(e.target.value)}
                  className="mt-1 w-full py-2 px-3 text-xs rounded-lg border border-slate-300 bg-white focus:ring-1 focus:ring-blue-500"
                >
                  {staff.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> Mobile:
                  </span>
                  <a href={`tel:${lead.phone}`} className="font-semibold text-blue-600 hover:underline">
                    {lead.phone || 'N/A'}
                  </a>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" /> Email:
                  </span>
                  <span className="font-semibold text-slate-700">{lead.email || 'N/A'}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-slate-400" /> Interest:
                  </span>
                  <span className="font-semibold text-slate-900">
                    {lead.treatment_interest || 'General Dentistry'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick WhatsApp Action Card */}
          <Card className="bg-emerald-50/50 border-emerald-200">
            <CardContent className="p-4 space-y-2">
              <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-emerald-600" />
                Direct WhatsApp Communication
              </h4>
              <p className="text-xs text-emerald-800">
                Send an immediate WhatsApp follow-up or pre-consultation medical questionnaire directly to {lead.name}.
              </p>
              <a
                href={`https://wa.me/${(lead.phone || '').replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-block mt-2"
              >
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
                  Open WhatsApp Chat
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Activity Timeline & Notes */}
        <div className="lg:col-span-7 space-y-6">
          {/* Notes Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-500" />
                Clinical & Consultation Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 whitespace-pre-line min-h-[90px]">
                {notes || 'No notes added yet for this patient lead.'}
              </div>

              <form onSubmit={handleAddNote} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type an internal doctor note or clinical observation..."
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <Button type="submit" variant="outline" size="sm">
                  Add Note
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-500" />
                Patient Journey & AI Interaction Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
                <div className="relative flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 z-10 font-bold text-xs">
                    AI
                  </div>
                  <div className="flex-1 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                    <p className="font-bold text-slate-900">Inbound Query via WhatsApp</p>
                    <p className="text-slate-600 mt-1">
                      Patient enquired regarding urgent pain symptoms and weekend appointments.
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {new Date(lead.created_at).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="relative flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center shrink-0 z-10 font-bold text-xs">
                    ✓
                  </div>
                  <div className="flex-1 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                    <p className="font-bold text-slate-900">AI Triage Completed</p>
                    <p className="text-slate-600 mt-1">
                      Evaluated red flags (no facial swelling, severe cold sensitivity). Suggested immediate consultation.
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 block">15 minutes later</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Convert to Appointment Modal */}
      <Modal
        isOpen={isAptModalOpen}
        onClose={() => setIsAptModalOpen(false)}
        title="Schedule Appointment for Patient"
        description={`Directly assign a dental chair and send confirmation to ${lead.name}.`}
        size="md"
      >
        <form onSubmit={handleBookAppointment} className="space-y-4">
          <Input
            label="Patient Name"
            value={lead.name}
            disabled
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Date"
              type="date"
              value={aptForm.date}
              onChange={e => setAptForm({ ...aptForm, date: e.target.value })}
              required
            />
            <Input
              label="Time"
              type="time"
              value={aptForm.time}
              onChange={e => setAptForm({ ...aptForm, time: e.target.value })}
              required
            />
          </div>
          <Select
            label="Select Doctor"
            value={aptForm.doctor}
            onChange={e => setAptForm({ ...aptForm, doctor: e.target.value })}
            options={[
              { label: 'Dr. Rohan Sharma, MDS (Endodontics)', value: 'Dr. Rohan Sharma' },
              { label: 'Dr. Pooja Iyer, BDS (Cosmetic & Aligners)', value: 'Dr. Pooja Iyer' },
            ]}
          />
          <Select
            label="Clinic Branch Location"
            value={aptForm.branch}
            onChange={e => setAptForm({ ...aptForm, branch: e.target.value })}
            options={[
              { label: 'Indiranagar Main Clinic', value: 'Indiranagar Main Clinic' },
              { label: 'Koramangala Center', value: 'Koramangala Center' },
            ]}
          />
          <Input
            label="Procedure / Treatment"
            value={aptForm.treatment}
            onChange={e => setAptForm({ ...aptForm, treatment: e.target.value })}
            required
          />

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsAptModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Confirm & Send WhatsApp
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
