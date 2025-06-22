'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
    { href: '/', label: 'Dashboard' },
    { href: '/crm', label: 'CRM' },
    { href: '/bookkeeper', label: 'Bookkeeper' },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="w-64 h-screen bg-slate-800 text-white p-6 shadow-xl flex flex-col">
            <h1 className="text-2xl font-bold mb-8 tracking-wide">Summit Automation</h1>
            <nav className="flex flex-col space-y-4">
                {navItems.map(({ href, label }) => (
                    <Link key={href} href={href}>
                        <span className={`cursor-pointer hover:text-sky-400 transition ${
                            pathname === href ? 'text-sky-400 font-semibold' : 'text-slate-100'
                        }`}>
                            {label}
                        </span>
                    </Link>
                ))}
            </nav>
        </div>
    );
}
