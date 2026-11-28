import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Plus,
  Phone,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/Table';
import { EmptyState } from '@/components/ui/EmptyState';
import { useMockData } from '@/hooks/useMockData';
import type { LeadSource } from '@/types/enums';

export const LeadsPage: React.FC = () => {
  const { leads, addLead } = useMockData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newLead, setNewLead] = useState({
    name: '',
    phone: '',
    email: '',
    source: 'ai_chat',
    notes: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const updateLeadField = (field: string, value: string) => {
    setNewLead(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateLeadForm = () => {
    const errors: Record<string, string> = {};

    if (!newLead.name.trim()) {
      errors.name = 'Patient name is required';
    } else if (newLead.name.trim().length < 2) {
      errors.name = 'Patient name must be at least 2 characters';
    }

    if (!newLead.phone.trim()) {
      errors.phone = 'Mobile number is required';
    } else {
      const cleanPhone = newLead.phone
        .replace(/\D/g, '')
        .replace(/^91(?=\d{10}$)/, '')
        .replace(/^0(?=\d{10}$)/, '');
      if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
        errors.phone = 'Please enter a valid 10-digit Indian mobile number (e.g. 9845012345)';
      }
    }

    if (newLead.email.trim() && !/\S+@\S+\.\S+/.test(newLead.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLeadForm()) return;
    addLead({ ...newLead, source: newLead.source as LeadSource });
    setIsModalOpen(false);
    setNewLead({ name: '', phone: '', email: '', source: 'ai_chat', notes: '' });
    setFormErrors({});
  };

  const filteredLeads = leads.filter(l => {
    const matchesSearch =
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.phone && l.phone.includes(searchTerm)) ||
      (l.notes && l.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter;
    const matchesSource = sourceFilter === 'ALL' || l.source === sourceFilter;

    return matchesSearch && matchesStatus && matchesSource;
  });

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; variant: BadgeVariant }> = {
      new: { label: 'New Lead', variant: 'primary' },
      contacted: { label: 'Contacted', variant: 'secondary' },
      interested: { label: 'Interested', variant: 'warning' },
      appointment_requested: { label: 'Apt Requested', variant: 'purple' },
      appointment_confirmed: { label: 'Apt Confirmed', variant: 'success' },
      converted: { label: 'Converted', variant: 'success' },
      lost: { label: 'Lost', variant: 'gray' },
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
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900">Leads CRM</h1>
            <Badge variant="primary" size="sm">{filteredLeads.length} PATIENTS</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track inquiries, WhatsApp bot conversions, and consultation pipeline
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          Add Patient Lead
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border border-slate-200">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by patient name, phone number, treatment..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-3">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full py-2 px-3 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              >
                <option value="ALL">All Statuses</option>
                <option value="new">New Lead</option>
                <option value="contacted">Contacted</option>
                <option value="interested">Interested</option>
                <option value="appointment_requested">Appointment Requested</option>
                <option value="appointment_confirmed">Appointment Confirmed</option>
                <option value="converted">Converted Patient</option>
                <option value="lost">Lost</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <select
                value={sourceFilter}
                onChange={e => setSourceFilter(e.target.value)}
                className="w-full py-2 px-3 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              >
                <option value="ALL">All Sources</option>
                <option value="ai_chat">AI Chat / WhatsApp Bot</option>
                <option value="whatsapp">Direct WhatsApp</option>
                <option value="website">Website Form</option>
                <option value="phone">Phone Call</option>
                <option value="referral">Doctor Referral</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      {filteredLeads.length === 0 ? (
        <EmptyState
          icon={<User className="w-8 h-8 text-blue-500" />}
          title="No leads match your filter"
          description="Try adjusting your search criteria or add a new patient inquiry."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchTerm('');
            setStatusFilter('ALL');
            setSourceFilter('ALL');
          }}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient / Lead</TableHead>
              <TableHead>Treatment Interest</TableHead>
              <TableHead>Source Channel</TableHead>
              <TableHead>Current Status</TableHead>
              <TableHead>Captured Date</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.map(lead => (
              <TableRow key={lead.id}>
                <TableCell>
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <Link to={`/leads/${lead.id}`} className="hover:text-blue-600">
                      {lead.name}
                    </Link>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{lead.phone || 'No phone'}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-medium text-slate-800 text-xs">
                    {lead.treatment_interest || lead.notes || 'General Dental Consultation'}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant="gray" size="sm" className="capitalize">
                    {lead.source.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>{getStatusBadge(lead.status)}</TableCell>
                <TableCell>
                  <span className="text-xs text-slate-500">
                    {new Date(lead.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Link to={`/leads/${lead.id}`}>
                    <Button variant="outline" size="sm" className="text-xs">
                      View CRM Profile
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Modal: Add New Lead */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFormErrors({});
        }}
        title="Add New Patient Lead"
        description="Record a walk-in, inbound phone call, or external referral."
        size="md"
      >
        <form onSubmit={handleCreateLead} className="space-y-4" noValidate>
          <Input
            label="Patient Name *"
            placeholder="e.g. Ramesh Kulkarni"
            value={newLead.name}
            onChange={e => updateLeadField('name', e.target.value)}
            error={formErrors.name}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Mobile Number *"
              placeholder="e.g. 9845012345"
              value={newLead.phone}
              onChange={e => updateLeadField('phone', e.target.value)}
              error={formErrors.phone}
              helperText="10-digit Indian mobile number"
              required
            />
            <Input
              label="Email"
              placeholder="patient@email.com"
              type="email"
              value={newLead.email}
              onChange={e => updateLeadField('email', e.target.value)}
              error={formErrors.email}
            />
          </div>
          <Select
            label="Lead Acquisition Source"
            value={newLead.source}
            onChange={e => updateLeadField('source', e.target.value)}
            options={[
              { label: 'AI Receptionist Bot', value: 'ai_chat' },
              { label: 'Direct WhatsApp', value: 'whatsapp' },
              { label: 'Website Inquiry Form', value: 'website' },
              { label: 'Inbound Phone Call', value: 'phone' },
              { label: 'Walk-in Consultation', value: 'walk_in' },
              { label: 'Doctor / Patient Referral', value: 'referral' },
            ]}
          />
          <Input
            label="Chief Complaint / Treatment Notes"
            placeholder="e.g. Needs consultation for upper wisdom tooth ache"
            value={newLead.notes}
            onChange={e => updateLeadField('notes', e.target.value)}
          />

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsModalOpen(false);
                setFormErrors({});
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Lead
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
