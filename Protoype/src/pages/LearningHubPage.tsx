import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Clock,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Lightbulb,
  ArrowRight,
  Award,
  DollarSign,
  FileText,
  Calculator,
  Calendar,
  AlertTriangle,
  Phone,
  Loader2
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { api, LearningProgress } from '../services/api';

interface LearningHubPageProps {
  onLogout: () => void;
}

// Lesson content data (static)
const lessonsData = [
  {
    id: 1,
    title: 'Understanding Your Paycheck',
    icon: DollarSign,
    duration: '3 min',
    category: 'Getting Started',
    content: {
      intro: "Your paycheck is the money you earn for your work. Let's break down what it means and why it matters.",
      sections: [
        { heading: 'What is a paycheck?', text: "A paycheck is the payment you receive from your employer for the hours you've worked. It can come as a physical check or be deposited directly into your bank account (called direct deposit)." },
        { heading: 'Gross Pay vs. Net Pay', text: "Gross pay is the total amount you earned before anything is taken out. Net pay (also called 'take-home pay') is what you actually receive after deductions like taxes. Your net pay will always be less than your gross pay." },
        { heading: 'Why does this matter?', text: "Understanding your paycheck helps you budget your money, make sure you're paid correctly, and know what's being taken out and why." }
      ],
      takeaway: "Your paycheck shows what you earned (gross pay) and what you take home (net pay) after deductions.",
      actionStep: "When you get your next paycheck, find the gross pay and net pay amounts."
    }
  },
  {
    id: 2,
    title: 'How Getting Paid Works',
    icon: Calendar,
    duration: '4 min',
    category: 'Getting Started',
    content: {
      intro: "Getting paid involves a few steps between working your hours and seeing money in your account. Here's how it works.",
      sections: [
        { heading: 'The Pay Cycle', text: "Most employers pay on a regular schedule called a pay cycle. Common pay cycles are weekly (every week), bi-weekly (every two weeks), or semi-monthly (twice a month on set dates)." },
        { heading: 'Timesheets', text: "Before you can get paid, you need to report your hours. This is done through a timesheet, which you submit at the end of each pay period." },
        { heading: 'Processing Time', text: "After you submit your timesheet, your employer needs time to review and process your pay. This usually takes a few days." },
        { heading: 'Direct Deposit', text: "Most paychecks are sent directly to your bank account. This is faster and safer than a paper check." }
      ],
      takeaway: "Getting paid follows a cycle: you work, submit your timesheet, your employer processes it, and then you receive your pay.",
      actionStep: "Find out what pay cycle your program uses (weekly, bi-weekly, or semi-monthly)."
    }
  },
  {
    id: 3,
    title: 'Reading a Pay Stub',
    icon: FileText,
    duration: '5 min',
    category: 'Paychecks',
    content: {
      intro: "A pay stub is a detailed breakdown of your paycheck. Learning to read it helps you verify you're being paid correctly.",
      sections: [
        { heading: "What's on a pay stub?", text: "Your pay stub shows: your name and employee info, pay period dates, hours worked, pay rate, gross earnings, all deductions (taxes, etc.), and your net pay." },
        { heading: 'Earnings Section', text: "This shows your gross pay - the total amount earned before deductions. It includes your regular hours and any overtime." },
        { heading: 'Deductions Section', text: "Deductions are amounts taken out of your pay. Common deductions include Federal Income Tax, State Income Tax, Social Security (FICA), and Medicare." },
        { heading: 'Year-to-Date (YTD)', text: "Many pay stubs show YTD totals - how much you've earned and paid in deductions so far this year." }
      ],
      takeaway: "Your pay stub has three main parts: what you earned (gross), what was taken out (deductions), and what you receive (net).",
      actionStep: "Look at your most recent pay stub and identify the gross pay, deductions, and net pay."
    }
  },
  {
    id: 4,
    title: 'Timesheets Made Simple',
    icon: Clock,
    duration: '4 min',
    category: 'Timesheets',
    content: {
      intro: "Timesheets track the hours you work. Submitting them correctly and on time ensures you get paid accurately.",
      sections: [
        { heading: 'What to track', text: "For each day you work, record: the date, start time, end time, and any break time. Be accurate - your pay depends on it!" },
        { heading: 'When to submit', text: "Timesheets have deadlines, usually at the end of each pay period. Late timesheets can delay your pay." },
        { heading: 'Tips for accuracy', text: "Record your hours daily instead of trying to remember at the end of the week. Double-check your math before submitting." },
        { heading: 'What if you make a mistake?', text: "If you submit a timesheet and later realize there's an error, contact your supervisor right away." }
      ],
      takeaway: "Submit accurate timesheets on time to ensure you get paid correctly.",
      actionStep: "Set a weekly reminder on your phone to complete your timesheet before the deadline."
    }
  },
  {
    id: 5,
    title: 'Why Taxes Come Out',
    icon: Calculator,
    duration: '4 min',
    category: 'Paychecks',
    content: {
      intro: "Seeing money taken from your paycheck for taxes can be surprising. Here's why it happens and where that money goes.",
      sections: [
        { heading: 'What are taxes?', text: "Taxes are payments to the government that fund public services like roads, schools, healthcare programs, and emergency services." },
        { heading: 'Federal Income Tax', text: "This goes to the U.S. government. The amount depends on how much you earn - the more you earn, the higher percentage you pay." },
        { heading: 'State Income Tax', text: "Most states also collect income tax (though some don't). This funds state programs and services." },
        { heading: 'FICA Taxes', text: "These fund retirement and healthcare programs. Everyone pays the same percentage: 6.2% for Social Security and 1.45% for Medicare." }
      ],
      takeaway: "Tax deductions fund public services and programs like Social Security that you may benefit from later in life.",
      actionStep: "Look at your pay stub and add up all the tax deductions to see your total tax contribution."
    }
  },
  {
    id: 6,
    title: 'When You Get Paid',
    icon: Calendar,
    duration: '3 min',
    category: 'Paychecks',
    content: {
      intro: "Knowing when to expect your pay helps you plan your budget and avoid surprises.",
      sections: [
        { heading: 'Pay Day Schedule', text: "Your employer has a set pay day - the day your money arrives. This might be every Friday, every other Friday, or specific dates." },
        { heading: 'Pay Period vs. Pay Day', text: "The pay period is the time you worked (like Oct 1-14). Pay day is when you receive money for that period (like Oct 20)." },
        { heading: 'Direct Deposit Timing', text: "With direct deposit, money usually appears in your bank account early on pay day morning." },
        { heading: 'Holidays and Delays', text: "If pay day falls on a holiday or weekend, you might get paid earlier (Friday before) or later (Monday after)." }
      ],
      takeaway: "Know your pay day and the pay period it covers so you can budget and plan accordingly.",
      actionStep: "Write down your program's pay day schedule and mark pay days on your calendar."
    }
  },
  {
    id: 7,
    title: 'What to Do If Something Looks Wrong',
    icon: AlertTriangle,
    duration: '4 min',
    category: 'Problem Solving',
    content: {
      intro: "Mistakes happen. If something looks wrong with your pay, don't panic - there's a clear process to fix it.",
      sections: [
        { heading: 'Common issues to watch for', text: "Check for: missing hours, wrong pay rate, unexpected deductions, or math errors. Compare your timesheet to your pay stub." },
        { heading: 'First step: Double-check', text: "Before reporting an issue, review your own records. Did you record all your hours correctly? Did you account for breaks?" },
        { heading: 'How to report a problem', text: "If you find a real issue, contact your supervisor or the payroll contact right away. Be specific about the problem." },
        { heading: 'Keep records', text: "Save your timesheets and pay stubs. If there's ever a dispute, having your own records makes it much easier to resolve." }
      ],
      takeaway: "If your pay looks wrong, check your records first, then report specific details to your supervisor promptly.",
      actionStep: "Create a folder (physical or digital) to save copies of all your timesheets and pay stubs."
    }
  },
  {
    id: 8,
    title: 'Who to Contact for Help',
    icon: Phone,
    duration: '3 min',
    category: 'Problem Solving',
    content: {
      intro: "Knowing who to ask for help makes solving problems faster and less stressful.",
      sections: [
        { heading: 'Your Supervisor', text: "Contact your supervisor for: timesheet questions, schedule changes, hours discrepancies, and general work-related issues." },
        { heading: 'Career Focus Staff', text: "Contact Career Focus for: program questions, paperwork and documentation, concerns about your placement." },
        { heading: 'Payroll/ADP', text: "For direct deposit setup and banking changes, tax withholding questions (W-4), and pay stub access, you may need to use the ADP system." },
        { heading: 'When to escalate', text: "If you've contacted the right person and your issue isn't resolved within a reasonable time, it's okay to follow up or ask for additional help." }
      ],
      takeaway: "Different questions go to different people: supervisor for work issues, Career Focus for program issues, and ADP for payroll setup.",
      actionStep: "Save your supervisor's contact info and the Career Focus support number in your phone."
    }
  }
];

export function LearningHubPage({ onLogout }: LearningHubPageProps) {
  const [selectedLesson, setSelectedLesson] = useState<typeof lessonsData[0] | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch progress from API
  useEffect(() => {
    async function fetchProgress() {
      setLoading(true);
      const { data } = await api.getLearningProgress();
      if (data) {
        const completed = new Set(data.filter(p => p.completed).map(p => p.lesson_id));
        setCompletedLessons(completed);
      }
      setLoading(false);
    }
    fetchProgress();
  }, []);

  // Mark lesson as complete
  const markComplete = async (lessonId: number) => {
    setSaving(true);
    const { data } = await api.updateLessonProgress(lessonId, true);
    if (data) {
      setCompletedLessons(prev => new Set([...prev, lessonId]));
    }
    setSaving(false);
  };

  const lessons = lessonsData.map(lesson => ({
    ...lesson,
    completed: completedLessons.has(lesson.id)
  }));

  const completedCount = completedLessons.size;
  const progressPercentage = Math.round((completedCount / lessons.length) * 100);
  const categories = [...new Set(lessons.map(l => l.category))];

  if (loading) {
    return (
      <DashboardLayout title="Learning Hub" userType="student" onLogout={onLogout}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Learning Hub" userType="student" onLogout={onLogout}>
      {selectedLesson ? (
        // Lesson View
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => setSelectedLesson(null)}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back to all lessons</span>
          </button>

          <Card className="mb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <selectedLesson.icon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <StatusBadge status="neutral">{selectedLesson.category}</StatusBadge>
                  <span className="text-sm text-slate-500 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {selectedLesson.duration} read
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900">{selectedLesson.title}</h1>
              </div>
            </div>
          </Card>

          <Card className="mb-6">
            <div className="prose prose-slate max-w-none">
              <p className="text-lg text-slate-600 mb-6">{selectedLesson.content.intro}</p>
              {selectedLesson.content.sections.map((section, index) => (
                <div key={index} className="mb-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{section.heading}</h3>
                  <p className="text-slate-600">{section.text}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="mb-6 bg-blue-50 border-blue-200">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Key Takeaway</h3>
                <p className="text-slate-700">{selectedLesson.content.takeaway}</p>
              </div>
            </div>
          </Card>

          <Card className="mb-6 bg-green-50 border-green-200">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Your Action Step</h3>
                <p className="text-slate-700">{selectedLesson.content.actionStep}</p>
              </div>
            </div>
          </Card>

          <div className="flex justify-between items-center">
            {selectedLesson.id > 1 ? (
              <Button
                variant="outline"
                onClick={() => setSelectedLesson(lessonsData[selectedLesson.id - 2])}
                leftIcon={<ChevronLeft className="w-4 h-4" />}
              >
                Previous
              </Button>
            ) : <div />}

            <div className="flex gap-3">
              {!completedLessons.has(selectedLesson.id) && (
                <Button
                  variant="primary"
                  onClick={() => markComplete(selectedLesson.id)}
                  isLoading={saving}
                  leftIcon={<CheckCircle className="w-4 h-4" />}
                >
                  Mark Complete
                </Button>
              )}
              {selectedLesson.id < lessons.length ? (
                <Button
                  onClick={() => {
                    if (!completedLessons.has(selectedLesson.id)) {
                      markComplete(selectedLesson.id);
                    }
                    setSelectedLesson(lessonsData[selectedLesson.id]);
                  }}
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  Next Lesson
                </Button>
              ) : (
                <Button
                  onClick={() => setSelectedLesson(null)}
                  rightIcon={<Award className="w-4 h-4" />}
                >
                  Finish
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        // Lessons List View
        <>
          <Card className="mb-8 bg-gradient-to-br from-purple-500 to-purple-600 text-white border-none">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold mb-1">Your Learning Progress</h2>
                <p className="text-purple-100">{completedCount} of {lessons.length} lessons completed</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-32">
                  <div className="w-full bg-purple-400/50 h-3 rounded-full overflow-hidden">
                    <div className="bg-white h-full rounded-full transition-all" style={{ width: `${progressPercentage}%` }} />
                  </div>
                  <p className="text-sm text-purple-100 mt-1 text-right">{progressPercentage}%</p>
                </div>
              </div>
            </div>
          </Card>

          <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> Payroll and direct deposit information are managed securely through ADP.
              This portal does not collect or store payroll data.
            </p>
          </div>

          {categories.map((category) => (
            <div key={category} className="mb-8">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">{category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lessons.filter((lesson) => lesson.category === category).map((lesson) => (
                  <Card
                    key={lesson.id}
                    className={`cursor-pointer transition-all hover:border-purple-300 hover:shadow-md ${lesson.completed ? 'bg-green-50/50' : ''}`}
                    onClick={() => setSelectedLesson(lessonsData.find(l => l.id === lesson.id) || null)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${lesson.completed ? 'bg-green-100' : 'bg-purple-100'}`}>
                        {lesson.completed ? (
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        ) : (
                          <lesson.icon className="w-6 h-6 text-purple-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-900">{lesson.title}</h3>
                          {lesson.completed && <StatusBadge status="success">Done</StatusBadge>}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {lesson.duration}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}

          {completedCount < lessons.length && (
            <Card className="bg-slate-900 text-white">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-lg mb-1">Continue Learning</h3>
                  <p className="text-slate-300">
                    Next up: <span className="text-white font-medium">
                      {lessons.find(l => !l.completed)?.title}
                    </span>
                  </p>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => setSelectedLesson(lessonsData.find(l => !completedLessons.has(l.id)) || null)}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Start Lesson
                </Button>
              </div>
            </Card>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
