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
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { api, LearningProgress } from '@/services/api';
import { useToast } from '@/components/ui/Toast';

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

export function LearningHubPage() {
  const toast = useToast();
  const [selectedLesson, setSelectedLesson] = useState<typeof lessonsData[0] | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmLessonId, setConfirmLessonId] = useState<number | null>(null);

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
    const { data, error } = await api.updateLessonProgress(lessonId, true);
    if (data) {
      setCompletedLessons(prev => new Set([...prev, lessonId]));
      toast.success('Lesson marked as complete!');
    } else {
      toast.error(error || 'Failed to save progress');
    }
    setSaving(false);
  };

  const handleMarkCompleteClick = (lessonId: number) => {
    setConfirmLessonId(lessonId);
  };

  const handleConfirmComplete = async () => {
    if (confirmLessonId !== null) {
      await markComplete(confirmLessonId);
      setConfirmLessonId(null);
    }
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
      <DashboardLayout title="Learning Hub">
        <div className="space-y-6">
          {/* Progress skeleton */}
          <Skeleton className="h-32 w-full rounded-lg" />
          {/* Note skeleton */}
          <Skeleton className="h-16 w-full rounded-lg" />
          {/* Category heading skeleton */}
          <Skeleton className="h-6 w-40" />
          {/* Lesson card skeletons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Card key={i} className="p-6">
                <div className="flex items-start gap-4">
                  <Skeleton className="w-12 h-12 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
          {/* Second category */}
          <Skeleton className="h-6 w-32" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[5, 6, 7, 8].map(i => (
              <Card key={i} className="p-6">
                <div className="flex items-start gap-4">
                  <Skeleton className="w-12 h-12 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Learning Hub">
      {/* AlertDialog for lesson completion confirmation */}
      <AlertDialog open={confirmLessonId !== null} onOpenChange={(open) => { if (!open) setConfirmLessonId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark Lesson as Complete?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the lesson as completed in your learning progress. You can still revisit the lesson anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmComplete} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {selectedLesson ? (
        // Lesson View
        <div className="max-w-3xl mx-auto animate-fade-in">
          <Button
            variant="ghost"
            onClick={() => setSelectedLesson(null)}
            className="mb-6 text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Back to all lessons
          </Button>

          {/* Lesson Header */}
          <Card className="mb-6 animate-fade-in-up">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <selectedLesson.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary">{selectedLesson.category}</Badge>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {selectedLesson.duration} read
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold text-foreground">{selectedLesson.title}</h1>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lesson Content */}
          <Card className="mb-6 animate-fade-in-up animate-delay-100">
            <CardContent className="p-6">
              <p className="text-lg text-muted-foreground mb-6">{selectedLesson.content.intro}</p>
              {selectedLesson.content.sections.map((section, index) => (
                <div key={index} className="mb-6 last:mb-0">
                  <h3 className="text-lg font-semibold text-foreground mb-2">{section.heading}</h3>
                  <p className="text-muted-foreground">{section.text}</p>
                  {index < selectedLesson.content.sections.length - 1 && (
                    <Separator className="mt-6" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Key Takeaway */}
          <Card className="mb-6 glass-card border-l-4 border-l-primary animate-fade-in-up animate-delay-200">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Key Takeaway</h3>
                  <p className="text-muted-foreground">{selectedLesson.content.takeaway}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Step */}
          <Card className="mb-6 bg-success/5 border-success/20 animate-fade-in-up animate-delay-300">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-success rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-success-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Your Action Step</h3>
                  <p className="text-muted-foreground">{selectedLesson.content.actionStep}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            {selectedLesson.id > 1 ? (
              <Button
                variant="outline"
                onClick={() => setSelectedLesson(lessonsData[selectedLesson.id - 2])}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
            ) : <div />}

            <div className="flex gap-3">
              {!completedLessons.has(selectedLesson.id) && (
                <Button
                  onClick={() => handleMarkCompleteClick(selectedLesson.id)}
                  isLoading={saving}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
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
                >
                  Next Lesson
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={() => setSelectedLesson(null)}
                >
                  Finish
                  <Award className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        // Lessons List View
        <>
          {/* Progress Banner */}
          <Card className="mb-8 bg-gradient-to-r from-primary via-primary to-accent text-primary-foreground border-none shine-effect animate-fade-in">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold mb-1">Your Learning Progress</h2>
                  <p className="text-primary-foreground/80">{completedCount} of {lessons.length} lessons completed</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32">
                    <Progress value={progressPercentage} className="h-3 bg-primary-foreground/20 [&>div]:bg-primary-foreground" />
                    <p className="text-sm text-primary-foreground/80 mt-1 text-right">{progressPercentage}%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ADP Notice */}
          <Card className="mb-8 bg-warning/10 border-warning/30 animate-fade-in animate-delay-100">
            <CardContent className="p-4">
              <p className="text-sm text-warning-foreground">
                <strong>Note:</strong> Payroll and direct deposit information are managed securely through ADP.
                This portal does not collect or store payroll data.
              </p>
            </CardContent>
          </Card>

          {/* Lessons by Category */}
          {categories.map((category, catIndex) => (
            <div key={category} className={`mb-8 animate-fade-in ${catIndex === 0 ? 'animate-delay-200' : catIndex === 1 ? 'animate-delay-300' : 'animate-delay-400'}`}>
              <h2 className="text-lg font-semibold text-foreground mb-4">{category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lessons.filter((lesson) => lesson.category === category).map((lesson, lessonIndex) => (
                  <Card
                    key={lesson.id}
                    className={`cursor-pointer transition-all hover:border-primary/30 hover:shadow-md hover-lift animate-fade-in-up ${lessonIndex === 0 ? 'animate-delay-100' : lessonIndex === 1 ? 'animate-delay-200' : lessonIndex === 2 ? 'animate-delay-300' : 'animate-delay-400'} ${lesson.completed ? 'bg-success/5' : ''}`}
                    onClick={() => setSelectedLesson(lessonsData.find(l => l.id === lesson.id) || null)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${lesson.completed ? 'bg-success/10' : 'bg-primary/10'}`}>
                          {lesson.completed ? (
                            <CheckCircle className="w-6 h-6 text-success" />
                          ) : (
                            <lesson.icon className="w-6 h-6 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground">{lesson.title}</h3>
                            {lesson.completed && <Badge variant="success">Done</Badge>}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {lesson.duration}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}

          {/* Continue Learning CTA */}
          {completedCount < lessons.length && (
            <Card className="bg-gradient-to-br from-primary to-accent text-white border-none animate-fade-in animate-delay-500">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Continue Learning</h3>
                    <p className="text-white/70">
                      Next up: <span className="text-white font-medium">
                        {lessons.find(l => !l.completed)?.title}
                      </span>
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => setSelectedLesson(lessonsData.find(l => !completedLessons.has(l.id)) || null)}
                  >
                    Start Lesson
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
