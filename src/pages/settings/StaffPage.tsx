import React, { useState } from 'react';
import { UserCheck, Plus, Trash2, Mail, Phone, Shield, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/Table';
import { useMockData } from '@/hooks/useMockData';
import type { StaffRole } from '@/types/enums';

export const StaffPage: React.FC = () => {
  const { staff, addStaff } = useMockData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    role: 'doctor' as StaffRole,
    email: '',
    phone: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const updateField = (field: string, value: string) => {
    setNewMember(prev => ({ ...prev, [field]: value }));
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
    if (!newMember.name.trim()) {
      errs.name = 'Full name is required';
    } else if (newMember.name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters';
    }

    if (newMember.email && !/\S+@\S+\.\S+/.test(newMember.email.trim())) {
      errs.email = 'Please enter a valid email address';
    }

    if (newMember.phone) {
      const clean = newMember.phone.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
      if (!/^[6-9]\d{9}$/.test(clean)) {
        errs.phone = 'Please enter a valid 10-digit Indian phone number';
      }
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    addStaff(newMember);
    setIsModalOpen(false);
    setNewMember({ name: '', role: 'doctor', email: '', phone: '' });
    setFormErrors({});
  };

  const getRoleBadge = (role: string) => {
    const map: Record<string, { label: string; variant: BadgeVariant }> = {
      owner: { label: 'Owner / Chief Doctor', variant: 'purple' },
      doctor: { label: 'Specialist Dentist', variant: 'primary' },
      receptionist: { label: 'Front Desk Reception', variant: 'secondary' },
      admin: { label: 'Administrator', variant: 'gray' },
    };
    const c = map[role] || { label: role, variant: 'default' };
    return <Badge variant={c.variant} size="sm">{c.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900">
              Staff & Doctor Management
            </h1>
            <Badge variant="primary" size="sm">{staff.length} ACTIVE MEMBERS</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Assign doctors to appointment calendars and staff roles for lead dispatch
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          Add Team Member
        </Button>
      </div>

      {/* Staff Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Staff Member</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Contact Information</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {staff.map(member => (
            <TableRow key={member.id}>
              <TableCell>
                <p className="font-bold text-slate-900 text-xs flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  {member.name}
                </p>
              </TableCell>
              <TableCell>{getRoleBadge(member.role)}</TableCell>
              <TableCell>
                <div className="space-y-0.5 text-xs">
                  {member.email && (
                    <p className="text-slate-600 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" /> {member.email}
                    </p>
                  )}
                  {member.phone && (
                    <p className="text-slate-600 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" /> {member.phone}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={member.is_active ? 'success' : 'gray'} size="sm" dot>
                  {member.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" className="text-xs text-slate-600">
                  Edit Role
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Add Staff Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFormErrors({});
        }}
        title="Add Staff or Specialist Doctor"
        description="Add a new clinician or front-desk receptionist to the clinic roster."
        size="md"
      >
        <form onSubmit={handleAdd} className="space-y-4" noValidate>
          <Input
            label="Full Name & Degrees *"
            placeholder="e.g. Dr. Kavita Nair, MDS"
            value={newMember.name}
            onChange={e => updateField('name', e.target.value)}
            error={formErrors.name}
            required
          />

          <Select
            label="Role & Permissions *"
            value={newMember.role}
            onChange={e => updateField('role', e.target.value)}
            options={[
              { label: 'Doctor / Specialist (Appointment Calendar)', value: 'doctor' },
              { label: 'Receptionist / Front Desk (Leads & Appointments)', value: 'receptionist' },
              { label: 'Clinic Owner / Director (Full Access)', value: 'owner' },
              { label: 'Administrator', value: 'admin' },
            ]}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Email"
              type="email"
              placeholder="kavita@smiledentalcare.demo"
              value={newMember.email}
              onChange={e => updateField('email', e.target.value)}
              error={formErrors.email}
            />
            <Input
              label="Phone"
              placeholder="+91 98450..."
              value={newMember.phone}
              onChange={e => updateField('phone', e.target.value)}
              error={formErrors.phone}
            />
          </div>

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
              Save Member
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
