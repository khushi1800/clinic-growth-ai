import React, { useState } from 'react';
import { Clock, Plus, Zap, MessageSquare, CheckCircle2, Power } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useMockData } from '@/hooks/useMockData';

export const FollowUpRulesPage: React.FC = () => {
  const { followUpRules } = useMockData();
  const [rules, setRules] = useState(followUpRules);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRule, setNewRule] = useState({
    name: '',
    trigger_event: 'lead_interested_unbooked',
    delay_hours: 24,
    channel: 'whatsapp',
    message_template: 'Hi {{name}}, we noticed you enquired about our dental treatments. Would you like to schedule a consultation?',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const updateField = (field: string, value: any) => {
    setNewRule(prev => ({ ...prev, [field]: value }));
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
    if (!newRule.name.trim()) {
      errs.name = 'Rule name is required';
    } else if (newRule.name.trim().length < 3) {
      errs.name = 'Rule name must be at least 3 characters';
    }

    if (!newRule.message_template.trim()) {
      errs.message_template = 'Message template is required';
    } else if (newRule.message_template.trim().length < 10) {
      errs.message_template = 'Message template must be at least 10 characters';
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const toggleRule = (id: string) => {
    setRules(prev =>
      prev.map(r => (r.id === id ? { ...r, is_active: !r.is_active } : r))
    );
  };

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const ruleObj: any = {
      ...newRule,
      id: `rule-${Date.now()}`,
      clinic_id: 'clinic-demo-01',
      is_active: true,
      max_attempts: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setRules(prev => [...prev, ruleObj]);
    setIsModalOpen(false);
    setNewRule({
      name: '',
      trigger_event: 'lead_interested_unbooked',
      delay_hours: 24,
      channel: 'whatsapp',
      message_template: '',
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
              Automated Follow-Up Rules Engine
            </h1>
            <Badge variant="primary" size="sm">PREMIUM WORKFLOWS</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automate patient recovery, pre-appointment reminders, and post-procedure Google reviews via WhatsApp
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          Create Automation Rule
        </Button>
      </div>

      {/* Rules Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rules.map(rule => (
          <Card
            key={rule.id}
            className={`border transition-all ${
              rule.is_active ? 'border-blue-200 bg-white shadow-xs' : 'border-slate-200 bg-slate-50 opacity-75'
            }`}
          >
            <CardHeader className="flex flex-row items-start justify-between pb-3">
              <div>
                <Badge
                  variant={rule.is_active ? 'success' : 'gray'}
                  size="sm"
                  dot
                >
                  {rule.is_active ? 'Active Automation' : 'Paused'}
                </Badge>
                <CardTitle className="text-sm font-bold mt-2">{rule.name}</CardTitle>
              </div>

              <button
                onClick={() => toggleRule(rule.id)}
                className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors ${
                  rule.is_active
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                <span>{rule.is_active ? 'Enabled' : 'Disabled'}</span>
              </button>
            </CardHeader>

            <CardContent className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px]">
                <div>
                  <span className="text-slate-400 block">Trigger Condition</span>
                  <span className="font-bold text-slate-800">{rule.trigger_event}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Dispatch Delay</span>
                  <span className="font-bold text-slate-800">
                    {rule.delay_hours === 0 ? 'Instant (0 hours)' : `${rule.delay_hours} hours after event`}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 text-[11px] font-semibold block mb-1">
                  WhatsApp Message Template:
                </span>
                <p className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 italic leading-relaxed text-[11px]">
                  "{rule.message_template}"
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Rule Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFormErrors({});
        }}
        title="Create Automated Follow-up Trigger"
        description="Set up automatic WhatsApp notifications based on lead and appointment actions."
        size="md"
      >
        <form onSubmit={handleCreateRule} className="space-y-4" noValidate>
          <Input
            label="Rule Name *"
            placeholder="e.g. 24h Missed Call WhatsApp Check-in"
            value={newRule.name}
            onChange={e => updateField('name', e.target.value)}
            error={formErrors.name}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Trigger Event"
              value={newRule.trigger_event}
              onChange={e => updateField('trigger_event', e.target.value)}
              options={[
                { label: 'Unbooked Lead (24h inactive)', value: 'lead_interested_unbooked' },
                { label: 'After-Hours Missed Call', value: 'new_lead_after_hours' },
                { label: 'Appointment Completed', value: 'appointment_completed' },
                { label: 'No-Show Patient Follow-up', value: 'appointment_no_show' },
              ]}
            />

            <Input
              label="Delay (hours)"
              type="number"
              min="0"
              max="72"
              value={newRule.delay_hours}
              onChange={e => updateField('delay_hours', parseInt(e.target.value) || 0)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase text-slate-700 block mb-1.5">
              WhatsApp Message Template (supports {'{{name}}'}, {'{{doctor}}'})
            </label>
            <textarea
              rows={3}
              placeholder="Hi {{name}}, this is Dr. {{doctor}}'s clinic..."
              value={newRule.message_template}
              onChange={e => updateField('message_template', e.target.value)}
              className={`w-full p-3 text-xs rounded-lg border focus:outline-none focus:ring-1 ${
                formErrors.message_template
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50/20'
                  : 'border-slate-300 focus:ring-blue-500'
              }`}
              required
            />
            {formErrors.message_template && (
              <p className="text-[11px] text-red-600 mt-1">{formErrors.message_template}</p>
            )}
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
              Activate Rule
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
