import React, { useEffect, useState } from 'react';
import { User, Mail, Phone, MapPin, Lock, Save, ExternalLink, Info, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { api, User as UserType } from '@/services/api';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

export function ProfilePage() {
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
      <DashboardLayout title="My Profile">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 flex flex-col items-center">
                <Skeleton className="w-24 h-24 rounded-full mb-4" />
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-28 mb-4" />
                <Skeleton className="h-5 w-16" />
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-72" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Profile">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
        {/* Left Column - Avatar & Basic Info */}
        <div className="space-y-6">
          <Card className="glass-card animate-fade-in-up">
            <CardContent className="p-6 text-center">
              <Avatar className="w-24 h-24 mx-auto mb-4 ring-4 ring-primary/10 shadow-lg">
                <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary/20 to-accent/20 text-primary">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold text-foreground">
                {user?.first_name} {user?.last_name}
              </h2>
              <p className="text-muted-foreground text-sm capitalize">{user?.role} Account</p>
              <div className="mt-4 flex justify-center">
                <Badge variant={user?.is_active ? 'success' : 'warning'}>
                  {user?.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="mt-6 pt-6 border-t border-border text-left space-y-3">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4 text-primary" />
                  <span>{user?.email}</span>
                </div>
                {user?.phone && (
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4 text-primary" />
                    <span>{user.phone}</span>
                  </div>
                )}
                {user?.address && (
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>{user.address}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in-up animate-delay-100">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-2 -m-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-foreground">Password</p>
                  <p className="text-xs text-muted-foreground">Change your password</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast.info('Please contact your administrator to change your password.')}
                >
                  Change
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Forms */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="animate-fade-in-up animate-delay-200">
            <CardHeader>
              <CardTitle className="text-lg">Personal Information</CardTitle>
              <CardDescription>
                Update your personal details and contact information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    value={user?.email || ''}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="case_id">Case ID (Participant ID)</Label>
                  <Input
                    id="case_id"
                    value={formData.case_id}
                    onChange={(e) => handleInputChange('case_id', e.target.value)}
                    placeholder="Enter your Case ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="job_title">Job Title</Label>
                  <Input
                    id="job_title"
                    value={formData.job_title}
                    onChange={(e) => handleInputChange('job_title', e.target.value)}
                    placeholder="e.g., Administrative Assistant"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="123 Main St, City, State"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-end border-t border-border pt-6">
              <Button
                variant="gradient"
                onClick={handleSave}
                disabled={saving}
                isLoading={saving}
              >
                {!saving && <Save className="mr-2 w-4 h-4" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardFooter>
          </Card>

          <Card className="animate-fade-in-up animate-delay-300">
            <CardHeader>
              <CardTitle className="text-lg">Emergency Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="emergency_name">Contact Name</Label>
                  <Input
                    id="emergency_name"
                    value={formData.emergency_contact_name}
                    onChange={(e) => handleInputChange('emergency_contact_name', e.target.value)}
                    placeholder="Full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergency_relationship">Relationship</Label>
                  <Input
                    id="emergency_relationship"
                    value={formData.emergency_contact_relationship}
                    onChange={(e) => handleInputChange('emergency_contact_relationship', e.target.value)}
                    placeholder="e.g., Parent, Spouse"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergency_phone">Phone Number</Label>
                  <Input
                    id="emergency_phone"
                    value={formData.emergency_contact_phone}
                    onChange={(e) => handleInputChange('emergency_contact_phone', e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ADP Payroll Disclaimer */}
          <Card className="bg-info/5 border-info/20 animate-fade-in-up animate-delay-400">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-info rounded-full flex items-center justify-center flex-shrink-0">
                  <Info className="w-5 h-5 text-info-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-2">Payroll & Direct Deposit</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Payroll and direct deposit information are managed securely through ADP.
                    This portal does not collect or store payroll data. You will receive separate
                    ADP credentials to manage your banking information and view pay statements.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('https://www.adp.com', '_blank')}
                  >
                    Access ADP Portal
                    <ExternalLink className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
