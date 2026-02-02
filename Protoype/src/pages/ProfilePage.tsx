import React, { useEffect, useState } from 'react';
import { User, Mail, Phone, MapPin, Lock, Save, ExternalLink, Info, Loader2 } from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { StatusBadge } from '../components/ui/StatusBadge';
import { api, User as UserType } from '../services/api';
import { useToast } from '../components/ui/Toast';

interface ProfilePageProps {
  onLogout: () => void;
}

export function ProfilePage({ onLogout }: ProfilePageProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
    case_id: '',
    job_title: '',
  });
  const toast = useToast();

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      const { data, error } = await api.getCurrentUser();
      if (data) {
        setUser(data);
        setFormData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          phone: data.phone || '',
          address: data.address || '',
          emergency_contact_name: data.emergency_contact_name || '',
          emergency_contact_phone: data.emergency_contact_phone || '',
          emergency_contact_relationship: data.emergency_contact_relationship || '',
          case_id: data.case_id || '',
          job_title: data.job_title || '',
        });
      }
      setLoading(false);
    }
    fetchUser();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);

    const { data, error } = await api.updateProfile(formData);

    if (data) {
      setUser(data);
      toast.success('Profile updated successfully!');
    } else {
      toast.error(error || 'Failed to update profile');
    }

    setSaving(false);
  };

  const getInitials = () => {
    if (!user) return '';
    return `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase();
  };

  if (loading) {
    return (
      <DashboardLayout title="My Profile" userType="student" onLogout={onLogout}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Profile" userType="student" onLogout={onLogout}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Avatar & Basic Info */}
        <div className="space-y-6">
          <Card className="text-center p-6">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-lg">
              <span className="text-2xl font-bold text-blue-600">{getInitials()}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              {user?.first_name} {user?.last_name}
            </h2>
            <p className="text-slate-500 text-sm capitalize">{user?.role} Account</p>
            <div className="mt-4 flex justify-center">
              <StatusBadge status={user?.is_active ? 'success' : 'warning'}>
                {user?.is_active ? 'Active' : 'Inactive'}
              </StatusBadge>
            </div>
            <div className="mt-6 pt-6 border-t border-slate-100 text-left space-y-3">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>{user?.email}</span>
              </div>
              {user?.phone && (
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>{user.phone}</span>
                </div>
              )}
              {user?.address && (
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>{user.address}</span>
                </div>
              )}
            </div>
          </Card>

          <Card title="Security">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">Password</p>
                  <p className="text-xs text-slate-500">Change your password</p>
                </div>
                <Button variant="outline" size="sm">
                  Change
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
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  leftIcon={saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="First Name"
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
              />
              <Input
                label="Last Name"
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
              />
              <Input
                label="Email Address"
                value={user?.email || ''}
                disabled
              />
              <Input
                label="Phone Number"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="(555) 123-4567"
              />
              <Input
                label="Case ID (Participant ID)"
                value={formData.case_id}
                onChange={(e) => handleInputChange('case_id', e.target.value)}
                placeholder="Enter your Case ID"
              />
              <Input
                label="Job Title"
                value={formData.job_title}
                onChange={(e) => handleInputChange('job_title', e.target.value)}
                placeholder="e.g., Administrative Assistant"
              />
              <div className="md:col-span-2">
                <Input
                  label="Address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="123 Main St, City, State"
                />
              </div>
            </div>
          </Card>

          <Card title="Emergency Contact">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Contact Name"
                value={formData.emergency_contact_name}
                onChange={(e) => handleInputChange('emergency_contact_name', e.target.value)}
                placeholder="Full name"
              />
              <Input
                label="Relationship"
                value={formData.emergency_contact_relationship}
                onChange={(e) => handleInputChange('emergency_contact_relationship', e.target.value)}
                placeholder="e.g., Parent, Spouse"
              />
              <Input
                label="Phone Number"
                value={formData.emergency_contact_phone}
                onChange={(e) => handleInputChange('emergency_contact_phone', e.target.value)}
                placeholder="(555) 123-4567"
              />
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
    </DashboardLayout>
  );
}
