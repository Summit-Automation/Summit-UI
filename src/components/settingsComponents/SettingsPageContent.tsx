'use client';

import { useRouter } from 'next/navigation';
import {Header} from '@/components/globalComponents/Header';
import SettingsContent from '@/components/settingsComponents/SettingsContent';

export default function SettingsPageContent() {
    const router = useRouter();

    const handleNotifications = () => router.push('/?tab=notifications');
    const handleSettings = () => router.push('/settings');
    const handleHelp = () => router.push('/?tab=help');

    return (
        <div className="space-y-6">
            {/* Modern Mercury-style Header */}
            <Header 
                title="Settings"
                subtitle="Customize your Summit Automation experience"
                onNotifications={handleNotifications}
                onSettings={handleSettings}
                onHelp={handleHelp}
            />

            <div className="px-4 lg:px-6">
                <SettingsContent />
            </div>
        </div>
    );
}