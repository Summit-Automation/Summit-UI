# Summit-UI

[![Dependabot Updates](https://github.com/Summit-Automation/Summit-UI/actions/workflows/dependabot/dependabot-updates/badge.svg)](https://github.com/Summit-Automation/Summit-UI/actions/workflows/dependabot/dependabot-updates)
[![CodeQL Advanced](https://github.com/Summit-Automation/Summit-UI/actions/workflows/codeql.yml/badge.svg)](https://github.com/Summit-Automation/Summit-UI/actions/workflows/codeql.yml)

**Summit-UI** is the frontend for [SummitSuite](https://github.com/Summit-Automation/SummitSuite), a modern business automation platform built with contractors and small businesses in mind. This app is built using [Next.js App Router](https://nextjs.org/docs/app), [React](https://react.dev), and [Tailwind CSS](https://tailwindcss.com), and communicates with Supabase for authentication and data management.

---

## 🚀 Features

- 📇 CRM Dashboard: Manage leads, track customer interactions, and sales stages
- 📊 Bookkeeper: Upload receipts and view business cashflow and summaries
- 🤖 Flowise AI Integration: Smart agents embedded into business workflows
- 🔐 Supabase Auth: Role-based access for secure multi-user use
- 🎨 Responsive UI: Tailwind-based dark mode layout, powered by Geist font
- 📦 Component-based architecture with ESLint, Prettier, and CodeQL support

---

## 🧰 Tech Stack

| Layer        | Tooling                         |
|-------------|----------------------------------|
| Framework    | [Next.js 14](https://nextjs.org) (App Router) |
| UI           | [React](https://react.dev) + [Tailwind CSS](https://tailwindcss.com) |
| Fonts        | [Geist](https://vercel.com/font) via `next/font` |
| Backend      | [Supabase](https://supabase.com) (Auth + DB + Storage) |
| CI/CD        | GitHub Actions (Dependabot + CodeQL) |
| Auth         | Supabase Auth (with RLS) |
| Charts       | [Recharts](https://recharts.org/) |
| Icons        | [Lucide](https://lucide.dev/) |

---

## 🛠️ Local Development

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```
