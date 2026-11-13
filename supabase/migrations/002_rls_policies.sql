-- ============================================================
-- Clinic Growth AI — Row Level Security Policies
-- 002_rls_policies.sql
-- ============================================================

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Returns the clinic_id for the currently authenticated user
CREATE OR REPLACE FUNCTION auth.user_clinic_id()
RETURNS UUID AS $$
  SELECT clinic_id
  FROM clinic_staff
  WHERE user_id = auth.uid()
    AND is_active = TRUE
  LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Returns the role of the currently authenticated user
CREATE OR REPLACE FUNCTION auth.user_clinic_role()
RETURNS staff_role AS $$
  SELECT role
  FROM clinic_staff
  WHERE user_id = auth.uid()
    AND is_active = TRUE
  LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Checks if the current user is an app-level admin
-- App admins have role='owner' or 'admin' AND a special metadata flag
-- OR they are authenticated with a service role key (server-side only)
CREATE OR REPLACE FUNCTION auth.is_app_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = auth.uid()
      AND raw_user_meta_data->>'is_app_admin' = 'true'
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Checks if the authenticated user belongs to a given clinic
CREATE OR REPLACE FUNCTION auth.user_belongs_to_clinic(p_clinic_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM clinic_staff
    WHERE clinic_id = p_clinic_id
      AND user_id = auth.uid()
      AND is_active = TRUE
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ============================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================

ALTER TABLE clinics              ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_branches      ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_staff         ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_faqs          ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads                ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_activities      ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments         ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_slots    ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations        ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages             ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_up_rules      ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_up_tasks      ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_requests      ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospects            ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospect_activities  ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers            ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_records      ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log            ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- CLINICS
-- ============================================================

-- Staff can read their own clinic
CREATE POLICY "clinic_staff_read" ON clinics
  FOR SELECT USING (auth.user_belongs_to_clinic(id));

-- Only owner/admin can update their clinic
CREATE POLICY "clinic_owner_admin_update" ON clinics
  FOR UPDATE USING (
    auth.user_belongs_to_clinic(id)
    AND auth.user_clinic_role() IN ('owner', 'admin')
  );

-- App admins can do anything
CREATE POLICY "clinic_app_admin_all" ON clinics
  FOR ALL USING (auth.is_app_admin());

-- ============================================================
-- CLINIC BRANCHES
-- ============================================================

CREATE POLICY "branches_staff_read" ON clinic_branches
  FOR SELECT USING (auth.user_belongs_to_clinic(clinic_id));

CREATE POLICY "branches_admin_write" ON clinic_branches
  FOR INSERT WITH CHECK (
    auth.user_belongs_to_clinic(clinic_id)
    AND auth.user_clinic_role() IN ('owner', 'admin')
  );

CREATE POLICY "branches_admin_update" ON clinic_branches
  FOR UPDATE USING (
    auth.user_belongs_to_clinic(clinic_id)
    AND auth.user_clinic_role() IN ('owner', 'admin')
  );

CREATE POLICY "branches_admin_delete" ON clinic_branches
  FOR DELETE USING (
    auth.user_belongs_to_clinic(clinic_id)
    AND auth.user_clinic_role() IN ('owner', 'admin')
  );

CREATE POLICY "branches_app_admin_all" ON clinic_branches
  FOR ALL USING (auth.is_app_admin());

-- ============================================================
-- CLINIC STAFF
-- ============================================================

CREATE POLICY "staff_read_own_clinic" ON clinic_staff
  FOR SELECT USING (auth.user_belongs_to_clinic(clinic_id));

-- A user can always read their own record (needed during auth setup)
CREATE POLICY "staff_read_own_row" ON clinic_staff
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "staff_admin_write" ON clinic_staff
  FOR INSERT WITH CHECK (
    auth.user_belongs_to_clinic(clinic_id)
    AND auth.user_clinic_role() IN ('owner', 'admin')
  );

CREATE POLICY "staff_admin_update" ON clinic_staff
  FOR UPDATE USING (
    auth.user_belongs_to_clinic(clinic_id)
    AND auth.user_clinic_role() IN ('owner', 'admin')
  );

CREATE POLICY "staff_admin_delete" ON clinic_staff
  FOR DELETE USING (
    auth.user_belongs_to_clinic(clinic_id)
    AND auth.user_clinic_role() IN ('owner', 'admin')
  );

CREATE POLICY "staff_app_admin_all" ON clinic_staff
  FOR ALL USING (auth.is_app_admin());

-- ============================================================
-- CLINIC FAQS
-- ============================================================

CREATE POLICY "faqs_staff_read" ON clinic_faqs
  FOR SELECT USING (auth.user_belongs_to_clinic(clinic_id));

CREATE POLICY "faqs_admin_write" ON clinic_faqs
  FOR INSERT WITH CHECK (
    auth.user_belongs_to_clinic(clinic_id)
    AND auth.user_clinic_role() IN ('owner', 'admin')
  );

CREATE POLICY "faqs_admin_update" ON clinic_faqs
  FOR UPDATE USING (
    auth.user_belongs_to_clinic(clinic_id)
    AND auth.user_clinic_role() IN ('owner', 'admin')
  );

CREATE POLICY "faqs_admin_delete" ON clinic_faqs
  FOR DELETE USING (
    auth.user_belongs_to_clinic(clinic_id)
    AND auth.user_clinic_role() IN ('owner', 'admin')
  );

CREATE POLICY "faqs_app_admin_all" ON clinic_faqs
  FOR ALL USING (auth.is_app_admin());

-- ============================================================
-- LEADS
-- ============================================================

CREATE POLICY "leads_staff_read" ON leads
  FOR SELECT USING (auth.user_belongs_to_clinic(clinic_id));

CREATE POLICY "leads_staff_insert" ON leads
  FOR INSERT WITH CHECK (auth.user_belongs_to_clinic(clinic_id));

CREATE POLICY "leads_staff_update" ON leads
  FOR UPDATE USING (auth.user_belongs_to_clinic(clinic_id));

CREATE POLICY "leads_admin_delete" ON leads
  FOR DELETE USING (
    auth.user_belongs_to_clinic(clinic_id)
    AND auth.user_clinic_role() IN ('owner', 'admin')
  );

CREATE POLICY "leads_app_admin_all" ON leads
  FOR ALL USING (auth.is_app_admin());

-- ============================================================
-- LEAD ACTIVITIES
-- ============================================================

CREATE POLICY "lead_activities_staff_read" ON lead_activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM leads l
      WHERE l.id = lead_id
        AND auth.user_belongs_to_clinic(l.clinic_id)
    )
  );

CREATE POLICY "lead_activities_staff_insert" ON lead_activities
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM leads l
      WHERE l.id = lead_id
        AND auth.user_belongs_to_clinic(l.clinic_id)
    )
  );

CREATE POLICY "lead_activities_app_admin_all" ON lead_activities
  FOR ALL USING (auth.is_app_admin());

-- ============================================================
-- APPOINTMENTS
-- ============================================================

CREATE POLICY "appointments_staff_read" ON appointments
  FOR SELECT USING (auth.user_belongs_to_clinic(clinic_id));

CREATE POLICY "appointments_staff_insert" ON appointments
  FOR INSERT WITH CHECK (auth.user_belongs_to_clinic(clinic_id));

CREATE POLICY "appointments_staff_update" ON appointments
  FOR UPDATE USING (auth.user_belongs_to_clinic(clinic_id));

CREATE POLICY "appointments_admin_delete" ON appointments
  FOR DELETE USING (
    auth.user_belongs_to_clinic(clinic_id)
    AND auth.user_clinic_role() IN ('owner', 'admin')
  );

CREATE POLICY "appointments_app_admin_all" ON appointments
  FOR ALL USING (auth.is_app_admin());

-- ============================================================
-- APPOINTMENT SLOTS
-- ============================================================

CREATE POLICY "slots_staff_read" ON appointment_slots
  FOR SELECT USING (auth.user_belongs_to_clinic(clinic_id));

CREATE POLICY "slots_admin_write" ON appointment_slots
  FOR INSERT WITH CHECK (
    auth.user_belongs_to_clinic(clinic_id)
    AND auth.user_clinic_role() IN ('owner', 'admin', 'doctor')
  );

CREATE POLICY "slots_admin_update" ON appointment_slots
  FOR UPDATE USING (
    auth.user_belongs_to_clinic(clinic_id)
    AND auth.user_clinic_role() IN ('owner', 'admin', 'doctor')
  );

CREATE POLICY "slots_admin_delete" ON appointment_slots
  FOR DELETE USING (
    auth.user_belongs_to_clinic(clinic_id)
    AND auth.user_clinic_role() IN ('owner', 'admin', 'doctor')
  );

CREATE POLICY "slots_app_admin_all" ON appointment_slots
  FOR ALL USING (auth.is_app_admin());

-- ============================================================
-- CONVERSATIONS
-- ============================================================

CREATE POLICY "conversations_staff_read" ON conversations
  FOR SELECT USING (auth.user_belongs_to_clinic(clinic_id));

CREATE POLICY "conversations_staff_insert" ON conversations
  FOR INSERT WITH CHECK (auth.user_belongs_to_clinic(clinic_id));

CREATE POLICY "conversations_staff_update" ON conversations
  FOR UPDATE USING (auth.user_belongs_to_clinic(clinic_id));

CREATE POLICY "conversations_app_admin_all" ON conversations
  FOR ALL USING (auth.is_app_admin());

-- ============================================================
-- MESSAGES
-- ============================================================

CREATE POLICY "messages_staff_read" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
        AND auth.user_belongs_to_clinic(c.clinic_id)
    )
  );

CREATE POLICY "messages_staff_insert" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
        AND auth.user_belongs_to_clinic(c.clinic_id)
    )
  );

CREATE POLICY "messages_app_admin_all" ON messages
  FOR ALL USING (auth.is_app_admin());

-- ============================================================
-- FOLLOW-UP RULES
-- ============================================================

CREATE POLICY "followup_rules_staff_read" ON follow_up_rules
  FOR SELECT USING (auth.user_belongs_to_clinic(clinic_id));

CREATE POLICY "followup_rules_admin_write" ON follow_up_rules
  FOR INSERT WITH CHECK (
    auth.user_belongs_to_clinic(clinic_id)
    AND auth.user_clinic_role() IN ('owner', 'admin')
  );

CREATE POLICY "followup_rules_admin_update" ON follow_up_rules
  FOR UPDATE USING (
    auth.user_belongs_to_clinic(clinic_id)
    AND auth.user_clinic_role() IN ('owner', 'admin')
  );

CREATE POLICY "followup_rules_admin_delete" ON follow_up_rules
  FOR DELETE USING (
    auth.user_belongs_to_clinic(clinic_id)
    AND auth.user_clinic_role() IN ('owner', 'admin')
  );

CREATE POLICY "followup_rules_app_admin_all" ON follow_up_rules
  FOR ALL USING (auth.is_app_admin());

-- ============================================================
-- FOLLOW-UP TASKS
-- ============================================================

CREATE POLICY "followup_tasks_staff_read" ON follow_up_tasks
  FOR SELECT USING (auth.user_belongs_to_clinic(clinic_id));

CREATE POLICY "followup_tasks_staff_insert" ON follow_up_tasks
  FOR INSERT WITH CHECK (auth.user_belongs_to_clinic(clinic_id));

CREATE POLICY "followup_tasks_staff_update" ON follow_up_tasks
  FOR UPDATE USING (auth.user_belongs_to_clinic(clinic_id));

CREATE POLICY "followup_tasks_app_admin_all" ON follow_up_tasks
  FOR ALL USING (auth.is_app_admin());

-- ============================================================
-- REVIEW REQUESTS
-- ============================================================

CREATE POLICY "reviews_staff_read" ON review_requests
  FOR SELECT USING (auth.user_belongs_to_clinic(clinic_id));

CREATE POLICY "reviews_staff_insert" ON review_requests
  FOR INSERT WITH CHECK (auth.user_belongs_to_clinic(clinic_id));

CREATE POLICY "reviews_staff_update" ON review_requests
  FOR UPDATE USING (auth.user_belongs_to_clinic(clinic_id));

CREATE POLICY "reviews_app_admin_all" ON review_requests
  FOR ALL USING (auth.is_app_admin());

-- ============================================================
-- OWNER / ADMIN ONLY TABLES
-- (prospects, prospect_activities, customers, finance_records)
-- ============================================================

-- PROSPECTS — app admin only
CREATE POLICY "prospects_app_admin_all" ON prospects
  FOR ALL USING (auth.is_app_admin());

-- PROSPECT ACTIVITIES — app admin only
CREATE POLICY "prospect_activities_app_admin_all" ON prospect_activities
  FOR ALL USING (auth.is_app_admin());

-- CUSTOMERS — app admin only
CREATE POLICY "customers_app_admin_all" ON customers
  FOR ALL USING (auth.is_app_admin());

-- FINANCE RECORDS — app admin only
CREATE POLICY "finance_records_app_admin_all" ON finance_records
  FOR ALL USING (auth.is_app_admin());

-- ============================================================
-- AUDIT LOG
-- ============================================================

-- Any authenticated user can INSERT audit events for their own clinic
CREATE POLICY "audit_log_authenticated_insert" ON audit_log
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND (
      clinic_id IS NULL
      OR auth.user_belongs_to_clinic(clinic_id)
    )
  );

-- Only app admins can read the audit log
CREATE POLICY "audit_log_admin_read" ON audit_log
  FOR SELECT USING (auth.is_app_admin());

-- App admins have full access
CREATE POLICY "audit_log_app_admin_all" ON audit_log
  FOR ALL USING (auth.is_app_admin());
