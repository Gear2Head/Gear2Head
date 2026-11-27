<p>
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/header-dark.svg">
  <img src="assets/header-light.svg" alt="Gear_Head. Computer engineering student who ships Next.js and Supabase apps." width="100%">
</picture>
</p>

I've been building web apps for about three years, mostly with Next.js and Supabase. I use AI tools (Claude, Codex, Gemini) heavily and say so. At school I'm learning C and C++ properly.

## Projects

The repos are private. The apps are live; click a screenshot to open one.

<table>
<tr>
<td width="50%" valign="top">
<a href="https://ahikut.vercel.app/"><img src="assets/ahikut.png" alt="AHİKUT landing page" width="100%"></a>
<h3><a href="https://ahikut.vercel.app/">AHİKUT</a></h3>
<p>Certification and accreditation platform. Institutions, auditors, standards and compliance evidence in one place, with audit workflows that end in a report.</p>
<p><sub>React, TypeScript, Supabase, Postgres</sub></p>
<details>
<summary>How it's built</summary>

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

A single-page app that talks straight to Supabase. Postgres holds institutions, applications, auditor assignments, findings and certificates; scoring runs as a Postgres function. Evidence files go to Storage.

</details>
</td>
<td width="50%" valign="top">
<a href="https://lutheus.vercel.app"><img src="assets/lutheus.png" alt="LUTHEUS landing page" width="100%"></a>
<h3><a href="https://lutheus.vercel.app">LUTHEUS</a></h3>
<p>Moderation panel for a Discord server's staff. Moderation actions and audit logs, real-time member sync and a dashboard. Its landing page shows the live counts.</p>
<p><sub>TypeScript, React, Supabase, Postgres</sub></p>
<details>
<summary>How it's built</summary>

```mermaid
flowchart LR
  D[Discord server] -->|real-time member sync| DB[(Supabase Postgres)]
  S[Staff] --> P[Next.js panel on Vercel]
  P <-->|actions and audit logs| DB
```

Next.js App Router on Vercel, Supabase behind it. The public page reads its live counts from a Next.js API route; staff sign in to reach the panel.

</details>
</td>
</tr>
</table>

## Toolkit

<p>
  <sub>Daily</sub><br>
  <img src="https://skillicons.dev/icons?i=ts,react,nextjs,tailwind,supabase,postgres,vercel,git&theme=dark" alt="TypeScript, React, Next.js, Tailwind, Supabase, Postgres, Vercel, Git" height="40">
</p>
<p>
  <sub>Comfortable</sub><br>
  <img src="https://skillicons.dev/icons?i=py,nodejs,mysql,docker,linux&theme=dark" alt="Python, Node.js, MySQL, Docker, Linux" height="40">
</p>
<p>
  <sub>Learning</sub><br>
  <img src="https://skillicons.dev/icons?i=c,cpp,cs&theme=dark" alt="C, C++, C#" height="40">
</p>

## Activity

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/activity-dark.svg">
  <img src="assets/activity-light.svg" alt="GitHub contribution grid for the last year, with current streak, longest streak and busiest weekday" width="100%">
</picture>

<sub>Redrawn every day from the GitHub API by <a href="scripts/build-cards.mjs">a script in this repo</a>.</sub>

## Contact

[LinkedIn](https://linkedin.com/in/kalpersener) &nbsp;&nbsp; [LeetCode](https://leetcode.com/gearheadd)
