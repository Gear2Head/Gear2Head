<p>
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/header-dark.svg">
  <img src="assets/header-light.svg" alt="Gear_Head. Computer engineering student. I build React and Supabase apps." width="100%">
</picture>
</p>

<p>I've been building web apps for about three years, mostly React/Next.js and Supabase. I use AI tools (Claude, Codex, Gemini) heavily and say so. At school I'm learning C and C++ properly. The project repos are private; the apps are live, so click a project to open it.</p>

<p>
<a href="https://ahikut.vercel.app/">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/ahikut-dark.svg">
  <img src="assets/ahikut-light.svg" alt="Project: AHİKUT, live at ahikut.vercel.app. Certification and accreditation platform where institutions, auditors and compliance evidence meet, with audit workflows that end in a report. Built with Vite, React, TypeScript, Supabase and Postgres. Screenshot of its landing page." width="100%">
</picture>
</a>
</p>

<details>
<summary>How AHİKUT is built</summary>

```mermaid
flowchart LR
  U[Browser] --> A[React app on Vercel]
  subgraph Supabase
    Auth
    DB[(Postgres)]
    ST[Storage]
    FN[Edge Functions]
  end
  A --> Auth
  A --> DB
  A --> ST
  A --> FN
```

A Vite + React single-page app that talks straight to Supabase. Postgres holds institutions, applications, auditor assignments, findings and certificates; scoring runs as a Postgres function. Evidence files go to Storage.

</details>

<p>
<a href="https://lutheus.vercel.app">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/lutheus-dark.svg">
  <img src="assets/lutheus-light.svg" alt="Project: LUTHEUS, live at lutheus.vercel.app. Moderation panel for a Discord server's staff, with audit logs, real-time member sync and a dashboard that shows live counts. Built with Next.js, TypeScript, Supabase and Postgres. Screenshot of its landing page." width="100%">
</picture>
</a>
</p>

<details>
<summary>How LUTHEUS is built</summary>

```mermaid
flowchart LR
  D[Discord server] -->|real-time member sync| DB[(Supabase Postgres)]
  S[Staff] --> P[Next.js panel on Vercel]
  P <-->|actions and audit logs| DB
```

Next.js App Router on Vercel, Supabase behind it. The public page reads its live counts from a Next.js API route; staff sign in to reach the panel.

</details>

<p>
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/toolkit-dark.svg">
  <img src="assets/toolkit-light.svg" alt="Toolkit. Daily: TypeScript, React, Next.js, Tailwind, Supabase, Postgres, Vercel, Git. Comfortable: Python, Node.js, MySQL, Docker, Linux. Learning: C, C++, C#." width="100%">
</picture>
</p>

<p>
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/activity-dark.svg">
  <img src="assets/activity-light.svg" alt="Activity: GitHub contribution grid for the last year with current streak, longest streak and busiest weekday. Redrawn daily by scripts/build-cards.mjs." width="100%">
</picture>
</p>

<p><a href="https://linkedin.com/in/kalpersener">LinkedIn</a> · <a href="https://leetcode.com/gearheadd">LeetCode</a></p>
