import React, { useState } from 'react';
import {
  HelpCircle,
  Plus,
  Trash2,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useMockData } from '@/hooks/useMockData';

export const FAQPage: React.FC = () => {
  const { faqs, addFaq, deleteFaq } = useMockData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFaq, setNewFaq] = useState({
    question: '',
    answer: '',
    category: 'Treatments & Pricing',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const updateField = (field: string, value: string) => {
    setNewFaq(prev => ({ ...prev, [field]: value }));
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
    if (!newFaq.question.trim()) {
      errs.question = 'Patient question is required';
    } else if (newFaq.question.trim().length < 5) {
      errs.question = 'Question must be at least 5 characters';
    }

    if (!newFaq.answer.trim()) {
      errs.answer = 'Accurate AI answer is required';
    } else if (newFaq.answer.trim().length < 10) {
      errs.answer = 'Answer must be at least 10 characters to train AI properly';
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const filteredFaqs = faqs.filter(
    f =>
      f.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.category && f.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    addFaq({
      question: newFaq.question.trim(),
      answer: newFaq.answer.trim(),
      category: newFaq.category,
      sort_order: faqs.length + 1,
      is_active: true,
    });
    setIsModalOpen(false);
    setNewFaq({ question: '', answer: '', category: 'Treatments & Pricing' });
    setFormErrors({});
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900">
              AI Receptionist FAQ Knowledge Base
            </h1>
            <Badge variant="primary" size="sm">{faqs.length} CLINIC KNOWLEDGE ENTRIES</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Maya automatically trains on these answers to respond accurately to patient WhatsApp inquiries
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          Add FAQ Answer
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search questions or clinical topics..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* FAQ Cards List */}
      <div className="space-y-4">
        {filteredFaqs.map(faq => (
          <Card key={faq.id} className="border border-slate-200 hover:border-slate-300 transition-colors">
            <CardContent className="p-5 flex items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" size="sm">
                    {faq.category || 'General'}
                  </Badge>
                  <span className="text-[10px] text-slate-400">Sort Priority: #{faq.sort_order}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>{faq.question}</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {faq.answer}
                </p>
              </div>

              <button
                onClick={() => deleteFaq(faq.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                title="Delete FAQ"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add FAQ Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFormErrors({});
        }}
        title="Teach AI Receptionist New Answer"
        description="Provide clinic-specific answers to patient questions on WhatsApp."
        size="md"
      >
        <form onSubmit={handleAdd} className="space-y-4" noValidate>
          <Select
            label="Category"
            value={newFaq.category}
            onChange={e => updateField('category', e.target.value)}
            options={[
              { label: 'Treatments & Pricing', value: 'Treatments & Pricing' },
              { label: 'Clinic Timings & Appointments', value: 'Clinic Timings' },
              { label: 'Cosmetic & Aligners', value: 'Cosmetic' },
              { label: 'Post-Op Precautions', value: 'Post-Op' },
              { label: 'Insurance & Payment Modes', value: 'Insurance' },
            ]}
          />

          <Input
            label="Patient Question *"
            placeholder="e.g. Do you accept Bajaj Finserv health EMI cards?"
            value={newFaq.question}
            onChange={e => updateField('question', e.target.value)}
            error={formErrors.question}
            required
          />

          <div>
            <label className="text-xs font-semibold uppercase text-slate-700 block mb-1.5">
              Accurate AI Answer *
            </label>
            <textarea
              rows={4}
              placeholder="e.g. Yes, we provide 0% interest EMI options for treatments above ₹15,000 via Bajaj Finserv and major credit cards."
              value={newFaq.answer}
              onChange={e => updateField('answer', e.target.value)}
              className={`w-full p-3 text-xs rounded-lg border focus:outline-none focus:ring-1 ${
                formErrors.answer
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50/20'
                  : 'border-slate-300 focus:ring-blue-500'
              }`}
              required
            />
            {formErrors.answer && (
              <p className="text-[11px] text-red-600 mt-1">{formErrors.answer}</p>
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
              Save & Retrain AI
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
