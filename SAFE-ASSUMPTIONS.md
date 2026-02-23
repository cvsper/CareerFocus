# Safe Assumptions (if Cassandra is too busy)

If Cassandra doesn't have time to answer everything, I can make these **safe assumptions** and start building. She can adjust later.

---

## Reasonable Defaults

### 1. Contractors = Sandhill Contractors
**Assumption:** Career Focus contractors are home health 1099 workers, same as Sandhill.

**Use Sandhill requirements:**
- Background check (expired after 2 years)
- Driver's license
- SSN card
- CPR certification (expired after 2 years)
- Zero tolerance certificate
- HIPAA training certificate
- Direct deposit form

**Workflow:**
- Admin invites contractor via SMS/email
- Contractor uploads 7 documents
- Admin reviews and approves/rejects (48-hour SLA)
- SMS + email notifications

**Rationale:** Career Focus is a home health agency, Sandhill is a home health agency. Same industry = same compliance requirements.

---

### 2. Employees = Minimal Portal Access
**Assumption:** W-2 employees are managed by admin, don't need full portal.

**Features:**
- View-only dashboard (company announcements)
- Upload onboarding documents (W-4, I-9, photo ID)
- No timesheet submission (handled externally or by admin)
- No PTO tracking (handled externally)
- Access to Learning Hub training

**Rationale:** Small business, likely using external payroll system (Gusto, ADP). Portal is for onboarding compliance, not daily HR.

---

### 3. Ticket to Work = Enhanced WBLE
**Assumption:** TTW participants are similar to WBLE, but with vocational rehab focus.

**Differences:**
- Same timesheet format
- Additional documents:
  - SSDI/SSI award letter
  - Benefits counseling certificate
  - VR referral letter
- Dashboard shows:
  - Hours vs. SGA threshold ($1,470/month in 2026)
  - Benefits impact warning when approaching limit
  - VR counselor contact info

**Rationale:** TTW is a federal program (Social Security). Participants need to track hours carefully to avoid losing SSDI/SSI benefits.

---

### 4. One Role Per User
**Assumption:** Users can only have one primary role.

**Rationale:** Simplifies permissions and UI. If someone is both contractor + participant, they create 2 accounts or admin assigns primary role.

---

### 5. Build Order: Contractors → Employees → TTW
**Priority:**
1. **Contractors first** (most complex, same as Sandhill)
2. **Employees second** (simple onboarding docs)
3. **TTW third** (enhanced WBLE)
4. Keep existing WBLE as-is (rename to "WBLE Participants")

**Rationale:** Contractors are revenue-generating (1099 workers). Employees are internal. TTW is new program expansion.

---

## What I'll Build (Default Path)

### Phase 1: Contractors (Week 1)
- Copy Sandhill onboarding flow
- 7 required documents
- SMS + email notifications
- Admin approval dashboard
- **Deliverable:** Contractors can onboard like Sandhill

### Phase 2: Employees (Week 2)
- Simplified dashboard
- W-4, I-9, photo ID upload
- Learning Hub access
- **Deliverable:** Employees can complete onboarding

### Phase 3: TTW Participants (Week 3)
- Clone WBLE participant portal
- Add TTW-specific documents
- Add SGA threshold tracking
- **Deliverable:** TTW participants can track hours safely

### Phase 4: Polish (Week 4)
- Rename "student" → "WBLE participant"
- Role-based navigation
- Mobile testing
- **Deliverable:** Production-ready unified portal

---

## Validation Checkpoints

After each phase:
1. Deploy to staging
2. Cassandra tests with real user scenarios
3. Adjust based on feedback
4. Move to production

**If assumptions are wrong:** Easy to adjust because each role is modular.

---

## Decision Time

**Option A:** Wait for Cassandra's answers (best, but slower)  
**Option B:** Start with assumptions, adjust as we go (faster, good enough)  
**Option C:** Build contractors only first, get feedback, then do others (safest)

---

**My recommendation:** **Option C** - Build contractors first (identical to Sandhill), show Cassandra, then expand based on what she likes/dislikes.

Less overwhelming, faster progress, validates approach before going all-in.

**Your call, sevs!** 🦾
