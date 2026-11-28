import React, { useState } from 'react';
import {
  MapPin,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useMockData } from '@/hooks/useMockData';
import type { Prospect } from '@/types/database';
import type { SalesStatus } from '@/types/enums';

export const ProspectsPage: React.FC = () => {
  const { prospects } = useMockData();
  const [prospectList, setProspectList] = useState<Prospect[]>(prospects);
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [stageFilter, setStageFilter] = useState('ALL');

  const [newProspect, setNewProspect] = useState({
    clinic_name: '',
    location: '',
    contact_phone: '',
    contact_email: '',
    qualification_score: 85,
    sales_status: 'contacted' as SalesStatus,
    next_action: '',
    notes: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const updateField = (field: string, value: unknown) => {
    setNewProspect(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!newProspect.clinic_name.trim()) {
      errs.clinic_name = 'Clinic name is required';
    } else if (newProspect.clinic_name.trim().length < 2) {
      errs.clinic_name = 'Clinic name must be at least 2 characters';
    }

    if (!newProspect.location.trim()) {
      errs.location = 'City / Location is required';
    }

    if (newProspect.contact_phone) {
      const clean = newProspect.contact_phone.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
      if (!/^[6-9]\d{9}$/.test(clean)) {
        errs.contact_phone = 'Please enter a valid 10-digit Indian mobile number';
      }
    }

    if (newProspect.contact_email && !/\S+@\S+\.\S+/.test(newProspect.contact_email.trim())) {
      errs.contact_email = 'Please enter a valid email address';
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddProspect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const item: Prospect = {
      ...newProspect,
      clinic_name: newProspect.clinic_name.trim(),
      location: newProspect.location.trim(),
      id: `pros-${Date.now()}`,
      website: null,
      source_url: 'Manual Outbound Entry',
      research_date: new Date().toISOString().split('T')[0],
      last_interaction_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
    setProspectList(prev => [item, ...prev]);
    setIsAddOpen(false);
    setNewProspect({
      clinic_name: '',
      location: '',
      contact_phone: '',
      contact_email: '',
      qualification_score: 85,
      sales_status: 'contacted',
      next_action: '',
      notes: '',
    });
    setFormErrors({});
  };

  const filtered = prospectList.filter(
    p => stageFilter === 'ALL' || p.sales_status === stageFilter
  );

  const getStatusBadge = (status: SalesStatus) => {
    const map: Record<SalesStatus, { label: string; variant: BadgeVariant }> = {
      researched: { label: 'Researched', variant: 'gray' },
      contacted: { label: 'Contacted', variant: 'secondary' },
      interested: { label: 'Interested', variant: 'warning' },
      demo_scheduled: { label: 'Demo Scheduled', variant: 'primary' },
      demo_done: { label: 'Demo Done', variant: 'secondary' },
      proposal_sent: { label: 'Proposal Sent', variant: 'warning' },
      negotiating: { label: 'Negotiating', variant: 'purple' },
      won: { label: 'Won / Customer', variant: 'success' },
      lost: { label: 'Lost', variant: 'danger' },
    };
    const c = map[status] || { label: status, variant: 'default' };
    return <Badge variant={c.variant} size="sm" dot>{c.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900">
              Sales CRM — Dental Clinic Prospects
            </h1>
            <Badge variant="primary" size="sm">{filtered.length} QUALIFIED PIPELINE</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Target dental clinics across Tier-1 Indian metros identified for Clinic Growth AI onboarding
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsAddOpen(true)}
        >
          Add Clinic Prospect
        </Button>
      </div>

      {/* Stage Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
        {['ALL', 'contacted', 'demo_scheduled', 'proposal_sent', 'negotiating'].map(stage => (
          <button
            key={stage}
            onClick={() => setStageFilter(stage)}
            className={`px-3 py-1.5 rounded-lg border font-semibold capitalize whitespace-nowrap transition-colors ${
              stageFilter === stage
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {stage === 'ALL' ? 'All Stages' : stage.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Prospects Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Clinic Name & City</TableHead>
            <TableHead>Qualification Score</TableHead>
            <TableHead>Pipeline Stage</TableHead>
            <TableHead>Next Planned Action</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map(pros => (
            <TableRow key={pros.id}>
              <TableCell>
                <p className="font-bold text-slate-900 text-xs">{pros.clinic_name}</p>
                <p className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {pros.location || 'Metro Clinic'}
                </p>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">
                    {pros.qualification_score}/100
                  </span>
                  <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        (pros.qualification_score || 0) >= 85
                          ? 'bg-emerald-500'
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${pros.qualification_score || 50}%` }}
                    />
                  </div>
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(pros.sales_status)}</TableCell>
              <TableCell>
                <p className="text-xs text-slate-700 max-w-sm line-clamp-1 font-medium">
                  {pros.next_action || 'Follow up with clinic coordinator'}
                </p>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => setSelectedProspect(pros)}
                >
                  View Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Detail Modal */}
      {selectedProspect && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedProspect(null)}
          title={selectedProspect.clinic_name}
          description={`Location: ${selectedProspect.location || 'N/A'}`}
          size="md"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-500">Qualification Score:</span>
              <span className="text-sm font-bold text-emerald-600">
                {selectedProspect.qualification_score} / 100
              </span>
            </div>

            <div className="space-y-2">
              <p className="text-slate-500">
                <strong>Contact Phone:</strong> {selectedProspect.contact_phone || 'N/A'}
              </p>
              <p className="text-slate-500">
                <strong>Contact Email:</strong> {selectedProspect.contact_email || 'N/A'}
              </p>
              <p className="text-slate-500">
                <strong>Website:</strong>{' '}
                <a
                  href={selectedProspect.website || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {selectedProspect.website || 'No website link'}
                </a>
              </p>
            </div>

            <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-100">
              <p className="font-bold text-blue-900 text-xs mb-1">Next Action Required:</p>
              <p className="text-slate-700">{selectedProspect.next_action}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <p className="font-bold text-slate-800 text-xs mb-1">Clinical Prospect Notes:</p>
              <p className="text-slate-600 leading-relaxed">{selectedProspect.notes}</p>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedProspect(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => {
          setIsAddOpen(false);
          setFormErrors({});
        }}
        title="Add Dental Clinic Prospect"
        description="Record a new target clinic to track in the sales pipeline."
        size="md"
      >
        <form onSubmit={handleAddProspect} className="space-y-4" noValidate>
          <Input
            label="Clinic Name *"
            placeholder="e.g. Apex Orthodontics"
            value={newProspect.clinic_name}
            onChange={e => updateField('clinic_name', e.target.value)}
            error={formErrors.clinic_name}
            required
          />
          <Input
            label="Location / City *"
            placeholder="e.g. Bandra West, Mumbai"
            value={newProspect.location}
            onChange={e => updateField('location', e.target.value)}
            error={formErrors.location}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Phone"
              placeholder="+91 98..."
              value={newProspect.contact_phone}
              onChange={e => updateField('contact_phone', e.target.value)}
              error={formErrors.contact_phone}
            />
            <Input
              label="Email"
              placeholder="contact@clinic.com"
              value={newProspect.contact_email}
              onChange={e => updateField('contact_email', e.target.value)}
              error={formErrors.contact_email}
            />
          </div>
          <Select
            label="Initial Sales Stage"
            value={newProspect.sales_status}
            onChange={e => updateField('sales_status', e.target.value as SalesStatus)}
            options={[
              { label: 'Contacted', value: 'contacted' },
              { label: 'Demo Scheduled', value: 'demo_scheduled' },
              { label: 'Proposal Sent', value: 'proposal_sent' },
              { label: 'Negotiating', value: 'negotiating' },
            ]}
          />
          <Input
            label="Next Action"
            placeholder="e.g. Conduct Google Meet live demo on Friday 3 PM"
            value={newProspect.next_action}
            onChange={e => updateField('next_action', e.target.value)}
          />
          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsAddOpen(false);
                setFormErrors({});
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Prospect
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
