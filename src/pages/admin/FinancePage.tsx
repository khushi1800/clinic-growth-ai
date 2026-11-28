import React, { useState } from 'react';
import {
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/Table';
import { StatCard } from '@/components/ui/StatCard';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useMockData } from '@/hooks/useMockData';
import type { FinanceType } from '@/types/enums';

export const FinancePage: React.FC = () => {
  const { financeRecords, addFinanceRecord } = useMockData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEntry, setNewEntry] = useState({
    type: 'revenue_recurring' as FinanceType,
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const updateField = (field: string, value: string) => {
    setNewEntry(prev => ({ ...prev, [field]: value }));
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
    const parsed = parseFloat(newEntry.amount);
    if (!newEntry.amount.trim()) {
      errs.amount = 'Amount is required';
    } else if (isNaN(parsed) || parsed <= 0) {
      errs.amount = 'Amount must be a positive number';
    }

    if (!newEntry.description.trim()) {
      errs.description = 'Description is required';
    } else if (newEntry.description.trim().length < 3) {
      errs.description = 'Description must be at least 3 characters';
    }

    if (!newEntry.date) {
      errs.date = 'Date is required';
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const totalRevenue = financeRecords
    .filter(r => r.type.startsWith('revenue'))
    .reduce((sum, r) => sum + r.amount, 0);

  const totalExpenses = financeRecords
    .filter(r => r.type.startsWith('expense'))
    .reduce((sum, r) => sum + r.amount, 0);

  const netCashFlow = totalRevenue - totalExpenses;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    addFinanceRecord({
      type: newEntry.type,
      amount: parseFloat(newEntry.amount),
      description: newEntry.description.trim(),
      date: newEntry.date,
      customer_id: null,
    });
    setIsModalOpen(false);
    setNewEntry({
      type: 'revenue_recurring',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
    });
    setFormErrors({});
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900">
              Finance & Cash Flow Tracker
            </h1>
            <Badge variant="primary" size="sm">NOVEMBER 2026</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real cash flow, SaaS subscription receipts, API consumption, and infra operational costs
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          Add Financial Record
        </Button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Invoiced Revenue"
          value={`₹${totalRevenue.toLocaleString('en-IN')}`}
          change="+19.4% MoM"
          isPositive={true}
          subtitle="Monthly SaaS clinic receipts"
          icon={<ArrowUpRight className="w-5 h-5 text-emerald-600" />}
          iconBg="bg-emerald-50"
        />
        <StatCard
          title="Infrastructure & API Costs"
          value={`₹${totalExpenses.toLocaleString('en-IN')}`}
          change="₹15,200 total load"
          isPositive={false}
          subtitle="WhatsApp Cloud + Gemini API + Cloud"
          icon={<ArrowDownLeft className="w-5 h-5 text-red-600" />}
          iconBg="bg-red-50"
        />
        <StatCard
          title="Net Cash Margin"
          value={`₹${netCashFlow.toLocaleString('en-IN')}`}
          change="80.2% Net Margin"
          isPositive={true}
          subtitle="High capital efficiency model"
          icon={<Layers className="w-5 h-5 text-blue-600" />}
          iconBg="bg-blue-50"
        />
      </div>

      {/* Financial Ledger Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-bold">Transaction Ledger</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount (INR)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {financeRecords.map(item => {
                const isRevenue = item.type.startsWith('revenue');
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <span className="text-xs text-slate-600 font-medium">{item.date}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={isRevenue ? 'success' : 'danger'} size="sm" dot>
                        {isRevenue ? 'Revenue' : 'Expense'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-semibold text-slate-800">
                        {item.description}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={`text-xs font-bold ${
                          isRevenue ? 'text-emerald-600' : 'text-red-600'
                        }`}
                      >
                        {isRevenue ? '+' : '-'} ₹{item.amount.toLocaleString('en-IN')}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFormErrors({});
        }}
        title="Add Finance Entry"
        description="Log an operational expense or subscription invoice receipt."
        size="md"
      >
        <form onSubmit={handleCreate} className="space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Type"
              value={newEntry.type}
              onChange={e => updateField('type', e.target.value as FinanceType)}
              options={[
                { label: 'Recurring Subscription Revenue', value: 'revenue_recurring' },
                { label: 'One-Time Setup Fee Revenue', value: 'revenue_setup' },
                { label: 'API Consumption Expense (LLM/WhatsApp)', value: 'expense_api' },
                { label: 'Software & Cloud Infrastructure Expense', value: 'expense_software' },
              ]}
            />
            <Input
              label="Amount in ₹ *"
              type="number"
              placeholder="e.g. 19999"
              value={newEntry.amount}
              onChange={e => updateField('amount', e.target.value)}
              error={formErrors.amount}
              required
            />
          </div>

          <Input
            label="Description *"
            placeholder="e.g. Meta WhatsApp Cloud API November bill"
            value={newEntry.description}
            onChange={e => updateField('description', e.target.value)}
            error={formErrors.description}
            required
          />

          <Input
            label="Transaction Date *"
            type="date"
            value={newEntry.date}
            onChange={e => updateField('date', e.target.value)}
            error={formErrors.date}
            required
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
              Save Entry
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
