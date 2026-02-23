# Career Focus Portal Expansion Plan

**Date:** February 6, 2026  
**Status:** Planning Phase  
**Goal:** Transform WBLE Student Portal into unified Career Focus Portal

---

## 🎯 Vision

Merge the current WBLE Student Portal into a single unified platform that serves:
- **Career Focus employees** (internal staff)
- **Career Focus contractors** (1099 workers for home health)
- **WBLE participants** (work-based learning students)
- **Ticket to Work participants** (vocational rehabilitation participants)

---

## 📊 Current Architecture

### User Roles (Current)
- `student` - WBLE participants only
- `admin` - Career Focus staff managing students

### Data Models
- User (basic profile + emergency contact)
- Timesheet (weekly hour tracking with signature)
- TimesheetEntry (daily hour entries)
- Document (W-4, I-9, photo ID, work permits, etc.)
- Program (WBLE programs with enrollment)
- Enrollment (student → program relationship)
- Opportunity (job board listings)
- LearningProgress (micro-lessons tracking)

---

## 🔄 Proposed Changes

### 1. Expanded User Roles

```python
class UserRole(str, enum.Enum):
    admin = "admin"                    # Career Focus staff (existing)
    employee = "employee"              # Career Focus W-2 employees (NEW)
    contractor = "contractor"          # Career Focus 1099 contractors (NEW)
    wble_participant = "wble_participant"  # Current "student" role (RENAME)
    ttw_participant = "ttw_participant"    # Ticket to Work participants (NEW)
```

### 2. Role-Based Permissions Matrix

| Feature | Admin | Employee | Contractor | WBLE | TTW |
|---------|-------|----------|------------|------|-----|
| **Dashboard** | Full stats | Personal view | Personal view | Personal view | Personal view |
| **Timesheets** | Approve/reject | Submit own | Submit own | Submit own | Submit own |
| **Documents** | View/approve all | Upload own | Upload own | Upload own | Upload own |
| **Programs** | Manage all | View/enroll | View/enroll | View/enroll | View/enroll |
| **Opportunities** | Manage all | View | View | View | View |
| **Learning Hub** | Manage content | Access assigned | Access assigned | Access all | Access assigned |
| **User Management** | Full CRUD | View own | View own | View own | View own |

### 3. Database Schema Changes

#### 3.1 User Model Updates
```python
# Add new fields to User model:
- employment_type: Enum["w2", "1099", "participant"]  # Employment classification
- user_role: UserRole  # Expanded role enum
- department: String (nullable)  # For employees only
- hourly_rate: Decimal (nullable)  # For contractors/employees
- tax_id: String (encrypted, nullable)  # SSN/EIN for contractors
- company_start_date: Date (nullable)  # For employees/contractors
```

#### 3.2 Document Type Expansion
```python
class DocumentType(str, enum.Enum):
    # Existing (for all user types)
    w4 = "W-4 Form"
    i9 = "I-9 Form"
    photo_id = "Photo ID"
    direct_deposit = "Direct Deposit Form"
    
    # For WBLE/TTW participants (existing)
    work_permit = "Work Permit"
    emergency_contact = "Emergency Contact Form"
    
    # NEW - For contractors
    w9 = "W-9 Form"
    contractor_agreement = "Independent Contractor Agreement"
    liability_insurance = "Liability Insurance Certificate"
    background_check = "Background Check"
    cpr_certification = "CPR Certification"
    hipaa_training = "HIPAA Training Certificate"
    
    # NEW - For TTW participants
    ssdi_award_letter = "SSDI Award Letter"
    ipa_agreement = "Individual Plan for Achievement"
    benefits_counseling = "Benefits Counseling Certificate"
    
    other = "Other"
```

#### 3.3 New: Contractor Onboarding Table
```python
class ContractorOnboarding(Base):
    __tablename__ = "contractor_onboarding"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    onboarding_status = Column(String)  # "pending", "in_progress", "complete"
    documents_complete = Column(Boolean, default=False)
    training_complete = Column(Boolean, default=False)
    ready_for_assignment = Column(Boolean, default=False)
    assigned_coordinator = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    completed_at = Column(DateTime, nullable=True)
```

### 4. UI/UX Changes

#### 4.1 Navigation Updates
**Current sidebar:**
1. Dashboard
2. Timesheets
3. Documents
4. Programs
5. Job Opportunities
6. Learning Hub
7. My Profile

**Proposed sidebar (role-adaptive):**

**Admin View:**
1. Dashboard (all users overview)
2. User Management (employees/contractors/participants)
3. Approvals (timesheets/documents)
4. Programs
5. Opportunities
6. Learning Hub
7. Reports
8. Settings

**Employee/Contractor View:**
1. Dashboard (personal stats)
2. My Timesheets
3. My Documents
4. Training & Certifications
5. My Profile
6. Benefits (employees only)

**WBLE/TTW Participant View:**
1. Dashboard
2. Timesheets
3. Documents
4. Programs
5. Job Opportunities
6. Learning Hub
7. My Profile

#### 4.2 Dashboard Customization by Role

**Admin Dashboard:**
- Total users by type (employees/contractors/WBLE/TTW)
- Pending approvals (timesheets/documents/enrollments)
- Recent activity timeline
- Compliance alerts
- Revenue/hours summary

**Employee Dashboard:**
- My schedule
- Upcoming shifts/assignments
- Recent timesheets
- PTO balance
- Company announcements

**Contractor Dashboard:**
- Active assignments
- Hours YTD / Earnings
- Document expiration alerts (CPR, certs)
- Invoice/payment history
- Client feedback ratings

**WBLE Participant Dashboard (current):**
- Hours completed vs. authorized
- Pending documents
- Program progress
- Upcoming deadlines

**TTW Participant Dashboard:**
- Work hours vs. SGA threshold
- Benefits impact calculator
- Milestone tracking
- Support coordinator contact

---

## 📋 Questions for Cassandra

Before starting implementation, need clarity on:

### 1. Employee Requirements
- [ ] What documents do employees need to submit?
- [ ] Do employees track timesheets like contractors/participants?
- [ ] Are employees W-2 staff, or also 1099?
- [ ] Do employees need access to Learning Hub?
- [ ] Benefits tracking needed (PTO, insurance)?

### 2. Contractor Requirements  
- [ ] Are these the same contractors from the Sandhill portal? (Background check, driver's license, CPR, HIPAA, etc.)
- [ ] Do contractors need separate onboarding flow like Sandhill?
- [ ] Weekly timesheet format same as WBLE format?
- [ ] Payment/invoice tracking needed?
- [ ] Client assignment tracking?

### 3. Ticket to Work Participants
- [ ] What's different from WBLE participants?
- [ ] Do TTW participants submit timesheets?
- [ ] What documents do TTW participants need?
- [ ] Is there benefit impact tracking needed (SSDI/SSI)?
- [ ] Relationship with VR counselors/coordinators?

### 4. Shared Features
- [ ] Can one user have multiple roles? (e.g., contractor + WBLE participant)
- [ ] Should job opportunities be filtered by user type?
- [ ] Is Learning Hub content role-specific?
- [ ] Any role-specific notifications/announcements?

### 5. Migration
- [ ] Are current students staying as "WBLE participants"?
- [ ] Any existing employees/contractors to import?
- [ ] Cutover timeline/testing period?

---

## 🚀 Implementation Phases

### Phase 1: Database & Backend (Week 1)
- [ ] Expand `UserRole` enum
- [ ] Add new fields to User model
- [ ] Create migration script
- [ ] Update DocumentType enum
- [ ] Add ContractorOnboarding model
- [ ] Update authentication/authorization middleware
- [ ] Update API endpoints for role-based access
- [ ] Seed test data for new roles

**Deliverable:** Backend supports all 5 user types with proper permissions

### Phase 2: Admin Portal Enhancements (Week 2)
- [ ] User management dashboard (add/edit/delete users by type)
- [ ] Role-based approval queues
- [ ] User type filter/search
- [ ] Bulk actions (approve documents, etc.)
- [ ] Reporting by user type

**Deliverable:** Admins can manage all user types

### Phase 3: Employee/Contractor Portals (Week 3)
- [ ] Employee dashboard and timesheet flow
- [ ] Contractor dashboard and onboarding flow
- [ ] Document upload specific to each role
- [ ] Contractor assignment tracking (if needed)

**Deliverable:** Employees and contractors have functional portals

### Phase 4: TTW Participant Portal (Week 4)
- [ ] TTW-specific dashboard
- [ ] TTW document requirements
- [ ] Benefits impact tracking (if needed)
- [ ] Coordinator communication features

**Deliverable:** TTW participants have functional portal

### Phase 5: Polish & Migration (Week 5)
- [ ] Rename "student" → "WBLE participant" throughout UI
- [ ] Role-adaptive navigation
- [ ] Mobile responsive testing
- [ ] Data migration script
- [ ] User acceptance testing

**Deliverable:** Production-ready unified portal

---

## 💰 Budget Impact

**Estimated Development Time:**
- Phase 1 (Backend): 20-25 hours
- Phase 2 (Admin): 15-20 hours
- Phase 3 (Employee/Contractor): 20-25 hours
- Phase 4 (TTW): 15-20 hours
- Phase 5 (Polish): 10-15 hours

**Total:** ~80-105 hours @ your hourly rate

**Infrastructure:**
- No additional costs (same AWS/hosting as current)
- May need more storage for additional documents

---

## 📝 Next Steps

1. **Review this plan with Cassandra** ✅ (you're reading it!)
2. **Answer the questions above** (especially contractor vs. Sandhill overlap)
3. **Get approval to proceed**
4. **Start Phase 1 database changes**

---

## 🔗 Related Files
- Current README: `~/Documents/Programs/webapps/custys/CareerFocus/README.md`
- Database models: `backend/app/models/`
- API routes: `backend/app/api/`
- Frontend pages: `Protoype/src/pages/`

---

**Questions or changes?** Let me know and I'll update this plan! 🦾
