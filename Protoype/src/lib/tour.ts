import { driver, type DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';

const TOUR_VERSION = 'v1';

const adminSteps: DriveStep[] = [
  {
    popover: {
      title: '👋 Welcome, Admin',
      description:
        "Quick 90-second tour of your portal. You'll see what each section does and where to click.",
    },
  },
  {
    element: '[data-tour="nav-dashboard"]',
    popover: {
      title: '📊 Overview',
      description:
        'Your home base — total users, pending approvals, and recent activity at a glance.',
      side: 'right',
    },
  },
  {
    element: '[data-tour="nav-users"]',
    popover: {
      title: '👥 Users',
      description:
        'Every WBLE student, contractor, employee, and TTW participant. Filter by role, search, click any user for full profile.',
      side: 'right',
    },
  },
  {
    element: '[data-tour="nav-approvals"]',
    popover: {
      title: '✅ Approvals',
      description:
        'Where the daily work happens — review and approve weekly timesheets and uploaded documents.',
      side: 'right',
    },
  },
  {
    element: '[data-tour="nav-programs"]',
    popover: {
      title: '🎯 Programs',
      description:
        'Create new WBLE programs, edit dates, set capacity, change status (open / in progress / closed).',
      side: 'right',
    },
  },
  {
    element: '[data-tour="nav-opportunities"]',
    popover: {
      title: '💼 Opportunities',
      description:
        'Post job listings — internships, pathways, part-time roles. Star ones to feature them at the top of the student board.',
      side: 'right',
    },
  },
  {
    popover: {
      title: '🎉 You\'re ready',
      description:
        "That's the whole admin portal. Click the <strong>?</strong> button up top anytime to replay this tour.",
    },
  },
];

const studentSteps: DriveStep[] = [
  {
    popover: {
      title: '👋 Welcome to Career Focus',
      description: 'Quick tour to show you around. Takes 60 seconds.',
    },
  },
  {
    element: '[data-tour="nav-dashboard"]',
    popover: {
      title: '🏠 Dashboard',
      description:
        'Your home — see your program status, this week\'s timesheet, pending docs, and learning progress.',
      side: 'right',
    },
  },
  {
    element: '[data-tour="nav-timesheet"]',
    popover: {
      title: '⏰ Timesheets',
      description:
        'Submit your weekly hours here. Sign with your finger or mouse. Once approved, download the official PDF.',
      side: 'right',
    },
  },
  {
    element: '[data-tour="nav-documents"]',
    popover: {
      title: '📄 Documents',
      description:
        'Upload your W-4, photo ID, and other onboarding docs. Track approval status here.',
      side: 'right',
    },
  },
  {
    element: '[data-tour="nav-programs"]',
    popover: {
      title: '🎯 Programs',
      description:
        'Browse available WBLE programs and enroll. See the ones you\'re already in.',
      side: 'right',
    },
  },
  {
    element: '[data-tour="nav-opportunities"]',
    popover: {
      title: '💼 Job Opportunities',
      description:
        'Internships, pathways, part-time jobs. Filter and apply right from here.',
      side: 'right',
    },
  },
  {
    element: '[data-tour="nav-learning"]',
    popover: {
      title: '📚 Learning Hub',
      description:
        '8 short lessons on payroll, workplace skills, and professional development. Resume where you left off.',
      side: 'right',
    },
  },
  {
    element: '[data-tour="nav-profile"]',
    popover: {
      title: '👤 Profile',
      description:
        'Update your contact info, address, emergency contacts, and profile photo.',
      side: 'right',
    },
  },
  {
    popover: {
      title: '🎉 All set!',
      description:
        "Hit the <strong>?</strong> button up top anytime to see this tour again.",
    },
  },
];

const contractorSteps: DriveStep[] = [
  {
    popover: {
      title: '👋 Welcome, Contractor',
      description: 'Quick tour of your onboarding portal.',
    },
  },
  {
    element: '[data-tour="nav-dashboard"]',
    popover: {
      title: '📋 Onboarding Checklist',
      description:
        'Your dashboard tracks the 9 documents required to start: I-9, W-4, direct deposit, ID, SSN, background check, CPR, HIPAA, zero tolerance.',
      side: 'right',
    },
  },
  {
    element: '[data-tour="nav-documents"]',
    popover: {
      title: '📄 Upload Documents',
      description:
        'This is where you upload each required document. Admin reviews → you get notified when approved.',
      side: 'right',
    },
  },
  {
    element: '[data-tour="nav-timesheet"]',
    popover: {
      title: '⏰ Timesheets',
      description: 'Once active, log your weekly hours here.',
      side: 'right',
    },
  },
  {
    element: '[data-tour="nav-opportunities"]',
    popover: {
      title: '💼 Opportunities',
      description: 'Available contractor opportunities and assignments.',
      side: 'right',
    },
  },
  {
    popover: {
      title: '🎉 Ready to start',
      description:
        "Begin by uploading your documents. Replay this tour anytime via the <strong>?</strong> button.",
    },
  },
];

const employeeSteps: DriveStep[] = [
  {
    popover: {
      title: '👋 Welcome',
      description: 'Quick tour of your employee portal.',
    },
  },
  {
    element: '[data-tour="nav-dashboard"]',
    popover: {
      title: '📰 Dashboard',
      description: 'Company announcements and quick links.',
      side: 'right',
    },
  },
  {
    element: '[data-tour="nav-documents"]',
    popover: {
      title: '📄 Documents',
      description: 'Upload your W-4, I-9, and ID for HR.',
      side: 'right',
    },
  },
  {
    element: '[data-tour="nav-learning"]',
    popover: {
      title: '📚 Learning Hub',
      description: 'Required and optional training modules.',
      side: 'right',
    },
  },
  {
    popover: {
      title: '🎉 You\'re set',
      description: "Click the <strong>?</strong> up top to replay this tour anytime.",
    },
  },
];

const ttwSteps: DriveStep[] = [
  {
    popover: {
      title: '👋 Welcome to Ticket to Work',
      description: 'Quick tour of your TTW portal.',
    },
  },
  {
    element: '[data-tour="nav-dashboard"]',
    popover: {
      title: '📊 Dashboard + SGA Tracker',
      description:
        'See your monthly earnings vs. the Substantial Gainful Activity threshold ($1,550/mo). Stay under to keep benefits.',
      side: 'right',
    },
  },
  {
    element: '[data-tour="nav-timesheet"]',
    popover: {
      title: '⏰ Timesheets',
      description: 'Log your work hours weekly. Auto-feeds the SGA tracker.',
      side: 'right',
    },
  },
  {
    element: '[data-tour="nav-documents"]',
    popover: {
      title: '📄 Documents',
      description:
        'Upload your SSDI/SSI award letter, benefits counseling cert, VR referral, and standard onboarding docs.',
      side: 'right',
    },
  },
  {
    element: '[data-tour="nav-programs"]',
    popover: {
      title: '🎯 Programs',
      description: 'Available work-based learning programs.',
      side: 'right',
    },
  },
  {
    popover: {
      title: '🎉 Ready',
      description: "Click <strong>?</strong> up top to see this tour again.",
    },
  },
];

const TOURS: Record<string, DriveStep[]> = {
  admin: adminSteps,
  student: studentSteps,
  wble_participant: studentSteps,
  contractor: contractorSteps,
  employee: employeeSteps,
  ttw_participant: ttwSteps,
};

function tourKey(role: string) {
  return `cf-tour-${TOUR_VERSION}-${role}`;
}

export function startTour(role: string, force = false) {
  const steps = TOURS[role] || studentSteps;
  if (!force && localStorage.getItem(tourKey(role))) return;

  const d = driver({
    showProgress: true,
    allowClose: true,
    overlayOpacity: 0.6,
    stagePadding: 6,
    stageRadius: 8,
    smoothScroll: true,
    nextBtnText: 'Next →',
    prevBtnText: '← Back',
    doneBtnText: 'Got it',
    steps,
    onDestroyed: () => {
      localStorage.setItem(tourKey(role), Date.now().toString());
    },
  });

  d.drive();
}

export function hasSeenTour(role: string): boolean {
  return !!localStorage.getItem(tourKey(role));
}
