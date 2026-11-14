// ============================================================
// Clinic Growth AI — Seed Demo Data
// src/api/seed.ts
// ============================================================
// All seeded data is clearly labeled [DEMO] and should only
// be run in development / staging environments.

import { supabase } from '../lib/supabase/client';

const DEMO_TAG = '[DEMO]';

/**
 * Seeds a complete demo clinic with leads, appointments, conversations,
 * follow-up rules, and business data.
 *
 * IMPORTANT: Only call this in dev/staging. All data is tagged [DEMO].
 */
export async function seedDemoData(): Promise<{ success: boolean; message: string }> {
  try {
    // ---- 1. Create Demo Clinic -----------------------------
    const { data: clinic, error: clinicError } = await supabase
      .from('clinics')
      .insert({
        name: `${DEMO_TAG} SmileCare Dental Clinic`,
        slug: 'demo-smilecare',
        phone: '+91-9876543210',
        email: 'demo@smilecare.in',
        website: 'https://smilecare.example.in',
        address: '42 MG Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        business_hours: {
          monday:    { open: '09:00', close: '18:00' },
          tuesday:   { open: '09:00', close: '18:00' },
          wednesday: { open: '09:00', close: '18:00' },
          thursday:  { open: '09:00', close: '18:00' },
          friday:    { open: '09:00', close: '18:00' },
          saturday:  { open: '10:00', close: '15:00' },
          sunday:    null,
        },
        settings: {
          currency: 'INR',
          timezone: 'Asia/Kolkata',
          demo: true,
        },
      })
      .select()
      .single();

    if (clinicError) throw new Error(`Clinic seed failed: ${clinicError.message}`);
    const clinicId = clinic.id;

    // ---- 2. Demo Branch ------------------------------------
    const { data: branch } = await supabase
      .from('clinic_branches')
      .insert({
        clinic_id: clinicId,
        name: `${DEMO_TAG} Main Branch`,
        address: '42 MG Road, Bengaluru',
        phone: '+91-9876543210',
        is_active: true,
      })
      .select()
      .single();

    // ---- 3. Demo FAQs --------------------------------------
    const faqs = [
      { question: 'What are your clinic hours?', answer: 'Mon–Fri 9am–6pm, Sat 10am–3pm', category: 'general' },
      { question: 'Do you accept walk-ins?', answer: 'Yes, but appointments are preferred to minimize wait time.', category: 'appointments' },
      { question: 'Which insurance plans do you accept?', answer: 'We accept Star Health, Niva Bupa, HDFC Ergo dental plans.', category: 'payments' },
      { question: 'How do I reschedule my appointment?', answer: 'Call us or WhatsApp at +91-9876543210 at least 24 hours before.', category: 'appointments' },
    ];

    await supabase.from('clinic_faqs').insert(
      faqs.map((f, i) => ({ ...f, clinic_id: clinicId, sort_order: i + 1, is_active: true }))
    );

    // ---- 4. Demo Leads -------------------------------------
    const leadNames = [
      { name: `${DEMO_TAG} Priya Sharma`, phone: '+91-9801234567', email: 'priya.demo@example.com', source: 'whatsapp', status: 'new' },
      { name: `${DEMO_TAG} Rahul Verma`, phone: '+91-9802345678', email: 'rahul.demo@example.com', source: 'website', status: 'contacted' },
      { name: `${DEMO_TAG} Anjali Singh`, phone: '+91-9803456789', email: 'anjali.demo@example.com', source: 'phone', status: 'appointment_requested' },
      { name: `${DEMO_TAG} Suresh Kumar`, phone: '+91-9804567890', email: 'suresh.demo@example.com', source: 'referral', status: 'converted' },
      { name: `${DEMO_TAG} Meera Nair`, phone: '+91-9805678901', email: 'meera.demo@example.com', source: 'ai_chat', status: 'interested' },
      { name: `${DEMO_TAG} Amit Patel`, phone: '+91-9806789012', email: 'amit.demo@example.com', source: 'walk_in', status: 'appointment_confirmed' },
    ];

    const { data: leads } = await supabase
      .from('leads')
      .insert(leadNames.map((l) => ({ ...l, clinic_id: clinicId })))
      .select();

    // ---- 5. Demo Appointments ------------------------------
    const today = new Date();
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    const dayAfter = new Date(today); dayAfter.setDate(today.getDate() + 2);

    if (leads && leads.length >= 3) {
      await supabase.from('appointments').insert([
        {
          clinic_id: clinicId,
          lead_id: leads[2].id,
          branch_id: branch?.id ?? null,
          appointment_date: tomorrow.toISOString().split('T')[0],
          appointment_time: '10:00:00',
          duration_minutes: 30,
          status: 'confirmed',
          notes: `${DEMO_TAG} Initial consultation`,
        },
        {
          clinic_id: clinicId,
          lead_id: leads[5].id,
          branch_id: branch?.id ?? null,
          appointment_date: dayAfter.toISOString().split('T')[0],
          appointment_time: '14:00:00',
          duration_minutes: 60,
          status: 'requested',
          notes: `${DEMO_TAG} Root canal consultation`,
        },
      ]);
    }

    // ---- 6. Demo Appointment Slots -------------------------
    const workDays = [1, 2, 3, 4, 5]; // Mon-Fri
    await supabase.from('appointment_slots').insert(
      workDays.map((day) => ({
        clinic_id: clinicId,
        branch_id: branch?.id ?? null,
        doctor_id: null,
        day_of_week: day,
        start_time: '09:00:00',
        end_time: '18:00:00',
        is_active: true,
      }))
    );

    // ---- 7. Demo Conversations + Messages ------------------
    if (leads && leads.length > 0) {
      const { data: conv } = await supabase
        .from('conversations')
        .insert({
          clinic_id: clinicId,
          lead_id: leads[0].id,
          channel: 'whatsapp',
          status: 'closed',
          ended_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (conv) {
        await supabase.from('messages').insert([
          { conversation_id: conv.id, role: 'user', content: 'Hi, I need to book an appointment for tooth pain.', metadata: {} },
          { conversation_id: conv.id, role: 'assistant', content: 'Hello! I can help with that. What date works best for you?', metadata: { demo: true } },
          { conversation_id: conv.id, role: 'user', content: 'Tomorrow morning if possible.', metadata: {} },
          { conversation_id: conv.id, role: 'assistant', content: 'We have slots at 10:00 AM and 11:30 AM tomorrow. Which would you prefer?', metadata: { demo: true } },
        ]);
      }
    }

    // ---- 8. Demo Follow-up Rules ---------------------------
    await supabase.from('follow_up_rules').insert([
      {
        clinic_id: clinicId,
        name: `${DEMO_TAG} New Lead Welcome`,
        trigger_event: 'lead_created',
        delay_hours: 1,
        message_template: 'Hi {{name}}, thanks for reaching out to SmileCare! We\'ll contact you within 1 hour. Reply to book your appointment.',
        channel: 'whatsapp',
        is_active: true,
        max_attempts: 1,
      },
      {
        clinic_id: clinicId,
        name: `${DEMO_TAG} Appointment Reminder`,
        trigger_event: 'appointment_confirmed',
        delay_hours: -24,
        message_template: 'Reminder: You have an appointment tomorrow at {{time}}. Reply YES to confirm or call us to reschedule.',
        channel: 'whatsapp',
        is_active: true,
        max_attempts: 1,
      },
      {
        clinic_id: clinicId,
        name: `${DEMO_TAG} Post-Visit Review Request`,
        trigger_event: 'appointment_completed',
        delay_hours: 2,
        message_template: 'Thank you for visiting SmileCare! We\'d love your feedback. Rate us: {{review_link}}',
        channel: 'whatsapp',
        is_active: true,
        max_attempts: 2,
      },
    ]);

    // ---- 9. Demo Prospect -----------------------------------
    const { data: prospect } = await supabase
      .from('prospects')
      .insert({
        clinic_name: `${DEMO_TAG} Bright Smile Dental`,
        location: 'Pune, Maharashtra',
        website: 'https://brightsmile.example.in',
        contact_phone: '+91-9900112233',
        contact_email: 'owner@brightsmile.example.in',
        source_url: 'https://practo.com/pune/dentist',
        research_date: today.toISOString().split('T')[0],
        qualification_score: 78,
        sales_status: 'contacted',
        last_interaction_at: today.toISOString(),
        next_action: 'Schedule product demo',
        notes: `${DEMO_TAG} 3-doctor clinic, good reviews, currently using manual WhatsApp`,
      })
      .select()
      .single();

    // ---- 10. Demo Customer & Finance ----------------------
    const { data: customer } = await supabase
      .from('customers')
      .insert({
        clinic_id: clinicId,
        prospect_id: prospect?.id ?? null,
        plan: 'standard',
        monthly_rate: 14999,
        setup_fee: 9999,
        start_date: today.toISOString().split('T')[0],
        trial_end_date: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'trial',
        health_score: 85,
        next_renewal: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      })
      .select()
      .single();

    if (customer) {
      await supabase.from('finance_records').insert([
        {
          type: 'revenue_setup',
          amount: 9999,
          description: `${DEMO_TAG} Setup fee — SmileCare Demo`,
          date: today.toISOString().split('T')[0],
          customer_id: customer.id,
        },
        {
          type: 'expense_software',
          amount: 2500,
          description: `${DEMO_TAG} Supabase monthly`,
          date: today.toISOString().split('T')[0],
          customer_id: null,
        },
        {
          type: 'expense_api',
          amount: 1200,
          description: `${DEMO_TAG} Gemini API usage`,
          date: today.toISOString().split('T')[0],
          customer_id: null,
        },
      ]);
    }

    return {
      success: true,
      message: `Demo data seeded successfully. Clinic ID: ${clinicId}`,
    };
  } catch (err) {
    return { success: false, message: String(err) };
  }
}

/**
 * Remove all demo data (rows where settings->>'demo' = 'true' or tagged [DEMO]).
 * Use with caution — permanently deletes demo records.
 */
export async function clearDemoData(): Promise<{ success: boolean; message: string }> {
  try {
    // Cascade deletes will remove child records
    const { error } = await supabase
      .from('clinics')
      .delete()
      .eq('slug', 'demo-smilecare');

    // Also clear owner-level demo data
    await supabase.from('prospects').delete().ilike('clinic_name', '%[DEMO]%');

    if (error) return { success: false, message: error.message };
    return { success: true, message: 'Demo data cleared.' };
  } catch (err) {
    return { success: false, message: String(err) };
  }
}
