# Clinic Growth AI — Comprehensive Test Cases

> Generated: 21 Nov 2026 | Total: 142 test cases across 16 categories
> Dev server: `http://localhost:5174`

---

## CATEGORY 1: Marketing — Home Page (`/`)

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|-----------------|----------|
| MH-01 | Home page renders | Navigate to `/` | Page loads with hero section, features, CTA buttons | P0 |
| MH-02 | Hero CTA "Book a Demo" link | Click "Book a Demo" or similar CTA | Navigates to `/demo` | P0 |
| MH-03 | Pricing link in nav | Click "Pricing" in navigation | Navigates to `/pricing` | P1 |
| MH-04 | Login link accessible | Click Login button/link | Navigates to `/login` | P1 |
| MH-05 | Responsive layout mobile | Resize to 375px width | No horizontal scroll, text readable, stacked layout | P1 |
| MH-06 | Responsive layout tablet | Resize to 768px | Proper grid layout | P2 |

## CATEGORY 2: Marketing — Pricing Page (`/pricing`)

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|-----------------|----------|
| MP-01 | Pricing page renders | Navigate to `/pricing` | Shows Standard (₹14,999) and Premium (₹19,999) plans | P0 |
| MP-02 | Pricing tier details | Inspect cards | Each plan shows features list, price, CTA | P1 |
| MP-03 | CTA buttons work | Click "Get Started" or demo CTA | Navigates to `/demo` or appropriate page | P1 |
| MP-04 | Responsive layout | Resize to mobile | Pricing cards stack vertically | P2 |

## CATEGORY 3: Marketing — Demo Request Page (`/demo`)

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|-----------------|----------|
| MD-01 | Demo form renders | Navigate to `/demo` | Shows form with Clinic Name, Contact Person, Phone, Email, City, Doctor Count, Current Software, Preferred Time fields | P0 |
| MD-02 | Instant access banner links | Click "Live AI Simulator" and "Clinic CRM Demo" buttons in top banner | Navigates to `/dashboard/ai-playground` and `/dashboard` | P0 |
| MD-03 | Empty form submission blocked | Click "Confirm 15-Min Live Demo Booking" with empty fields | Validation errors shown for Clinic Name, Contact Person, Phone, Email | P0 |
| MD-04 | Phone validation — valid 10-digit | Enter `9845012345` and submit | No phone error | P0 |
| MD-05 | Phone validation — with +91 prefix | Enter `+91 9845012345` and submit | No phone error (strips +91 correctly) | P0 |
| MD-06 | Phone validation — invalid (5 digits) | Enter `98450` | Error: "Please enter a valid 10-digit Indian mobile number" | P0 |
| MD-07 | Phone validation — starts with 5 | Enter `5845012345` | Validation error (Indian numbers start with 6-9) | P1 |
| MD-08 | Email validation — invalid | Enter `notanemail` | Error: "Please enter a valid email address" | P0 |
| MD-09 | Email validation — valid | Enter `test@clinic.com` | No email error | P1 |
| MD-10 | Error clears on input | Trigger phone error, then type valid phone | Error disappears as user types | P0 |
| MD-11 | Successful submission | Fill all required fields correctly and submit | Shows "DEMO RESERVED" success state with "Thank You" and links to dashboard | P0 |
| MD-12 | Post-submission links work | After success, click "Explore Live Demo Dashboard" | Navigates to `/dashboard` | P1 |
| MD-13 | Select dropdowns work | Change City, Doctor Count, Current Software, Preferred Time | Values update in form state | P1 |
| MD-14 | Buttons outside form work during validation error | Trigger validation error, then click banner links | Banner links should still work (buttons are `type="button"` or `<Link>`) | P0 |

## CATEGORY 4: Auth Pages (`/login`, `/signup`, `/forgot-password`)

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|-----------------|----------|
| AU-01 | Login page renders | Navigate to `/login` | Shows email/password inputs, login button, signup link | P0 |
| AU-02 | Signup page renders | Navigate to `/signup` | Shows registration form with required fields | P0 |
| AU-03 | Forgot password renders | Navigate to `/forgot-password` | Shows email field and submit button | P0 |
| AU-04 | Login→Signup link | Click "Sign Up" link on login page | Navigates to `/signup` | P1 |
| AU-05 | Signup→Login link | Click "Login" link on signup page | Navigates to `/login` | P1 |
| AU-06 | Login→Forgot link | Click "Forgot Password?" on login page | Navigates to `/forgot-password` | P1 |

## CATEGORY 5: Dashboard Overview (`/dashboard`)

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|-----------------|----------|
| DO-01 | Dashboard renders | Navigate to `/dashboard` | Shows welcome header, 4 stat cards, recent leads, upcoming appointments, AI stream | P0 |
| DO-02 | Stat cards show data | Inspect stat cards | Total Leads = 7, New Today = 1, Appointments = 4, Conversion Rate = 42.8% | P0 |
| DO-03 | Recent leads list | Check "Recent Patient Inquiries" section | Shows first 4 leads (Aarav, Priya, Rajesh, Ananya) with names, status badges, phone | P0 |
| DO-04 | Lead link navigates | Click lead name (e.g. "Aarav Mehta") | Navigates to `/leads/lead-01` | P0 |
| DO-05 | Upcoming appointments | Check "Upcoming Appointments" section | Shows first 3 appointments with patient name, treatment, date/time, doctor, status | P0 |
| DO-06 | Clinical triage alert | Check amber alert banner | Shows "Aarav Mehta reported acute pulpitis" with "Review Lead" button linking to `/leads/lead-01` | P1 |
| DO-07 | AI Receptionist stream | Check AI section | Shows 3 conversation summaries with lead names and last messages | P1 |
| DO-08 | Navigation buttons work | Click "Test AI Playground" and "New Lead" buttons | Navigate to `/ai-playground` and `/leads` respectively | P1 |
| DO-09 | Sidebar navigation | Click each sidebar item | All navigate correctly: Dashboard, Leads, Appointments, Conversations, AI Playground, Settings (4 sub-items), Admin links | P0 |

## CATEGORY 6: Leads CRM (`/leads`)

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|-----------------|----------|
| LD-01 | Leads page renders | Navigate to `/leads` | Shows header with count badge, search bar, filters, leads table | P0 |
| LD-02 | All 7 demo leads shown | Check table | Aarav, Priya, Rajesh, Ananya, Vikram, Sneha, Amit all visible | P0 |
| LD-03 | Status badges correct | Check status column | Each lead shows correct status badge (New, Contacted, Interested, Apt Requested, Apt Confirmed, Converted, Lost) | P0 |
| LD-04 | Search by name | Type "Priya" in search | Only Priya Nair shown | P0 |
| LD-05 | Search by phone | Type "98201" in search | Only Aarav Mehta shown | P1 |
| LD-06 | Filter by status | Select "New Lead" in status filter | Only Sneha Reddy shown (status=new) | P0 |
| LD-07 | Filter by source | Select "Direct WhatsApp" in source filter | Priya Nair and Sneha Reddy shown (source=whatsapp) | P1 |
| LD-08 | Combined filters | Set status=Converted AND search "Vikram" | Only Vikram Patil shown | P2 |
| LD-09 | Empty state | Filter to impossible combo (e.g. status=new + source=referral) | Shows "No leads match your filter" with "Clear Filters" button | P1 |
| LD-10 | Clear filters | Click "Clear Filters" in empty state | Resets all filters, shows all leads | P1 |
| LD-11 | Add Lead modal opens | Click "Add Patient Lead" button | Modal opens with form fields | P0 |
| LD-12 | Create new lead | Fill name, phone, source, notes and submit | Modal closes, new lead appears at top of list | P0 |
| LD-13 | Lead detail navigation | Click "View CRM Profile" for any lead | Navigates to `/leads/{id}` with correct data | P0 |
| LD-14 | Lead name link | Click lead name in table | Navigates to lead detail page | P1 |

## CATEGORY 7: Lead Detail (`/leads/:id`)

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|-----------------|----------|
| LDD-01 | Lead detail renders | Navigate to `/leads/lead-01` | Shows Aarav Mehta's details: name, phone, email, status, source, notes, treatment interest | P0 |
| LDD-02 | Status change | Change status dropdown/button | Status updates and persists to store | P0 |
| LDD-03 | Activity timeline | Check activity section | Shows activity entries (AI conversation, triage flag, slot proposed) | P1 |
| LDD-04 | Back navigation | Click back button/link | Returns to `/leads` | P1 |
| LDD-05 | Invalid lead ID | Navigate to `/leads/nonexistent` | Shows error or empty state (graceful handling, no crash) | P1 |

## CATEGORY 8: Appointments (`/appointments`)

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|-----------------|----------|
| AP-01 | Appointments page renders | Navigate to `/appointments` | Shows header with count badge, filters, appointments table | P0 |
| AP-02 | All 4 demo appointments shown | Check table | Rajesh, Aarav, Vikram, Ananya all visible with dates, times, doctors | P0 |
| AP-03 | Status badges correct | Check status column | confirmed, requested shown correctly with appropriate colors | P0 |
| AP-04 | Filter by status | Select "Confirmed" | Shows only 2 confirmed appointments (Rajesh, Vikram) | P0 |
| AP-05 | Filter by doctor | Select "Dr. Rohan" | Shows Rajesh and Aarav appointments | P1 |
| AP-06 | Book new appointment modal | Click "Book New Appointment" | Modal opens with patient name, phone, doctor, branch, date, time, duration, treatment, notes | P0 |
| AP-07 | Book appointment — required fields | Submit empty form | Form doesn't submit (HTML required validation) | P0 |
| AP-08 | Book appointment — success | Fill name + phone + date + time, submit | Modal closes, success toast appears, new appointment visible in table | P0 |
| AP-09 | Cross-page reactivity | Book new appointment, go to Dashboard | New appointment appears in Dashboard's "Upcoming Appointments" section | P0 |
| AP-10 | Doctor selector options | Open doctor dropdown in booking modal | Shows Dr. Rohan Sharma and Dr. Pooja Iyer | P1 |
| AP-11 | Branch selector options | Open branch dropdown | Shows Indiranagar Main Clinic and Koramangala Center | P1 |
| AP-12 | Appointment detail navigation | Click "Manage Visit" for any appointment | Navigates to `/appointments/{id}` with correct data | P0 |
| AP-13 | Empty state | Filter to show no results | Shows "No appointments found" with "Reset Filters" | P1 |

## CATEGORY 9: Appointment Detail (`/appointments/:id`)

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|-----------------|----------|
| APD-01 | Detail page renders | Navigate to `/appointments/apt-01` | Shows Rajesh Kumar's appointment details | P0 |
| APD-02 | Status change | Update appointment status | Status updates and persists | P1 |
| APD-03 | Invalid ID | Navigate to `/appointments/nonexistent` | Graceful handling, no crash | P1 |

## CATEGORY 10: Conversations (`/conversations`)

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|-----------------|----------|
| CV-01 | Conversations page renders | Navigate to `/conversations` | Shows 2-pane layout: left thread list, right message viewer | P0 |
| CV-02 | Thread list shows all conversations | Check left pane | 3 conversations: Aarav (escalated), Priya (closed), Sneha (active) | P0 |
| CV-03 | Escalation badge | Check Aarav's thread entry | Shows red "Escalated" badge | P0 |
| CV-04 | Select conversation | Click Priya Nair's thread | Right pane shows Priya's messages about whitening | P0 |
| CV-05 | Messages display correctly | Check message bubbles | User messages right-aligned (blue), AI messages left-aligned (white) with Bot icon | P0 |
| CV-06 | Message timestamps | Check time displays | Each message shows formatted time (HH:MM) | P1 |
| CV-07 | Metadata badges | Check Aarav's conv messages | Shows "Triage Safety Screened" and "Slot Reserved" metadata | P1 |
| CV-08 | Staff reply | Type message in reply box, click Send | Message appears in conversation as "Staff Manual Reply" | P1 |
| CV-09 | Empty reply blocked | Click Send with empty reply box | Nothing happens (form validation) | P2 |
| CV-10 | WhatsApp link | Click "Open WhatsApp" button | Opens wa.me link in new tab | P2 |

## CATEGORY 11: AI Playground (`/ai-playground`)

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|-----------------|----------|
| AI-01 | Playground renders | Navigate to `/ai-playground` | Shows chat interface with Maya welcome message, telemetry panel, clinic parameters | P0 |
| AI-02 | Welcome message correct | Check initial message | "Namaste! I am Maya, the 24/7 AI Receptionist for Smile Dental Clinic. We have branches in Indiranagar and Koramangala..." | P0 |
| AI-03 | Quick prompt — RCT pricing | Click "How much does a Root Canal Treatment (RCT) cost?" pill | Maya responds with RCT pricing ₹3,500-₹5,500, telemetry shows intent | P0 |
| AI-04 | Quick prompt — location | Click "Where are your clinics located?" pill | Maya responds with both branch addresses (Indiranagar + Koramangala) | P0 |
| AI-05 | Quick prompt — booking with Dr. Rohan | Click "I want to book an appointment with Dr. Rohan" pill | Maya asks for name, phone, preferred date — prompts branch selection (since 2 branches) | P0 |
| AI-06 | Quick prompt — booking with branch specified | Click "Book an appointment at Koramangala branch tomorrow at 11 AM" | Maya extracts Koramangala branch, tomorrow date, 11 AM time — asks for name/phone | P0 |
| AI-07 | Quick prompt — full details | Click "Hi, my name is Rahul Sharma, phone 9845012345. Need RCT at Indiranagar" | Maya extracts: Name=Rahul Sharma, Phone=9845012345, Branch=Indiranagar, Treatment=RCT. Telemetry shows all extracted entities | P0 |
| AI-08 | Quick prompt — Sunday hours | Click "Are you open this Sunday morning?" pill | Maya responds with Sunday hours info | P0 |
| AI-09 | Manual input — emergency triage | Type "I have severe swelling and cannot breathe" | Emergency escalation triggered. Red alert in telemetry. Response includes emergency hotline number | P0 |
| AI-10 | Manual input — prescription refusal | Type "Can you prescribe me amoxicillin for my toothache?" | Maya refuses to prescribe, recommends booking doctor consultation | P0 |
| AI-11 | Manual input — human handoff | Type "I want to talk to a real person" | Maya provides clinic phone number, marks escalation in telemetry | P0 |
| AI-12 | Customer name NOT "Maya" | Send any message, check telemetry "Patient Name" | Should show "Not detected" or actual patient name, NEVER "Maya" | P0 |
| AI-13 | Multi-turn conversation | Send booking request → provide name → provide phone → provide date | Progressive extraction: each turn adds more data to telemetry | P0 |
| AI-14 | Reset session | Click "Reset Session" button | Chat clears, welcome message reappears, telemetry resets | P0 |
| AI-15 | Telemetry — initial state | Before sending any message | Telemetry shows "Send a message in the chat to view real-time AI triage..." | P1 |
| AI-16 | Telemetry — structured actions | After booking flow | Shows "CREATE_LEAD" and/or "REQUEST_APPOINTMENT" in backend actions | P1 |
| AI-17 | Telemetry — quick replies | After any interaction | Shows suggested WhatsApp fast reply chips | P1 |
| AI-18 | Simulated clinic parameters | Check bottom-right panel | Shows: Smile Dental Clinic, 2 branches, 2 doctors, emergency escalation info | P1 |
| AI-19 | Input disabled during typing | Send message, immediately try to type | Input field disabled while "Maya is analyzing clinical inquiry..." shown | P2 |
| AI-20 | Auto-scroll on new message | Send message in long conversation | Chat auto-scrolls to latest message | P2 |

## CATEGORY 12: Settings — Clinic Profile & Hours (`/settings/clinic`)

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|-----------------|----------|
| SC-01 | Settings page renders | Navigate to `/settings/clinic` | Shows profile form (left), operating hours editor (right), branches section | P0 |
| SC-02 | Profile form pre-populated | Check form fields | Shows Smile Dental Clinic name, phone, email, address, Bengaluru, Karnataka | P0 |
| SC-03 | Save clinic profile | Edit name to "Smile Dental Clinic Test", click "Save Clinic Profile" | Success toast "Profile saved!", data persists on page refresh | P0 |
| SC-04 | Business hours pre-populated | Check hours editor | Mon-Fri 09:00-20:00, Sat 09:30-19:00, Sun 10:00-14:00. All days checked as open | P0 |
| SC-05 | Toggle day closed | Uncheck Sunday checkbox | Sunday shows "Closed / Holiday" badge, time selectors hidden | P0 |
| SC-06 | Change time | Set Monday open to 10:00, close to 21:00 | Dropdown values update | P0 |
| SC-07 | Save operating hours | Make changes, click "Save Operating Hours" | Success toast "Operating hours saved!", persists across refresh | P0 |
| SC-08 | Preset weekdays button | Click "Set Weekdays 09:00 - 20:00" | Mon-Fri reset to 09:00-20:00, Sat to 09:30-19:00 | P1 |
| SC-09 | Branches section | Check branches area | Shows 2 branches: Indiranagar Main Clinic, Koramangala Center with addresses and ACTIVE badges | P0 |
| SC-10 | Hours persist to store | Save hours, navigate to Dashboard, return to settings | Hours still show saved values | P0 |

## CATEGORY 13: Settings — Staff, FAQ, Follow-Up Rules

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|-----------------|----------|
| SS-01 | Staff page renders (`/settings/staff`) | Navigate | Shows 3 staff: Dr. Rohan (owner), Dr. Pooja (doctor), Kavitha (receptionist) | P0 |
| SS-02 | Add staff member | Click Add Staff, fill form, submit | New staff appears in list | P1 |
| SF-01 | FAQ page renders (`/settings/faq`) | Navigate | Shows 4 FAQs with questions, answers, categories, active toggles | P0 |
| SF-02 | Add new FAQ | Click Add FAQ, fill question + answer, submit | New FAQ appears in list | P1 |
| SF-03 | Delete FAQ | Click delete button on a FAQ | FAQ removed from list | P1 |
| SR-01 | Follow-up rules page renders (`/settings/follow-ups`) | Navigate | Shows 3 rules: After-Hours Reply, Unconfirmed Nudge, Post-Treatment Review | P0 |
| SR-02 | Rule details visible | Check each rule entry | Shows name, trigger event, delay hours, channel, active status, message template | P1 |

## CATEGORY 14: Admin / Founder Dashboard

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|-----------------|----------|
| AD-01 | Admin overview renders (`/admin`) | Navigate | Shows MRR metrics, subscription overview, key stats | P0 |
| AD-02 | Prospects page renders (`/admin/prospects`) | Navigate | Shows 4 prospects: Apex, DentaCare, CureWhite, BrightSmiles with scores and statuses | P0 |
| AD-03 | Prospect details | Check each prospect row | Shows clinic name, location, qualification score, sales status, next action | P1 |
| AD-04 | Customers page renders (`/admin/customers`) | Navigate | Shows 6 customers with plan types, MRR, health scores | P0 |
| AD-05 | Customer details | Check any customer | Shows clinic name, city, doctor, plan (standard/premium), monthly rate, start date, status | P1 |
| AD-06 | Finance page renders (`/admin/finance`) | Navigate | Shows 7 finance records (4 revenue, 3 expense) with amounts, dates, descriptions | P0 |
| AD-07 | Finance record types | Check entries | Revenue records show customer association, expense records show null customer | P1 |

## CATEGORY 15: Cross-Cutting Functionality

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|-----------------|----------|
| CC-01 | Sidebar navigation — all links | Click each sidebar item | All 12+ routes navigate correctly | P0 |
| CC-02 | Mobile sidebar | Resize to mobile, check nav | Mobile hamburger menu appears and works | P1 |
| CC-03 | 404 / catch-all route | Navigate to `/nonexistent-page` | Redirects to `/` (home page) | P1 |
| CC-04 | Router aliases work | Navigate to `/dashboard/ai-playground` | Shows AI Playground (same as `/ai-playground`) | P1 |
| CC-05 | Router aliases — conversations | Navigate to `/dashboard/conversations` | Shows Conversations page | P1 |
| CC-06 | Router redirect — leads | Navigate to `/dashboard/leads` | Redirects to `/leads` | P1 |
| CC-07 | Router redirect — faqs | Navigate to `/settings/faqs` | Redirects to `/settings/faq` | P2 |
| CC-08 | localStorage persistence — leads | Add a lead, refresh page | New lead still present | P0 |
| CC-09 | localStorage persistence — appointments | Book appointment, refresh page | Appointment still present | P0 |
| CC-10 | localStorage persistence — clinic settings | Save clinic name, refresh | Name persists | P0 |
| CC-11 | localStorage persistence — business hours | Save hours, refresh | Hours persist | P0 |
| CC-12 | Cross-page reactivity — lead count | Add lead on Leads page, navigate to Dashboard | Dashboard stat card shows updated count | P0 |
| CC-13 | Cross-page reactivity — appointments | Book appointment on Appointments page, navigate to Dashboard | Dashboard shows new appointment | P0 |
| CC-14 | Button type safety | Inspect any Button component outside a form | Should have `type="button"` by default (not submit) | P0 |

## CATEGORY 16: AI Receptionist Engine (Unit / Logic Tests)

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|-----------------|----------|
| RE-01 | Emergency detection — breathing | Input: "I cannot breathe and my gums are bleeding profusely" | `checkEmergencySymptoms` returns `isEmergency: true` | P0 |
| RE-02 | Emergency detection — swelling | Input: "My face is very swollen and I have fever" | `isEmergency: true` | P0 |
| RE-03 | Non-emergency normal query | Input: "How much does teeth cleaning cost?" | `isEmergency: false` | P0 |
| RE-04 | Phone extraction — standard | Input: "My number is 9845012345" | Extracts `9845012345` | P0 |
| RE-05 | Phone extraction — with +91 | Input: "Call me at +91 98450 12345" | Extracts `+919845012345` or `9845012345` | P0 |
| RE-06 | Phone extraction — no phone | Input: "I need a dentist" | Returns `null` | P0 |
| RE-07 | Name extraction — standard | Input: "My name is Rahul Sharma" | Extracts `Rahul Sharma` | P0 |
| RE-08 | Name extraction — "this is" pattern | Input: "Hi, this is Priya calling" | Extracts `Priya` | P1 |
| RE-09 | Name extraction — Maya guard | Input: "I am Maya the dental assistant" | Returns `null` (blocked by reserved words) | P0 |
| RE-10 | Name extraction — no name | Input: "I need teeth whitening" | Returns `null` | P1 |
| RE-11 | Branch extraction — Indiranagar | Input: "I want to visit Indiranagar branch" | Extracts `Indiranagar Main Clinic` | P0 |
| RE-12 | Branch extraction — Koramangala | Input: "Book at Koramangala" | Extracts `Koramangala Center` | P0 |
| RE-13 | Branch extraction — no branch | Input: "I need an appointment" | Returns `null` | P1 |
| RE-14 | Date extraction — tomorrow | Input: "Can I come tomorrow?" | Extracts `Tomorrow` | P0 |
| RE-15 | Date extraction — day name | Input: "Is Saturday available?" | Extracts `Saturday` | P0 |
| RE-16 | Time extraction — morning | Input: "I prefer morning" | Extracts `Morning (10:00 AM - 01:00 PM)` | P0 |
| RE-17 | Time extraction — specific | Input: "5pm would work" | Extracts `5PM` | P1 |
| RE-18 | Intent classification — booking | Input: "I want to book an appointment" | Returns `booking` | P0 |
| RE-19 | Intent classification — pricing | Input: "How much does RCT cost?" | Returns `pricing` | P0 |
| RE-20 | Intent classification — handoff | Input: "I want to talk to a real person" | Returns `handoff` | P0 |
| RE-21 | Prescription guardrail | Input: "Can you prescribe amoxicillin?" | Mock response refuses to prescribe | P0 |
| RE-22 | Multi-branch prompt | Booking intent without branch specified (clinic has 2 branches) | Response asks user to choose Indiranagar or Koramangala | P0 |
| RE-23 | Complete booking extraction | Input: "Hi, my name is Rahul, phone 9845012345, book at Koramangala tomorrow morning" | All entities extracted: name, phone, branch, date, time. Actions include create_lead + request_appointment | P0 |

---

## Summary

| Priority | Count | Description |
|----------|-------|-------------|
| P0 | 85 | Must pass — critical demo functionality |
| P1 | 42 | Should pass — important UX quality |
| P2 | 15 | Nice to have — edge cases |
| **Total** | **142** | |
