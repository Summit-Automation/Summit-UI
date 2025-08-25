'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { useTheme } from '@/contexts/ThemeContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

import { 
    User, 
    Palette, 
    Shield, 
    Database,
    Lock,
    Eye,
    EyeOff,
    Settings,
    Save,
    RefreshCw,
    Building
} from "lucide-react";

interface UserSettings {
    id?: string;
    user_id?: string;
    email_notifications: boolean;
    push_notifications: boolean;
    marketing_emails: boolean;
    theme: 'light' | 'dark' | 'system';
    language: string;
    timezone: string;
    currency: string;
    date_format: string;
    sound_enabled: boolean;
    auto_backup: boolean;
    two_factor_enabled: boolean;
    session_timeout: number;
    full_name?: string;
    phone?: string;
    company?: string;
    position?: string;
}

interface OrganizationSettings {
    id: string;
    name: string;
    slug: string;
    company_description?: string;
    company_services?: string;
    company_industry?: string;
    company_size?: string;
    company_website?: string;
    value_proposition?: string;
    target_market?: string;
    unique_selling_points?: string;
    case_studies?: string;
    pricing_model?: string;
    created_at?: string;
    updated_at?: string;
}

const defaultSettings: UserSettings = {
    email_notifications: true,
    push_notifications: true,
    marketing_emails: false,
    theme: 'dark',
    language: 'en',
    timezone: 'America/New_York',
    currency: 'USD',
    date_format: 'MM/dd/yyyy',
    sound_enabled: true,
    auto_backup: true,
    two_factor_enabled: false,
    session_timeout: 60,
    full_name: '',
    phone: '',
    company: '',
    position: ''
};

const defaultOrgSettings: Partial<OrganizationSettings> = {
    company_description: '',
    company_services: '',
    company_industry: '',
    company_size: '',
    company_website: '',
    value_proposition: '',
    target_market: '',
    unique_selling_points: '',
    case_studies: '',
    pricing_model: ''
};

export default function SettingsContent() {
    const [settings, setSettings] = useState<UserSettings>(defaultSettings);
    const [orgSettings, setOrgSettings] = useState<Partial<OrganizationSettings>>(defaultOrgSettings);
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savingOrg, setSavingOrg] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [hasUnsavedOrgChanges, setHasUnsavedOrgChanges] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const originalSettingsRef = useRef<UserSettings>(defaultSettings);
    const originalOrgSettingsRef = useRef<Partial<OrganizationSettings>>(defaultOrgSettings);

    const supabase = createClient();
    const { theme } = useTheme();
    const { currency, setCurrency } = useCurrency();

    const loadUserData = useCallback(async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            setUser(user);

            // Try to load user settings from database
            const { data: userSettings } = await supabase
                .from('user_settings')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (userSettings) {
                const newSettings = {
                    ...defaultSettings,
                    ...userSettings,
                    full_name: user.user_metadata?.full_name || '',
                };
                setSettings(newSettings);
                originalSettingsRef.current = newSettings;
            } else {
                // Create default settings for new user
                const { error } = await supabase
                    .from('user_settings')
                    .insert([{
                        user_id: user.id,
                        ...defaultSettings
                    }]);

                if (error) {
                    console.error('Error creating user settings:', error);
                    toast.error(`Error creating user settings: ${error.message || JSON.stringify(error)}`);
                }
                originalSettingsRef.current = defaultSettings;
            }

            // Load organization settings
            const organizationId = user.user_metadata?.organization_id;
            if (organizationId) {
                const { data: organization } = await supabase
                    .from('organizations')
                    .select('*')
                    .eq('id', organizationId)
                    .single();

                if (organization) {
                    const newOrgSettings = {
                        ...defaultOrgSettings,
                        ...organization
                    };
                    setOrgSettings(newOrgSettings);
                    originalOrgSettingsRef.current = newOrgSettings;
                }
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        } finally {
            setLoading(false);
        }
    }, [supabase]);

    useEffect(() => {
        loadUserData();
    }, [loadUserData]);


    const saveSettings = useCallback(async (showToast = true) => {
        setSaving(true);
        try {
            if (!user) return;

            const { error } = await supabase
                .from('user_settings')
                .upsert([{
                    user_id: user.id,
                    ...settings
                }]);

            if (error) throw error;

            // Update user metadata if profile info changed
            if (settings.full_name !== user.user_metadata?.full_name ||
                settings.phone !== user.user_metadata?.phone ||
                settings.company !== user.user_metadata?.company ||
                settings.position !== user.user_metadata?.position) {
                await supabase.auth.updateUser({
                    data: { 
                        full_name: settings.full_name,
                        phone: settings.phone,
                        company: settings.company,
                        position: settings.position
                    }
                });
                
                // Emit custom event to notify other components of user data update
                window.dispatchEvent(new CustomEvent('userDataUpdated'));
            }

            // Update the original settings reference
            originalSettingsRef.current = { ...settings };
            setHasUnsavedChanges(false);

            if (showToast) {
                toast.success('Settings saved successfully!');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            if (showToast) {
                toast.error(`Failed to save settings: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
            }
        } finally {
            setSaving(false);
        }
    }, [user, settings, supabase]);

    const saveOrgSettings = useCallback(async (showToast = true) => {
        setSavingOrg(true);
        try {
            if (!user || !user.user_metadata?.organization_id) return;

            const { error } = await supabase
                .from('organizations')
                .update({
                    company_description: orgSettings.company_description,
                    company_services: orgSettings.company_services,
                    company_industry: orgSettings.company_industry,
                    company_size: orgSettings.company_size,
                    company_website: orgSettings.company_website,
                    value_proposition: orgSettings.value_proposition,
                    target_market: orgSettings.target_market,
                    unique_selling_points: orgSettings.unique_selling_points,
                    case_studies: orgSettings.case_studies,
                    pricing_model: orgSettings.pricing_model,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.user_metadata.organization_id);

            if (error) throw error;

            // Update the original settings reference
            originalOrgSettingsRef.current = { ...orgSettings };
            setHasUnsavedOrgChanges(false);

            if (showToast) {
                toast.success('Company settings saved successfully!');
            }
        } catch (error) {
            console.error('Error saving organization settings:', error);
            if (showToast) {
                toast.error(`Failed to save company settings: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
            }
        } finally {
            setSavingOrg(false);
        }
    }, [user, orgSettings, supabase]);

    // Auto-save functionality
    const autoSave = useCallback(() => {
        if (autoSaveTimeoutRef.current) {
            clearTimeout(autoSaveTimeoutRef.current);
        }
        
        autoSaveTimeoutRef.current = setTimeout(() => {
            if (hasUnsavedChanges) {
                saveSettings(false); // Auto-save without toast
            }
            if (hasUnsavedOrgChanges) {
                saveOrgSettings(false); // Auto-save without toast
            }
        }, 2000); // Auto-save after 2 seconds of inactivity
    }, [hasUnsavedChanges, hasUnsavedOrgChanges, saveSettings, saveOrgSettings]);

    // Check for unsaved changes
    const checkForChanges = useCallback(() => {
        const hasChanges = JSON.stringify(settings) !== JSON.stringify(originalSettingsRef.current);
        setHasUnsavedChanges(hasChanges);
        
        const hasOrgChanges = JSON.stringify(orgSettings) !== JSON.stringify(originalOrgSettingsRef.current);
        setHasUnsavedOrgChanges(hasOrgChanges);
        
        if (hasChanges || hasOrgChanges) {
            autoSave();
        }
    }, [settings, orgSettings, autoSave]);

    // Effect to check for changes whenever settings change
    useEffect(() => {
        checkForChanges();
    }, [checkForChanges]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (autoSaveTimeoutRef.current) {
                clearTimeout(autoSaveTimeoutRef.current);
            }
        };
    }, []);

    const updatePassword = async () => {
        if (!newPassword || newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (newPassword.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }

        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            setNewPassword('');
            setConfirmPassword('');
            toast.success('Password updated successfully!');
        } catch (error) {
            console.error('Error updating password:', error);
            toast.error('Failed to update password');
        }
    };

    const handleSettingChange = (key: keyof UserSettings, value: string | boolean | number) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleOrgSettingChange = (key: keyof OrganizationSettings, value: string) => {
        setOrgSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleExportData = async (type: 'crm' | 'accounting' | 'all') => {
        try {
            const data: Record<string, { customers?: unknown[]; interactions?: unknown[]; transactions?: unknown[] }> = {};
            
            if (type === 'crm' || type === 'all') {
                const { data: customers } = await supabase.from('customers').select('*');
                const { data: interactions } = await supabase.from('interactions').select('*');
                data.crm = { customers: customers || [], interactions: interactions || [] };
            }
            
            if (type === 'accounting' || type === 'all') {
                const { data: transactions } = await supabase.from('transactions').select('*');
                data.accounting = { transactions: transactions || [] };
            }
            
            // Create and download JSON file
            const jsonString = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `summit-${type}-export-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            toast.success(`${type.toUpperCase()} data exported successfully!`);
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export data');
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                    <Card key={i} className="bg-slate-900/90 border border-slate-800/50 rounded-2xl card-bg">
                        <CardContent className="p-6">
                            <div className="h-8 w-32 bg-slate-700 rounded animate-pulse mb-4" />
                            <div className="h-4 w-48 bg-slate-700 rounded animate-pulse" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Unsaved changes indicator */}
            {(hasUnsavedChanges || hasUnsavedOrgChanges) && (
                <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                    <p className="text-sm text-amber-400">
                        You have unsaved changes. They will be automatically saved in a few seconds.
                    </p>
                </div>
            )}

            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-5 h-11 bg-slate-900/60 rounded-2xl border border-slate-800/40 p-1 overflow-x-auto">
                    <TabsTrigger 
                        value="profile" 
                        className="flex items-center gap-2 text-sm px-2 lg:px-4 rounded-xl data-[state=active]:bg-slate-800 data-[state=active]:text-white data-[state=active]:shadow-md text-slate-400 hover:text-slate-300 transition-all duration-200 font-medium min-w-0 flex-shrink-0"
                    >
                        <User className="h-4 w-4 flex-shrink-0" />
                        <span className="hidden sm:inline truncate">Profile</span>
                    </TabsTrigger>
                    <TabsTrigger 
                        value="appearance" 
                        className="flex items-center gap-2 text-sm px-2 lg:px-4 rounded-xl data-[state=active]:bg-slate-800 data-[state=active]:text-white data-[state=active]:shadow-md text-slate-400 hover:text-slate-300 transition-all duration-200 font-medium min-w-0 flex-shrink-0"
                    >
                        <Palette className="h-4 w-4 flex-shrink-0" />
                        <span className="hidden sm:inline truncate">Appearance</span>
                    </TabsTrigger>
                    <TabsTrigger 
                        value="security" 
                        className="flex items-center gap-2 text-sm px-2 lg:px-4 rounded-xl data-[state=active]:bg-slate-800 data-[state=active]:text-white data-[state=active]:shadow-md text-slate-400 hover:text-slate-300 transition-all duration-200 font-medium min-w-0 flex-shrink-0"
                    >
                        <Shield className="h-4 w-4 flex-shrink-0" />
                        <span className="hidden sm:inline truncate">Security</span>
                    </TabsTrigger>
                    <TabsTrigger 
                        value="data" 
                        className="flex items-center gap-2 text-sm px-2 lg:px-4 rounded-xl data-[state=active]:bg-slate-800 data-[state=active]:text-white data-[state=active]:shadow-md text-slate-400 hover:text-slate-300 transition-all duration-200 font-medium min-w-0 flex-shrink-0"
                    >
                        <Database className="h-4 w-4 flex-shrink-0" />
                        <span className="hidden sm:inline truncate">Data</span>
                    </TabsTrigger>
                    <TabsTrigger 
                        value="company" 
                        className="flex items-center gap-2 text-sm px-2 lg:px-4 rounded-xl data-[state=active]:bg-slate-800 data-[state=active]:text-white data-[state=active]:shadow-md text-slate-400 hover:text-slate-300 transition-all duration-200 font-medium min-w-0 flex-shrink-0"
                    >
                        <Building className="h-4 w-4 flex-shrink-0" />
                        <span className="hidden sm:inline truncate">Company</span>
                    </TabsTrigger>
                </TabsList>

                {/* Profile Settings */}
                <TabsContent value="profile" className="mt-6 space-y-6">
                    <Card className="bg-slate-900/90 border border-slate-800/50 rounded-2xl shadow-sm hover:border-slate-700/60 hover:shadow-xl transition-all duration-300 backdrop-blur-sm p-6 card-bg">
                        <CardHeader className="pb-6">
                            <CardTitle className="flex items-center gap-3 text-slate-50 font-semibold text-lg card-title">
                                <div className="p-2.5 bg-blue-500/20 rounded-xl">
                                    <User className="h-5 w-5 text-blue-400" />
                                </div>
                                Profile Information
                            </CardTitle>
                            <CardDescription className="text-slate-400 text-sm mt-2 card-description">
                                Update your personal information and preferences
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName" className="text-[rgb(var(--color-text-secondary))]">Full Name</Label>
                                    <Input
                                        id="fullName"
                                        value={settings.full_name || ''}
                                        onChange={(e) => handleSettingChange('full_name', e.target.value)}
                                        className="bg-slate-800 border-slate-600 text-slate-100"
                                        placeholder="Enter your full name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-[rgb(var(--color-text-secondary))]">Email</Label>
                                    <Input
                                        id="email"
                                        value={user?.email || ''}
                                        disabled
                                        className="bg-slate-800/50 border-slate-600 text-slate-400"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-[rgb(var(--color-text-secondary))]">Phone</Label>
                                    <Input
                                        id="phone"
                                        value={settings.phone || ''}
                                        onChange={(e) => handleSettingChange('phone', e.target.value)}
                                        className="bg-slate-800 border-slate-600 text-slate-100"
                                        placeholder="(555) 123-4567"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="position" className="text-[rgb(var(--color-text-secondary))]">Position</Label>
                                    <Input
                                        id="position"
                                        value={settings.position || ''}
                                        onChange={(e) => handleSettingChange('position', e.target.value)}
                                        className="bg-slate-800 border-slate-600 text-slate-100"
                                        placeholder="Your job title"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Appearance Settings */}
                <TabsContent value="appearance" className="mt-6 space-y-6">
                    <Card className="bg-slate-900/90 border border-slate-800/50 rounded-2xl shadow-sm hover:border-slate-700/60 hover:shadow-xl transition-all duration-300 backdrop-blur-sm p-6 card-bg">
                        <CardHeader className="pb-6">
                            <CardTitle className="flex items-center gap-3 text-slate-50 font-semibold text-lg card-title">
                                <div className="p-2.5 bg-purple-500/20 rounded-xl">
                                    <Palette className="h-5 w-5 text-purple-400" />
                                </div>
                                Appearance & Localization
                            </CardTitle>
                            <CardDescription className="text-slate-400 text-sm mt-2 card-description">
                                Customize the look and feel of your workspace
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Theme</Label>
                                    <div className="relative">
                                        <Select value={theme} disabled={true}>
                                            <SelectTrigger className="bg-[rgb(var(--color-background-tertiary))] border-[rgb(var(--color-border))] text-[rgb(var(--color-text-primary))] opacity-50 cursor-not-allowed">
                                                <SelectValue />
                                            </SelectTrigger>
                                        </Select>
                                        <div className="mt-2 text-xs text-amber-400 flex items-center gap-2">
                                            <Settings className="h-3 w-3" />
                                            Light mode is not implemented yet. Currently using dark theme.
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-slate-300">Language</Label>
                                    <Select value={settings.language} onValueChange={(value) => handleSettingChange('language', value)}>
                                        <SelectTrigger className="bg-[rgb(var(--color-background-tertiary))] border-[rgb(var(--color-border))] text-[rgb(var(--color-text-primary))]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="en">English</SelectItem>
                                            <SelectItem value="es">Español</SelectItem>
                                            <SelectItem value="fr">Français</SelectItem>
                                            <SelectItem value="de">Deutsch</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-slate-300">Timezone</Label>
                                    <Select value={settings.timezone} onValueChange={(value) => handleSettingChange('timezone', value)}>
                                        <SelectTrigger className="bg-[rgb(var(--color-background-tertiary))] border-[rgb(var(--color-border))] text-[rgb(var(--color-text-primary))]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="America/New_York">Eastern Time</SelectItem>
                                            <SelectItem value="America/Chicago">Central Time</SelectItem>
                                            <SelectItem value="America/Denver">Mountain Time</SelectItem>
                                            <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                                            <SelectItem value="Europe/London">London</SelectItem>
                                            <SelectItem value="Europe/Paris">Paris</SelectItem>
                                            <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-slate-300">Currency</Label>
                                    <Select value={currency} onValueChange={(value: 'USD' | 'EUR' | 'GBP' | 'CAD' | 'JPY') => {
                                        setCurrency(value);
                                        handleSettingChange('currency', value);
                                    }}>
                                        <SelectTrigger className="bg-[rgb(var(--color-background-tertiary))] border-[rgb(var(--color-border))] text-[rgb(var(--color-text-primary))]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="USD">USD ($)</SelectItem>
                                            <SelectItem value="EUR">EUR (€)</SelectItem>
                                            <SelectItem value="GBP">GBP (£)</SelectItem>
                                            <SelectItem value="CAD">CAD ($)</SelectItem>
                                            <SelectItem value="JPY">JPY (¥)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Security Settings */}
                <TabsContent value="security" className="mt-6 space-y-6">
                    <Card className="bg-slate-900/90 border border-slate-800/50 rounded-2xl shadow-sm hover:border-slate-700/60 hover:shadow-xl transition-all duration-300 backdrop-blur-sm p-6 card-bg">
                        <CardHeader className="pb-6">
                            <CardTitle className="flex items-center gap-3 text-slate-50 font-semibold text-lg card-title">
                                <div className="p-2.5 bg-red-500/20 rounded-xl">
                                    <Shield className="h-5 w-5 text-red-400" />
                                </div>
                                Security & Privacy
                            </CardTitle>
                            <CardDescription className="text-slate-400 text-sm mt-2 card-description">
                                Manage your account security and privacy settings
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <Label className="text-[rgb(var(--color-text-secondary))]">Change Password</Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div className="relative">
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="New password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="bg-slate-800 border-slate-600 text-slate-100 pr-10"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4 text-[rgb(var(--color-text-muted))]" />
                                                ) : (
                                                    <Eye className="h-4 w-4 text-[rgb(var(--color-text-muted))]" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Input
                                            type="password"
                                            placeholder="Confirm password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="bg-slate-800 border-slate-600 text-slate-100"
                                        />
                                    </div>
                                </div>
                                <Button 
                                    onClick={updatePassword}
                                    disabled={!newPassword || newPassword !== confirmPassword}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                    <Lock className="h-4 w-4 mr-2" />
                                    Update Password
                                </Button>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <Label className="text-slate-300">Two-Factor Authentication</Label>
                                    <p className="text-sm text-[rgb(var(--color-text-muted))]">Add an extra layer of security to your account</p>
                                </div>
                                <Switch
                                    checked={settings.two_factor_enabled}
                                    onCheckedChange={(checked) => handleSettingChange('two_factor_enabled', checked)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[rgb(var(--color-text-secondary))]">Session Timeout (minutes)</Label>
                                <Select 
                                    value={settings.session_timeout.toString()} 
                                    onValueChange={(value) => handleSettingChange('session_timeout', parseInt(value))}
                                >
                                    <SelectTrigger className="bg-[rgb(var(--color-background-tertiary))] border-[rgb(var(--color-border))] text-[rgb(var(--color-text-primary))]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="15">15 minutes</SelectItem>
                                        <SelectItem value="30">30 minutes</SelectItem>
                                        <SelectItem value="60">1 hour</SelectItem>
                                        <SelectItem value="120">2 hours</SelectItem>
                                        <SelectItem value="480">8 hours</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Data Settings */}
                <TabsContent value="data" className="mt-6 space-y-6">
                    <Card className="bg-slate-900/90 border border-slate-800/50 rounded-2xl shadow-sm hover:border-slate-700/60 hover:shadow-xl transition-all duration-300 backdrop-blur-sm p-6 card-bg">
                        <CardHeader className="pb-6">
                            <CardTitle className="flex items-center gap-3 text-slate-50 font-semibold text-lg card-title">
                                <div className="p-2.5 bg-green-500/20 rounded-xl">
                                    <Database className="h-5 w-5 text-green-400" />
                                </div>
                                Data Management
                            </CardTitle>
                            <CardDescription className="text-slate-400 text-sm mt-2 card-description">
                                Control your data backup and export preferences
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-medium text-[rgb(var(--color-text-secondary))] mb-4">Export Options</h3>
                                    <p className="text-sm text-[rgb(var(--color-text-muted))] mb-4">
                                        Choose what data you want to export from your account.
                                    </p>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Button 
                                        variant="outline" 
                                        className="border-[rgb(var(--color-border))] text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-background-tertiary))]"
                                        onClick={() => handleExportData('crm')}
                                    >
                                        Export CRM Data
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        className="border-[rgb(var(--color-border))] text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-background-tertiary))]"
                                        onClick={() => handleExportData('accounting')}
                                    >
                                        Export Accounting Data
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        className="border-[rgb(var(--color-border))] text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-background-tertiary))]"
                                        onClick={() => handleExportData('all')}
                                    >
                                        Export All Data
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Company Settings */}
                <TabsContent value="company" className="mt-6 space-y-6">
                    <Card className="bg-slate-900/90 border border-slate-800/50 rounded-2xl shadow-sm hover:border-slate-700/60 hover:shadow-xl transition-all duration-300 backdrop-blur-sm p-6 card-bg">
                        <CardHeader className="pb-6">
                            <CardTitle className="flex items-center gap-3 text-slate-50 font-semibold text-lg card-title">
                                <div className="p-2.5 bg-orange-500/20 rounded-xl">
                                    <Building className="h-5 w-5 text-orange-400" />
                                </div>
                                Company Information
                            </CardTitle>
                            <CardDescription className="text-slate-400 text-sm mt-2 card-description">
                                Organization-wide company information used for AI agent context and email generation
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="companyDescription" className="text-[rgb(var(--color-text-secondary))]">Company Description</Label>
                                    <Input
                                        id="companyDescription"
                                        value={orgSettings.company_description || ''}
                                        onChange={(e) => handleOrgSettingChange('company_description', e.target.value)}
                                        className="bg-slate-800 border-slate-600 text-slate-100"
                                        placeholder="Brief description of your company"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="companyServices" className="text-[rgb(var(--color-text-secondary))]">Services Offered</Label>
                                    <Input
                                        id="companyServices"
                                        value={orgSettings.company_services || ''}
                                        onChange={(e) => handleOrgSettingChange('company_services', e.target.value)}
                                        className="bg-slate-800 border-slate-600 text-slate-100"
                                        placeholder="Key services and solutions"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="companyIndustry" className="text-[rgb(var(--color-text-secondary))]">Industry</Label>
                                    <Input
                                        id="companyIndustry"
                                        value={orgSettings.company_industry || ''}
                                        onChange={(e) => handleOrgSettingChange('company_industry', e.target.value)}
                                        className="bg-slate-800 border-slate-600 text-slate-100"
                                        placeholder="Primary industry sector"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="companySize" className="text-[rgb(var(--color-text-secondary))]">Company Size</Label>
                                    <Select 
                                        value={orgSettings.company_size || ''} 
                                        onValueChange={(value) => handleOrgSettingChange('company_size', value)}
                                    >
                                        <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-100">
                                            <SelectValue placeholder="Select company size" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1-10">1-10 employees</SelectItem>
                                            <SelectItem value="11-50">11-50 employees</SelectItem>
                                            <SelectItem value="51-200">51-200 employees</SelectItem>
                                            <SelectItem value="201-500">201-500 employees</SelectItem>
                                            <SelectItem value="500+">500+ employees</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="companyWebsite" className="text-[rgb(var(--color-text-secondary))]">Company Website</Label>
                                    <Input
                                        id="companyWebsite"
                                        value={orgSettings.company_website || ''}
                                        onChange={(e) => handleOrgSettingChange('company_website', e.target.value)}
                                        className="bg-slate-800 border-slate-600 text-slate-100"
                                        placeholder="https://yourcompany.com"
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="valueProposition" className="text-[rgb(var(--color-text-secondary))]">Value Proposition</Label>
                                    <Input
                                        id="valueProposition"
                                        value={orgSettings.value_proposition || ''}
                                        onChange={(e) => handleOrgSettingChange('value_proposition', e.target.value)}
                                        className="bg-slate-800 border-slate-600 text-slate-100"
                                        placeholder="What unique value do you provide to clients?"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="targetMarket" className="text-[rgb(var(--color-text-secondary))]">Target Market</Label>
                                    <Input
                                        id="targetMarket"
                                        value={orgSettings.target_market || ''}
                                        onChange={(e) => handleOrgSettingChange('target_market', e.target.value)}
                                        className="bg-slate-800 border-slate-600 text-slate-100"
                                        placeholder="Who are your ideal clients?"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="uniqueSellingPoints" className="text-[rgb(var(--color-text-secondary))]">Unique Selling Points</Label>
                                    <Input
                                        id="uniqueSellingPoints"
                                        value={orgSettings.unique_selling_points || ''}
                                        onChange={(e) => handleOrgSettingChange('unique_selling_points', e.target.value)}
                                        className="bg-slate-800 border-slate-600 text-slate-100"
                                        placeholder="What makes you different?"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="caseStudies" className="text-[rgb(var(--color-text-secondary))]">Case Studies/Success Stories</Label>
                                    <Input
                                        id="caseStudies"
                                        value={orgSettings.case_studies || ''}
                                        onChange={(e) => handleOrgSettingChange('case_studies', e.target.value)}
                                        className="bg-slate-800 border-slate-600 text-slate-100"
                                        placeholder="Brief client success examples"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="pricingModel" className="text-[rgb(var(--color-text-secondary))]">Pricing Model</Label>
                                    <Input
                                        id="pricingModel"
                                        value={orgSettings.pricing_model || ''}
                                        onChange={(e) => handleOrgSettingChange('pricing_model', e.target.value)}
                                        className="bg-slate-800 border-slate-600 text-slate-100"
                                        placeholder="How do you price your services?"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Save Button - Only show if manual save is needed */}
            <div className="flex justify-between items-center">
                <div className="text-sm text-[rgb(var(--color-text-muted))]">
                    {(hasUnsavedChanges || hasUnsavedOrgChanges) ? (
                        <span className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                            Auto-saving changes...
                        </span>
                    ) : (
                        <span className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full" />
                            All changes saved
                        </span>
                    )}
                </div>
                <div className="flex gap-2">
                    <Button 
                        onClick={() => saveSettings(true)}
                        disabled={saving || !hasUnsavedChanges}
                        variant={hasUnsavedChanges ? "default" : "outline"}
                        className={hasUnsavedChanges ? "bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-dark))] text-white px-6" : "border-[rgb(var(--color-border))] text-[rgb(var(--color-text-muted))] px-6"}
                    >
                        {saving ? (
                            <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Saving Profile...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                Save Profile
                            </>
                        )}
                    </Button>
                    <Button 
                        onClick={() => saveOrgSettings(true)}
                        disabled={savingOrg || !hasUnsavedOrgChanges}
                        variant={hasUnsavedOrgChanges ? "default" : "outline"}
                        className={hasUnsavedOrgChanges ? "bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-dark))] text-white px-6" : "border-[rgb(var(--color-border))] text-[rgb(var(--color-text-muted))] px-6"}
                    >
                        {savingOrg ? (
                            <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Saving Company...
                            </>
                        ) : (
                            <>
                                <Building className="h-4 w-4 mr-2" />
                                Save Company
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}