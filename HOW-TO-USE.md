# Career Focus Portal — How To Use

A walkthrough of every portal: how to log in, what each role can do, and where to click.

**Live URL:** https://career-focus-portal.onrender.com

---

## Logging In

1. Go to https://career-focus-portal.onrender.com
2. Enter email + password
3. The portal automatically routes you to the right dashboard based on your role

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@careerfocus.org` | `admin123` |
| WBLE Student | `john.smith@email.com` | `student123` |
| WBLE Student | `emily.johnson@email.com` | `student123` |
| WBLE Student | `marcus.williams@email.com` | `student123` |

---

## 👨‍💼 Admin Portal

**Login as:** `admin@careerfocus.org / admin123`

### What admins can do

**Dashboard** — at-a-glance overview
- Total students, contractors, employees, TTW participants
- Pending timesheet approvals
- Pending document approvals
- Recent activity

**Student Management** (Sidebar → Students)
- View every registered user across all roles
- Filter by role (WBLE / Contractor / Employee / TTW)
- Search by name or email
- Click any user to see their full profile, timesheets, documents

**Approvals** (Sidebar → Approvals)
- **Timesheets tab** — pending weekly hour submissions
  - Click → review hours per day → Approve or Reject
  - Rejected timesheets bounce back with a note
- **Documents tab** — uploaded ID, W-4, certifications, etc.
  - Click → preview the file → Approve or Reject

**Programs** (Sidebar → Programs)
- Create new WBLE programs (name, organization, dates, hours, capacity)
- Edit existing programs (status, deadlines, spots)
- Delete programs that never launched

**Opportunities** (Sidebar → Opportunities)
- Post job listings (internships, pathways, part-time)
- Mark as "featured" to bump to top of student board
- Edit pay range, location, description

**Announcements**
- Push notifications visible to all students on their dashboard

---

## 🎓 WBLE Student Portal

**Login as:** `john.smith@email.com / student123`

### What students can do

**Dashboard** — quick status
- Your current program + progress
- This week's timesheet status
- Pending documents to upload
- Learning Hub progress %

**Timesheets** (Sidebar → Timesheets)
- Submit weekly hours
- Enter hours per day (Mon–Sun)
- Add supervisor notes
- Sign with digital signature
- Submit → status: *Submitted* → admin reviews → *Approved* or *Rejected*
- **Download PDF** of any approved timesheet (matches Florida VR/DOE official form)

**Documents** (Sidebar → Documents)
- Upload required onboarding docs (PDF, DOCX, JPG, PNG)
- Track approval status: *Submitted* → *Under Review* → *Approved/Rejected*
- Re-upload if rejected

**Programs** (Sidebar → Programs)
- See programs you're enrolled in
- Browse available programs
- Click "Enroll" → admin sees the request

**Job Opportunities** (Sidebar → Opportunities)
- Browse internships, pathways, part-time roles
- Filter by type, location, pay
- Apply directly through the portal

**Learning Hub** (Sidebar → Learning)
- 8 micro-lessons on payroll basics + workplace skills
- Resume where you left off
- Marks lessons complete as you progress

**Profile** (Sidebar → Profile)
- Update phone, address
- Set emergency contacts
- Change profile photo

---

## 🔧 Contractor Portal

**Login as:** any contractor demo account (created via Phase 2 seed)

### What contractors do

**Onboarding Checklist** — front and center on dashboard
- 9 required documents to upload:
  1. I-9 (employment eligibility)
  2. W-4 (tax withholding)
  3. Direct Deposit form
  4. Photo ID (driver's license / state ID)
  5. SSN card
  6. Background check authorization
  7. CPR certification
  8. HIPAA training certificate
  9. Zero tolerance policy acknowledgment
- Progress bar shows X / 9 complete
- Each item: upload → admin review → approved/rejected

**Documents tab** — same as student, but tracks the contractor list

---

## 👔 Employee Portal

**Login as:** any employee demo account

### What W-2 employees do

**Announcements feed** — company-wide updates
**Learning Hub access** — same training modules as students
**Resource links** — handbook, benefits, IT helpdesk
**Profile** — update HR-relevant info

*Employees do **not** submit timesheets through the portal — assumed managed externally (Gusto/ADP).*

---

## ♿ Ticket to Work (TTW) Portal

**Login as:** any TTW demo account

### What TTW participants see

Everything WBLE students get, **plus**:

**SGA Tracker** — top of dashboard
- Tracks earnings vs. monthly Substantial Gainful Activity threshold ($1,550/mo for 2026)
- Color-coded: green (safe) / yellow (approaching) / red (over)
- Warning if approaching limit (would affect SSDI/SSI benefits)

**VR Counselor** — sidebar widget
- Shows assigned Vocational Rehabilitation counselor
- Contact info + scheduled check-ins

**Extra documents** in onboarding:
- SSDI/SSI award letter
- Benefits counseling certificate
- VR referral letter

---

## 🔄 Common Workflows

### Student submits a timesheet → gets paid
1. Student → **Timesheets** → **New Timesheet**
2. Enter hours per day, sign, **Submit**
3. Admin → **Approvals → Timesheets** → review → **Approve**
4. Student gets notification, can download approved PDF
5. Admin uses PDF for payroll

### New contractor joins
1. Admin creates the user (Sidebar → Students → Add User → Role: Contractor)
2. Admin sends login email + temp password
3. Contractor logs in → uploads 9 documents
4. Admin reviews each → approves
5. Contractor is "active" once all 9 are green

### Admin posts a new opportunity
1. Sidebar → **Opportunities** → **New Opportunity**
2. Title, description, organization, type (internship / pathway / part-time)
3. Pay range, location, deadline
4. Toggle "Featured" if you want it pinned at top
5. Save → instantly visible to all students

---

## 💡 Tips

- **The portal sleeps after 15 min of inactivity** (free Render tier). First login of the day takes ~30s. Recommend upgrading to $7/mo for always-on.
- **All approvals send email notifications** (when SMTP is configured)
- **Mobile responsive** — students can submit timesheets from their phones
- **Audit trail**: every approval/rejection logs who, when, and why

---

## 🆘 If something breaks

- **Can't log in?** → Try password reset, or admin can reset from user profile
- **Timesheet won't submit?** → Hours can't exceed 80/week, can't submit for future weeks
- **Document upload fails?** → File must be PDF, DOCX, JPG, or PNG, under 10MB
- **Page won't load?** → Refresh; if persistent, ping Shamar (the API may be cold-starting)
