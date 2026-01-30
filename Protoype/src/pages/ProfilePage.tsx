import React from 'react';
import { User, Mail, Phone, MapPin, Lock, Save, ExternalLink, Info } from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { StatusBadge } from '../components/ui/StatusBadge';
interface ProfilePageProps {
  onLogout: () => void;
}
export function ProfilePage({ onLogout }: ProfilePageProps) {
  return (
    <DashboardLayout title="My Profile" userType="student" onLogout={onLogout}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Avatar & Basic Info */}
        <div className="space-y-6">
          <Card className="text-center p-6">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-lg">
              <span className="text-2xl font-bold text-blue-600">JS</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">John Smith</h2>
            <p className="text-slate-500 text-sm">Computer Science Student</p>
            <div className="mt-4 flex justify-center">
              <StatusBadge status="success">Active Student</StatusBadge>
            </div>
            <div className="mt-6 pt-6 border-t border-slate-100 text-left space-y-3">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>john.smith@university.edu</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>(555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>San Francisco, CA</span>
              </div>
            </div>
          </Card>

          <Card title="Security">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">Password</p>
                  <p className="text-xs text-slate-500">
                    Last changed 3 months ago
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Change
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">2FA</p>
                  <p className="text-xs text-slate-500">Enabled via SMS</p>
                </div>
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Forms */}
        <div className="lg:col-span-2 space-y-6">
          <Card
            title="Personal Information"
            description="Update your personal details and contact information."
            footer={
            <div className="flex justify-end">
                <Button leftIcon={<Save className="w-4 h-4" />}>
                  Save Changes
                </Button>
              </div>
            }>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="First Name" defaultValue="John" />
              <Input label="Last Name" defaultValue="Smith" />
              <Input
                label="Email Address"
                defaultValue="john.smith@university.edu"
                disabled />

              <Input label="Phone Number" defaultValue="(555) 123-4567" />
              <div className="md:col-span-2">
                <Input
                  label="Address"
                  defaultValue="123 Campus Drive, Dorm A, Room 304" />

              </div>
            </div>
          </Card>

          <Card title="Emergency Contact">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Contact Name" defaultValue="Sarah Smith" />
              <Input label="Relationship" defaultValue="Mother" />
              <Input label="Phone Number" defaultValue="(555) 987-6543" />
              <Input
                label="Email (Optional)"
                defaultValue="sarah.smith@email.com" />

            </div>
          </Card>

          {/* ADP Payroll Disclaimer */}
          <Card className="bg-blue-50 border-blue-200">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Info className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 mb-2">Payroll & Direct Deposit</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Payroll and direct deposit information are managed securely through ADP.
                  This portal does not collect or store payroll data. You will receive separate
                  ADP credentials to manage your banking information and view pay statements.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  rightIcon={<ExternalLink className="w-4 h-4" />}
                  onClick={() => window.open('https://www.adp.com', '_blank')}
                >
                  Access ADP Portal
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>);

}