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

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.name) return;
    addStaff(newMember);
    setIsModalOpen(false);
    setNewMember({ name: '', role: 'doctor', email: '', phone: '' });
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
        onClose={() => setIsModalOpen(false)}
        title="Add Staff or Specialist Doctor"
        description="Add a new clinician or front-desk receptionist to the clinic roster."
        size="md"
      >
        <form onSubmit={handleAdd} className="space-y-4">
          <Input
            label="Full Name & Degrees *"
            placeholder="e.g. Dr. Kavita Nair, MDS"
            value={newMember.name}
            onChange={e => setNewMember({ ...newMember, name: e.target.value })}
            required
          />

          <Select
            label="Role & Permissions *"
            value={newMember.role}
            onChange={e => setNewMember({ ...newMember, role: e.target.value as StaffRole })}
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
              onChange={e => setNewMember({ ...newMember, email: e.target.value })}
            />
            <Input
              label="Phone"
              placeholder="+91 98450..."
              value={newMember.phone}
              onChange={e => setNewMember({ ...newMember, phone: e.target.value })}
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
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
