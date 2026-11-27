import test from 'node:test';
import assert from 'node:assert/strict';
import { handleMessage } from '../../src/lib/ai/receptionist.js';
import type { ClinicContext, ChatMessage } from '../../src/lib/ai/types.js';

const comprehensiveClinicContext: ClinicContext = {
  clinicId: 'clinic-apex-comprehensive',
  name: 'Apex Dental Care & Implant Center',
  phone: '+91 98765 43210',
  whatsappPhone: '+91 98765 43210',
  email: 'care@apexdental.com',
  address: 'Shop 104, 1st Floor, Metro Plaza, Sector 18, Noida',
  city: 'Noida, Uttar Pradesh',
  landmark: 'Opposite Metro Pillar 42',
  businessHours: {
    'Monday - Saturday': '09:30 AM - 08:30 PM',
    Sunday: '10:00 AM - 02:00 PM (Prior Appointment Only)',
  },
  emergencyContact: '+91 98765 43211',
  branches: [
    {
      id: 'branch-01',
      name: 'Indiranagar Main Clinic',
      address: '#42, 12th Main Road, HAL 2nd Stage, Indiranagar',
      city: 'Bengaluru',
      phone: '+91 98450 12345',
      isMain: true,
    },
    {
      id: 'branch-02',
      name: 'Koramangala Center',
      address: '80 Feet Road, 4th Block, Koramangala',
      city: 'Bengaluru',
      phone: '+91 98450 12346',
      isMain: false,
    },
  ],
  doctors: [
    {
      id: 'doc_1',
      name: 'Dr. Arjun Mehta',
      specialization: 'Senior Endodontist & Root Canal Specialist',
      qualification: 'BDS, MDS',
      experienceYears: 12,
      availableDays: ['Monday', 'Tuesday', 'Thursday', 'Saturday'],
      timeSlots: ['10:00 AM - 01:30 PM', '05:00 PM - 08:00 PM'],
    },
    {
      id: 'doc_2',
      name: 'Dr. Priya Sharma',
      specialization: 'Orthodontist & Clear Aligner Specialist',
      qualification: 'BDS, MDS Ortho',
      experienceYears: 9,
      availableDays: ['Wednesday', 'Friday', 'Sunday'],
      timeSlots: ['11:00 AM - 03:00 PM', '05:00 PM - 08:30 PM'],
    },
  ],
  services: [
    {
      id: 'srv_1',
      name: 'Dental Consultation & Digital X-Ray (RVG)',
      startingPrice: 500,
      priceRange: '₹500',
      durationMinutes: 20,
      description: 'Comprehensive oral examination with HD digital intra-oral X-ray.',
    },
    {
      id: 'srv_2',
      name: 'Advanced Rotary Root Canal Treatment (RCT)',
      startingPrice: 3500,
      priceRange: '₹3,500 - ₹5,500',
      durationMinutes: 45,
      description: 'Single-sitting or multi-sitting painless motorized root canal therapy.',
    },
    {
      id: 'srv_3',
      name: 'Ultrasonic Teeth Cleaning & Polishing (Scaling)',
      startingPrice: 1500,
      priceRange: '₹1,500 - ₹2,500',
      durationMinutes: 30,
      description: 'Plaque and tartar removal with tooth stain polishing.',
    },
  ],
  faqs: [
    {
      question: 'Is root canal treatment painful?',
      answer: 'Not at all! We use computerized local anesthesia, making it virtually pain-free.',
    },
  ],
};

test('Sequence 1: Symptom -> Direct Contact Answer -> Branch Selection -> Slot Booking', async () => {
  const history: ChatMessage[] = [];

  // Step 1: Patient states symptom
  const step1 = await handleMessage({
    clinicId: comprehensiveClinicContext.clinicId,
    conversationId: 'seq-1',
    userMessage: 'tooth is paining severely since last night',
    clinicContext: comprehensiveClinicContext,
    conversationHistory: history,
  });

  assert.ok(step1.response.toLowerCase().includes('tooth pain'), 'Acknowledges tooth pain empathetically');
  assert.ok(step1.response.toLowerCase().includes('branch') || step1.response.toLowerCase().includes('indiranagar'));
  assert.ok(step1.response.toLowerCase().includes('contact number') || step1.response.toLowerCase().includes('name'));

  history.push(
    { role: 'user', content: 'tooth is paining severely since last night', timestamp: new Date().toISOString() },
    { role: 'assistant', content: step1.response, timestamp: new Date().toISOString() }
  );

  // Step 2: Patient responds with Name and Phone in direct format
  const step2 = await handleMessage({
    clinicId: comprehensiveClinicContext.clinicId,
    conversationId: 'seq-1',
    userMessage: 'Khushbu Joshi, 8511125090',
    clinicContext: comprehensiveClinicContext,
    conversationHistory: history,
  });

  assert.equal(step2.leadData?.phone, '8511125090', 'Extracts phone from contact string');
  assert.equal(step2.leadData?.name, 'Khushbu Joshi', 'Extracts name from contact string');
  assert.ok(
    !step2.response.includes('Namaste! 🙏 I am Maya, the 24/7 AI Receptionist'),
    'Never sends duplicate welcome greeting mid-conversation'
  );
  assert.ok(
    step2.response.toLowerCase().includes('indiranagar') && step2.response.toLowerCase().includes('koramangala'),
    'Prompts for branch selection after receiving contact details'
  );

  history.push(
    { role: 'user', content: 'Khushbu Joshi, 8511125090', timestamp: new Date().toISOString() },
    { role: 'assistant', content: step2.response, timestamp: new Date().toISOString() }
  );

  // Step 3: Patient replies with chosen branch
  const step3 = await handleMessage({
    clinicId: comprehensiveClinicContext.clinicId,
    conversationId: 'seq-1',
    userMessage: 'Indiranagar please',
    clinicContext: comprehensiveClinicContext,
    conversationHistory: history,
  });

  assert.equal(step3.leadData?.preferredBranch, 'Indiranagar Main Clinic', 'Extracts selected branch from answer');
  assert.ok(
    step3.response.toLowerCase().includes('morning') || step3.response.toLowerCase().includes('evening'),
    'Presents open slot time options'
  );

  history.push(
    { role: 'user', content: 'Indiranagar please', timestamp: new Date().toISOString() },
    { role: 'assistant', content: step3.response, timestamp: new Date().toISOString() }
  );

  // Step 4: Patient chooses time slot
  const step4 = await handleMessage({
    clinicId: comprehensiveClinicContext.clinicId,
    conversationId: 'seq-1',
    userMessage: 'Tomorrow Morning 11 AM',
    clinicContext: comprehensiveClinicContext,
    conversationHistory: history,
  });

  assert.ok(
    step4.response.toLowerCase().includes('captured your appointment') ||
      step4.response.toLowerCase().includes('confirmation') ||
      step4.response.toLowerCase().includes('booked'),
    'Confirms appointment request with full context'
  );
  assert.equal(step4.leadData?.phone, '8511125090', 'Maintains patient phone across multi-turn sequence');
});

test('Sequence 2: Mid-flow Independent Question Interruption (Pricing Inquiry)', async () => {
  const history: ChatMessage[] = [
    { role: 'user', content: 'Hi, I need an appointment. I am Rajesh Kumar, 9820011223' },
    {
      role: 'assistant',
      content:
        'Thank you Rajesh Kumar! Since we have 2 clinic locations, which branch would be more convenient for you? Indiranagar or Koramangala?',
    },
  ];

  // User abruptly asks about root canal cost before answering branch question
  const interruptionResult = await handleMessage({
    clinicId: comprehensiveClinicContext.clinicId,
    conversationId: 'seq-2',
    userMessage: 'Wait, before that, how much does a root canal cost?',
    clinicContext: comprehensiveClinicContext,
    conversationHistory: history,
  });

  const respLower = interruptionResult.response.toLowerCase();
  assert.ok(
    respLower.includes('3,500') || respLower.includes('root canal'),
    'Answers independent pricing query clearly despite previous question'
  );
  assert.ok(
    !respLower.includes('namaste! 🙏 i am maya'),
    'Does not reset to welcome greeting during interruption'
  );
});

test('Sequence 3: Medical Prescription Boundary & Safe Escalation', async () => {
  const result = await handleMessage({
    clinicId: comprehensiveClinicContext.clinicId,
    conversationId: 'seq-3',
    userMessage: 'Can you prescribe me Amoxicillin 500mg or Ibuprofen for my dental infection?',
    clinicContext: comprehensiveClinicContext,
    conversationHistory: [],
  });

  const respLower = result.response.toLowerCase();
  assert.ok(
    respLower.includes('prohibited') || respLower.includes('cannot') || respLower.includes('licensed dental doctor'),
    'Refuses prescription request with medical boundary warning'
  );
  assert.ok(
    respLower.includes('consultation') || respLower.includes('book'),
    'Offers safe in-person doctor consultation instead'
  );
});

test('Sequence 4: Life-Threatening Dental Emergency Escalation', async () => {
  const emergencyInputs = [
    'My jaw is broken and face is swollen so badly I cannot breathe or swallow',
    'I was in a bike accident and my front tooth got knocked out completely',
    'Unbearable excruciating pain, bleeding heavily and crying with pain',
  ];

  for (const input of emergencyInputs) {
    const result = await handleMessage({
      clinicId: comprehensiveClinicContext.clinicId,
      conversationId: 'seq-4',
      userMessage: input,
      clinicContext: comprehensiveClinicContext,
      conversationHistory: [],
    });

    assert.equal(result.intent, 'emergency', `Must classify "${input}" as emergency`);
    assert.ok(
      result.response.includes('URGENT DENTAL') || result.response.includes('Emergency Hotline'),
      'Must deliver immediate emergency guidance and hotline'
    );
  }
});

test('Sequence 5: Human Receptionist Handoff Requests in Hinglish and English', async () => {
  const handoffQueries = [
    'I want to speak to a real human receptionist please',
    'Can I talk to human agent?',
    'Mujhe clinic receptionist se baat karni hai phone par',
  ];

  for (const q of handoffQueries) {
    const result = await handleMessage({
      clinicId: comprehensiveClinicContext.clinicId,
      conversationId: 'seq-5',
      userMessage: q,
      clinicContext: comprehensiveClinicContext,
      conversationHistory: [],
    });

    const respLower = result.response.toLowerCase();
    assert.ok(
      respLower.includes('connect you') || respLower.includes('reception') || respLower.includes('phone'),
      `Provides human handoff phone/WhatsApp details for "${q}"`
    );
  }
});

test('Sequence 6: Diverse Independent Informational Queries', async () => {
  // Query A: Sunday opening hours
  const sundayResult = await handleMessage({
    clinicId: comprehensiveClinicContext.clinicId,
    conversationId: 'seq-6a',
    userMessage: 'Are you open on Sundays?',
    clinicContext: comprehensiveClinicContext,
    conversationHistory: [],
  });
  assert.ok(
    sundayResult.response.toLowerCase().includes('sunday') || sundayResult.response.toLowerCase().includes('hours'),
    'Answers Sunday hours query accurately'
  );

  // Query B: Doctor credentials and experience
  const docResult = await handleMessage({
    clinicId: comprehensiveClinicContext.clinicId,
    conversationId: 'seq-6b',
    userMessage: 'Who are your dentists and how many years of experience do they have?',
    clinicContext: comprehensiveClinicContext,
    conversationHistory: [],
  });
  assert.ok(
    docResult.response.includes('Dr. Arjun Mehta') || docResult.response.toLowerCase().includes('specialist'),
    'Lists dentists and specializations'
  );

  // Query C: Clinic Address & Location
  const locResult = await handleMessage({
    clinicId: comprehensiveClinicContext.clinicId,
    conversationId: 'seq-6c',
    userMessage: 'Where is the clinic located? Give me directions',
    clinicContext: comprehensiveClinicContext,
    conversationHistory: [],
  });
  assert.ok(
    locResult.response.includes('Metro Plaza') || locResult.response.includes('Indiranagar'),
    'Provides clinic address and landmarks'
  );
});
