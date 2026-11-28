-- ============================================================
-- Clinic Growth AI — Row Level Security Policies
-- 002_rls_policies.sql
-- ============================================================
-- Security model (see docs/engineering-roadmap.md, Milestone 1):
--   * Tenant = clinic. One active clinic per user (enforced by a unique index in 001).
--   * Helper functions live in schema "private" (NOT "auth": hosted Supabase does
--     not allow creating objects there). They are SECURITY DEFINER with a fixed
--     search_path and are executable by "authenticated" only.
--   * Platform admin = row in public.platform_admins. NEVER user metadata, which
--     any user can set at signup.
--   * All policies are TO authenticated. The "anon" role has no table privileges.
--   * Clinics are created only through the create_clinic_with_owner() RPC.
-- ============================================================

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated;

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Returns the clinic_id for the currently authenticated user
CREATE OR REPLACE FUNCTION private.user_clinic_id()
RETURNS UUID AS $$
  SELECT clinic_id
  FROM public.clinic_staff
  WHERE user_id = auth.uid()
    AND is_active = TRUE
  LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = '';

-- Returns the role of the currently authenticated user
CREATE OR REPLACE FUNCTION private.user_clinic_role()
RETURNS public.staff_role AS $$
  SELECT role
  FROM public.clinic_staff
  WHERE user_id = auth.uid()
    AND is_active = TRUE
  LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = '';

-- Platform (SaaS owner) admin check. Source of truth: public.platform_admins,
-- which clients cannot read or write (RLS enabled, no policies, privileges revoked).
CREATE OR REPLACE FUNCTION private.is_app_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.platform_admins
    WHERE user_id = auth.uid()
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = '';

-- Checks if the authenticated user belongs to a given clinic
CREATE OR REPLACE FUNCTION private.user_belongs_to_clinic(p_clinic_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.clinic_staff
    WHERE clinic_id = p_clinic_id
      AND user_id = auth.uid()
      AND is_active = TRUE
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = '';

REVOKE ALL ON FUNCTION private.user_clinic_id()              FROM PUBLIC;
REVOKE ALL ON FUNCTION private.user_clinic_role()            FROM PUBLIC;
REVOKE ALL ON FUNCTION private.is_app_admin()                FROM PUBLIC;
REVOKE ALL ON FUNCTION private.user_belongs_to_clinic(UUID)  FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.user_clinic_id()             TO authenticated;
GRANT EXECUTE ON FUNCTION private.user_clinic_role()           TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_app_admin()               TO authenticated;
GRANT EXECUTE ON FUNCTION private.user_belongs_to_clinic(UUID) TO authenticated;

-- ============================================================
-- PRIVILEGE HYGIENE
-- ============================================================
-- Supabase grants table privileges to anon/authenticated by default. The anon
-- role must never touch tenant tables (public chat/lead capture will go through
-- server-side Edge Functions in Milestone 3, not direct table access).
REVOKE ALL ON ALL TABLES    IN SCHEMA public FROM anon;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES    FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON FUNCTIONS FROM anon;

-- platform_admins: no client access at all (read only via private.is_app_admin()
-- and public.is_platform_admin()). Rows are added by the Founder in the SQL editor.
REVOKE ALL ON public.platform_admins FROM anon, authenticated;

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
ALTER TABLE platform_admins      ENABLE ROW LEVEL SECURITY;  -- no policies: denied to all clients

-- ============================================================
-- CLINICS
-- ============================================================

-- Staff can read their own clinic
CREATE POLICY "clinic_staff_read" ON clinics
  FOR SELECT TO authenticated USING (private.user_belongs_to_clinic(id));

-- Only owner/admin can update their clinic
CREATE POLICY "clinic_owner_admin_update" ON clinics
  FOR UPDATE TO authenticated USING (
    private.user_belongs_to_clinic(id)
    AND private.user_clinic_role() IN ('owner', 'admin')
  );

-- App admins can do anything
CREATE POLICY "clinic_app_admin_all" ON clinics
  FOR ALL TO authenticated USING (private.is_app_admin());

-- ============================================================
-- CLINIC BRANCHES
-- ============================================================

CREATE POLICY "branches_staff_read" ON clinic_branches
  FOR SELECT TO authenticated USING (private.user_belongs_to_clinic(clinic_id));

CREATE POLICY "branches_admin_write" ON clinic_branches
  FOR INSERT TO authenticated WITH CHECK (
    private.user_belongs_to_clinic(clinic_id)
    AND private.user_clinic_role() IN ('owner', 'admin')
  );

CREATE POLICY "branches_admin_update" ON clinic_branches
  FOR UPDATE TO authenticated USING (
    private.user_belongs_to_clinic(clinic_id)
    AND private.user_clinic_role() IN ('owner', 'admin')
  );

CREATE POLICY "branches_admin_delete" ON clinic_branches
  FOR DELETE TO authenticated USING (
    private.user_belongs_to_clinic(clinic_id)
    AND private.user_clinic_role() IN ('owner', 'admin')
  );

CREATE POLICY "branches_app_admin_all" ON clinic_branches
  FOR ALL TO authenticated USING (private.is_app_admin());

-- ============================================================
-- CLINIC STAFF
-- ============================================================

CREATE POLICY "staff_read_own_clinic" ON clinic_staff
  FOR SELECT TO authenticated USING (private.user_belongs_to_clinic(clinic_id));

-- A user can always read their own record (needed during auth setup)
CREATE POLICY "staff_read_own_row" ON clinic_staff
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Role rules: an 'owner' may manage every role; an 'admin' may only manage
-- 'doctor' and 'receptionist' rows (cannot create or promote owners/admins).
-- Clients may NOT set user_id when inserting (linking a login to a staff row is
-- done by a server-side invite flow in Milestone 2); a trigger below also blocks
-- changing user_id / clinic_id on update.
CREATE POLICY "staff_admin_write" ON clinic_staff
  FOR INSERT TO authenticated WITH CHECK (
    private.user_belongs_to_clinic(clinic_id)
    AND user_id IS NULL
    AND (
      private.user_clinic_role() = 'owner'
      OR (private.user_clinic_role() = 'admin' AND role IN ('doctor', 'receptionist'))
    )
  );

CREATE POLICY "staff_admin_update" ON clinic_staff
  FOR UPDATE TO authenticated
  USING (
    private.user_belongs_to_clinic(clinic_id)
    AND (
      private.user_clinic_role() = 'owner'
      OR (private.user_clinic_role() = 'admin' AND role IN ('doctor', 'receptionist'))
    )
  )
  WITH CHECK (
    private.user_belongs_to_clinic(clinic_id)
    AND (
      private.user_clinic_role() = 'owner'
      OR (private.user_clinic_role() = 'admin' AND role IN ('doctor', 'receptionist'))
    )
  );

CREATE POLICY "staff_admin_delete" ON clinic_staff
  FOR DELETE TO authenticated USING (
    private.user_belongs_to_clinic(clinic_id)
    AND (
      private.user_clinic_role() = 'owner'
      OR (private.user_clinic_role() = 'admin' AND role IN ('doctor', 'receptionist'))
    )
  );

CREATE POLICY "staff_app_admin_all" ON clinic_staff
  FOR ALL TO authenticated USING (private.is_app_admin());

-- ============================================================
-- CLINIC FAQS
-- ============================================================

CREATE POLICY "faqs_staff_read" ON clinic_faqs
  FOR SELECT TO authenticated USING (private.user_belongs_to_clinic(clinic_id));

CREATE POLICY "faqs_admin_write" ON clinic_faqs
  FOR INSERT TO authenticated WITH CHECK (
    private.user_belongs_to_clinic(clinic_id)
    AND private.user_clinic_role() IN ('owner', 'admin')
  );

CREATE POLICY "faqs_admin_update" ON clinic_faqs
  FOR UPDATE TO authenticated USING (
    private.user_belongs_to_clinic(clinic_id)
    AND private.user_clinic_role() IN ('owner', 'admin')
  );

CREATE POLICY "faqs_admin_delete" ON clinic_faqs
  FOR DELETE TO authenticated USING (
    private.user_belongs_to_clinic(clinic_id)
    AND private.user_clinic_role() IN ('owner', 'admin')
  );

CREATE POLICY "faqs_app_admin_all" ON clinic_faqs
  FOR ALL TO authenticated USING (private.is_app_admin());

-- ============================================================
-- LEADS
-- ============================================================

CREATE POLICY "leads_staff_read" ON leads
  FOR SELECT TO authenticated USING (private.user_belongs_to_clinic(clinic_id));

CREATE POLICY "leads_staff_insert" ON leads
  FOR INSERT TO authenticated WITH CHECK (private.user_belongs_to_clinic(clinic_id));

CREATE POLICY "leads_staff_update" ON leads
  FOR UPDATE TO authenticated USING (private.user_belongs_to_clinic(clinic_id));

CREATE POLICY "leads_admin_delete" ON leads
  FOR DELETE TO authenticated USING (
    private.user_belongs_to_clinic(clinic_id)
    AND private.user_clinic_role() IN ('owner', 'admin')
  );

CREATE POLICY "leads_app_admin_all" ON leads
  FOR ALL TO authenticated USING (private.is_app_admin());

-- ============================================================
-- LEAD ACTIVITIES
-- ============================================================

CREATE POLICY "lead_activities_staff_read" ON lead_activities
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM leads l
      WHERE l.id = lead_id
        AND private.user_belongs_to_clinic(l.clinic_id)
    )
  );

CREATE POLICY "lead_activities_staff_insert" ON lead_activities
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM leads l
      WHERE l.id = lead_id
        AND private.user_belongs_to_clinic(l.clinic_id)
    )
  );

CREATE POLICY "lead_activities_app_admin_all" ON lead_activities
  FOR ALL TO authenticated USING (private.is_app_admin());

-- ============================================================
-- APPOINTMENTS
-- ============================================================

CREATE POLICY "appointments_staff_read" ON appointments
  FOR SELECT TO authenticated USING (private.user_belongs_to_clinic(clinic_id));

CREATE POLICY "appointments_staff_insert" ON appointments
  FOR INSERT TO authenticated WITH CHECK (private.user_belongs_to_clinic(clinic_id));

CREATE POLICY "appointments_staff_update" ON appointments
  FOR UPDATE TO authenticated USING (private.user_belongs_to_clinic(clinic_id));

CREATE POLICY "appointments_admin_delete" ON appointments
  FOR DELETE TO authenticated USING (
    private.user_belongs_to_clinic(clinic_id)
    AND private.user_clinic_role() IN ('owner', 'admin')
  );

CREATE POLICY "appointments_app_admin_all" ON appointments
  FOR ALL TO authenticated USING (private.is_app_admin());

-- ============================================================
-- APPOINTMENT SLOTS
-- ============================================================

CREATE POLICY "slots_staff_read" ON appointment_slots
  FOR SELECT TO authenticated USING (private.user_belongs_to_clinic(clinic_id));

CREATE POLICY "slots_admin_write" ON appointment_slots
  FOR INSERT TO authenticated WITH CHECK (
    private.user_belongs_to_clinic(clinic_id)
    AND private.user_clinic_role() IN ('owner', 'admin', 'doctor')
  );

CREATE POLICY "slots_admin_update" ON appointment_slots
  FOR UPDATE TO authenticated USING (
    private.user_belongs_to_clinic(clinic_id)
    AND private.user_clinic_role() IN ('owner', 'admin', 'doctor')
  );

CREATE POLICY "slots_admin_delete" ON appointment_slots
  FOR DELETE TO authenticated USING (
    private.user_belongs_to_clinic(clinic_id)
    AND private.user_clinic_role() IN ('owner', 'admin', 'doctor')
  );

CREATE POLICY "slots_app_admin_all" ON appointment_slots
  FOR ALL TO authenticated USING (private.is_app_admin());

-- ============================================================
-- CONVERSATIONS
-- ============================================================

CREATE POLICY "conversations_staff_read" ON conversations
  FOR SELECT TO authenticated USING (private.user_belongs_to_clinic(clinic_id));

CREATE POLICY "conversations_staff_insert" ON conversations
  FOR INSERT TO authenticated WITH CHECK (private.user_belongs_to_clinic(clinic_id));

CREATE POLICY "conversations_staff_update" ON conversations
  FOR UPDATE TO authenticated USING (private.user_belongs_to_clinic(clinic_id));

CREATE POLICY "conversations_app_admin_all" ON conversations
  FOR ALL TO authenticated USING (private.is_app_admin());

-- ============================================================
-- MESSAGES
-- ============================================================

CREATE POLICY "messages_staff_read" ON messages
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
        AND private.user_belongs_to_clinic(c.clinic_id)
    )
  );

CREATE POLICY "messages_staff_insert" ON messages
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
        AND private.user_belongs_to_clinic(c.clinic_id)
    )
  );

CREATE POLICY "messages_app_admin_all" ON messages
  FOR ALL TO authenticated USING (private.is_app_admin());

-- ============================================================
-- FOLLOW-UP RULES
-- ============================================================

CREATE POLICY "followup_rules_staff_read" ON follow_up_rules
  FOR SELECT TO authenticated USING (private.user_belongs_to_clinic(clinic_id));

CREATE POLICY "followup_rules_admin_write" ON follow_up_rules
  FOR INSERT TO authenticated WITH CHECK (
    private.user_belongs_to_clinic(clinic_id)
    AND private.user_clinic_role() IN ('owner', 'admin')
  );

CREATE POLICY "followup_rules_admin_update" ON follow_up_rules
  FOR UPDATE TO authenticated USING (
    private.user_belongs_to_clinic(clinic_id)
    AND private.user_clinic_role() IN ('owner', 'admin')
  );

CREATE POLICY "followup_rules_admin_delete" ON follow_up_rules
  FOR DELETE TO authenticated USING (
    private.user_belongs_to_clinic(clinic_id)
    AND private.user_clinic_role() IN ('owner', 'admin')
  );

CREATE POLICY "followup_rules_app_admin_all" ON follow_up_rules
  FOR ALL TO authenticated USING (private.is_app_admin());

-- ============================================================
-- FOLLOW-UP TASKS
-- ============================================================

CREATE POLICY "followup_tasks_staff_read" ON follow_up_tasks
  FOR SELECT TO authenticated USING (private.user_belongs_to_clinic(clinic_id));

CREATE POLICY "followup_tasks_staff_insert" ON follow_up_tasks
  FOR INSERT TO authenticated WITH CHECK (private.user_belongs_to_clinic(clinic_id));

CREATE POLICY "followup_tasks_staff_update" ON follow_up_tasks
  FOR UPDATE TO authenticated USING (private.user_belongs_to_clinic(clinic_id));

CREATE POLICY "followup_tasks_app_admin_all" ON follow_up_tasks
  FOR ALL TO authenticated USING (private.is_app_admin());

-- ============================================================
-- REVIEW REQUESTS
-- ============================================================

CREATE POLICY "reviews_staff_read" ON review_requests
  FOR SELECT TO authenticated USING (private.user_belongs_to_clinic(clinic_id));

CREATE POLICY "reviews_staff_insert" ON review_requests
  FOR INSERT TO authenticated WITH CHECK (private.user_belongs_to_clinic(clinic_id));

CREATE POLICY "reviews_staff_update" ON review_requests
  FOR UPDATE TO authenticated USING (private.user_belongs_to_clinic(clinic_id));

CREATE POLICY "reviews_app_admin_all" ON review_requests
  FOR ALL TO authenticated USING (private.is_app_admin());

-- ============================================================
-- OWNER / ADMIN ONLY TABLES
-- (prospects, prospect_activities, customers, finance_records)
-- ============================================================

-- PROSPECTS — app admin only
CREATE POLICY "prospects_app_admin_all" ON prospects
  FOR ALL TO authenticated USING (private.is_app_admin());

-- PROSPECT ACTIVITIES — app admin only
CREATE POLICY "prospect_activities_app_admin_all" ON prospect_activities
  FOR ALL TO authenticated USING (private.is_app_admin());

-- CUSTOMERS — app admin only
CREATE POLICY "customers_app_admin_all" ON customers
  FOR ALL TO authenticated USING (private.is_app_admin());

-- FINANCE RECORDS — app admin only
CREATE POLICY "finance_records_app_admin_all" ON finance_records
  FOR ALL TO authenticated USING (private.is_app_admin());

-- ============================================================
-- AUDIT LOG
-- ============================================================

-- Any authenticated user can INSERT audit events for their own clinic
CREATE POLICY "audit_log_authenticated_insert" ON audit_log
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
    AND (
      clinic_id IS NULL
      OR private.user_belongs_to_clinic(clinic_id)
    )
  );

-- Only app admins can read the audit log
CREATE POLICY "audit_log_admin_read" ON audit_log
  FOR SELECT TO authenticated USING (private.is_app_admin());

-- App admins have full access
CREATE POLICY "audit_log_app_admin_all" ON audit_log
  FOR ALL TO authenticated USING (private.is_app_admin());

-- ============================================================
-- STAFF INTEGRITY TRIGGERS
-- ============================================================
-- current_user is 'authenticated' for direct client statements and the function
-- owner inside SECURITY DEFINER RPCs, which lets us restrict clients only.

-- Clients may not re-point a staff row to another login or another clinic.
CREATE OR REPLACE FUNCTION private.staff_block_identity_change()
RETURNS TRIGGER AS $$
BEGIN
  IF current_user IN ('authenticated', 'anon')
     AND (NEW.user_id IS DISTINCT FROM OLD.user_id
          OR NEW.clinic_id IS DISTINCT FROM OLD.clinic_id) THEN
    RAISE EXCEPTION 'staff_identity_immutable';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

CREATE TRIGGER trg_staff_block_identity_change
  BEFORE UPDATE ON clinic_staff
  FOR EACH ROW EXECUTE FUNCTION private.staff_block_identity_change();

-- A clinic must always keep at least one active owner.
CREATE OR REPLACE FUNCTION private.staff_protect_last_owner()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.role = 'owner' AND OLD.is_active THEN
    IF TG_OP = 'DELETE'
       OR NEW.role <> 'owner'
       OR NEW.is_active = FALSE THEN
      -- Allow when the clinic itself is being deleted (cascade).
      IF EXISTS (SELECT 1 FROM public.clinics c WHERE c.id = OLD.clinic_id)
         AND NOT EXISTS (
           SELECT 1 FROM public.clinic_staff s
           WHERE s.clinic_id = OLD.clinic_id
             AND s.id <> OLD.id
             AND s.role = 'owner'
             AND s.is_active
         ) THEN
        RAISE EXCEPTION 'last_owner';
      END IF;
    END IF;
  END IF;
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE TRIGGER trg_staff_protect_last_owner
  BEFORE UPDATE OR DELETE ON clinic_staff
  FOR EACH ROW EXECUTE FUNCTION private.staff_protect_last_owner();

-- ============================================================
-- RPCs (called by the browser via supabase.rpc)
-- ============================================================

-- Onboarding: creates a clinic and makes the caller its owner, atomically.
-- Identity comes ONLY from auth.uid(); the client cannot choose a user id.
CREATE OR REPLACE FUNCTION public.create_clinic_with_owner(
  p_name  TEXT,
  p_phone TEXT DEFAULT NULL,
  p_city  TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_uid       UUID := auth.uid();
  v_name      TEXT := btrim(coalesce(p_name, ''));
  v_slug_base TEXT;
  v_clinic_id UUID;
  v_email     TEXT;
  v_user_name TEXT;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  IF char_length(v_name) < 2 OR char_length(v_name) > 100 THEN
    RAISE EXCEPTION 'invalid_name';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.clinic_staff s
    WHERE s.user_id = v_uid AND s.is_active
  ) THEN
    RAISE EXCEPTION 'already_member';
  END IF;

  v_slug_base := btrim(regexp_replace(lower(v_name), '[^a-z0-9]+', '-', 'g'), '-');
  IF v_slug_base = '' THEN
    v_slug_base := 'clinic';
  END IF;

  INSERT INTO public.clinics (name, slug, phone, city)
  VALUES (
    v_name,
    left(v_slug_base, 40) || '-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 8),
    nullif(btrim(coalesce(p_phone, '')), ''),
    nullif(btrim(coalesce(p_city, '')), '')
  )
  RETURNING id INTO v_clinic_id;

  SELECT u.email, coalesce(nullif(btrim(u.raw_user_meta_data->>'name'), ''), u.email)
    INTO v_email, v_user_name
  FROM auth.users u
  WHERE u.id = v_uid;

  INSERT INTO public.clinic_staff (clinic_id, user_id, role, name, email)
  VALUES (v_clinic_id, v_uid, 'owner', coalesce(v_user_name, 'Owner'), v_email);

  RETURN v_clinic_id;
EXCEPTION
  WHEN unique_violation THEN
    -- Concurrent double submit: the one-active-clinic-per-user unique index fired.
    RAISE EXCEPTION 'already_member';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

REVOKE ALL ON FUNCTION public.create_clinic_with_owner(TEXT, TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_clinic_with_owner(TEXT, TEXT, TEXT) TO authenticated;

-- UI helper: is the caller a platform (SaaS owner) admin? UI only; RLS enforces.
CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS BOOLEAN AS $$
  SELECT private.is_app_admin();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = '';

REVOKE ALL ON FUNCTION public.is_platform_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_platform_admin() TO authenticated;

-- ============================================================
-- BOOTSTRAP (run manually by the Founder in the Supabase SQL editor, once):
--   INSERT INTO public.platform_admins (user_id)
--   SELECT id FROM auth.users WHERE email = '<founder email>';
-- Never insert platform admins from application code.
-- ============================================================
