// Builds every README panel in assets/ (header, projects, toolkit, activity; dark and light).
// Activity comes from the real GitHub contribution calendar; the rest are static.
// Usage: GITHUB_TOKEN=... node scripts/build-cards.mjs   |   node scripts/build-cards.mjs --test
import { readFileSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const LOGIN = 'Gear2Head';
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const THEMES = {
  dark: { fg: '#e6edf3', muted: '#8b949e', line: '#30363d', empty: '#21262d', accent: '#f78166' },
  light: { fg: '#1f2328', muted: '#59636e', line: '#d0d7de', empty: '#eff2f5', accent: '#bc4c00' },
};

// counts: chronological daily counts, last entry is today.
export function currentStreak(counts) {
  let i = counts.length - 1;
  if (counts[i] === 0) i--; // today is not over yet; an empty today does not break the streak
  let n = 0;
  while (i >= 0 && counts[i] > 0) { n++; i--; }
  return n;
}

export function longestStreak(counts) {
  let best = 0, run = 0;
  for (const c of counts) { run = c > 0 ? run + 1 : 0; best = Math.max(best, run); }
  return best;
}

function busiestWeekday(days) {
  const sums = Array(7).fill(0);
  for (const d of days) sums[new Date(d.date + 'T00:00:00Z').getUTCDay()] += d.contributionCount;
  return DAY_NAMES[sums.indexOf(Math.max(...sums))];
}

function selfTest() {
  assert.equal(currentStreak([1, 0, 2, 3, 4]), 3);
  assert.equal(currentStreak([1, 0, 2, 3, 0]), 2, 'empty today keeps yesterday streak');
  assert.equal(currentStreak([1, 2, 0, 0]), 0, 'empty yesterday breaks it');
  assert.equal(currentStreak([0]), 0);
  assert.equal(currentStreak([5, 5, 5]), 3);
  assert.equal(longestStreak([1, 1, 0, 1, 1, 1, 0, 1]), 3);
  assert.equal(longestStreak([0, 0]), 0);
  assert.equal(longestStreak([2, 2, 2, 2]), 4);
  assert.equal(busiestWeekday([{ date: '2026-11-24', contributionCount: 9 }, { date: '2026-11-25', contributionCount: 1 }]), 'Tuesday');
  assert.deepEqual(wrap('aa bb cc', 5), ['aa bb', 'cc']);
  assert.deepEqual(wrap('longword x', 3), ['longword', 'x'], 'a word longer than the line gets its own line');
  for (const t of Object.values(THEMES)) renderToolkit(t); // asserts no chip row overflows the panel
  console.log('self-test ok');
}

async function fetchCalendar(token) {
  const query = `{ user(login: "${LOGIN}") { contributionsCollection { contributionCalendar {
    totalContributions weeks { contributionDays { date contributionCount } } } } } }`;
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `bearer ${token}`, 'Content-Type': 'application/json', 'User-Agent': 'build-cards' },
    body: JSON.stringify({ query }),
  });
  const json = await res.json();
  if (!res.ok || json.errors) throw new Error(`GitHub API: ${res.status} ${JSON.stringify(json.errors ?? json)}`);
  return json.data.user.contributionsCollection.contributionCalendar;
}

const fmt = (n) => n.toLocaleString('en-US');
const plural = (n, w) => `${fmt(n)} ${w}${n === 1 ? '' : 's'}`;

// One panel spec for every SVG in the README, so the blocks cannot drift apart.
const W = 1200, PAD = 48, RADIUS = 12, LABEL_Y = 60, TOP = 92;
const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";
const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
const MONO_EM = 0.6; // advance width of the mono stack, used to size chips; textLength pins it per font
const EASE = 'cubic-bezier(.2,.7,.3,1)';

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const delay = (ms) => `style="animation-delay:${ms}ms"`;

// Greedy word wrap by character count; SVG text does not wrap on its own.
export function wrap(text, max) {
  const lines = [];
  for (const word of text.split(' ')) {
    const last = lines[lines.length - 1];
    if (last !== undefined && (last + ' ' + word).length <= max) lines[lines.length - 1] = last + ' ' + word;
    else lines.push(word);
  }
  return lines;
}

function panel(t, h, { label, aria, css = '', body }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${h}" width="${W}" height="${h}" role="img" aria-label="${esc(aria)}">
  <style>
    @keyframes rise { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
    @keyframes fade { from { opacity: 0; } to { opacity: 1; } }
    .rise { animation: rise 520ms ${EASE} both; }
    .fade { animation: fade 600ms ease-out both; }${css}
    @media (prefers-reduced-motion: reduce) { * { animation: none !important; } }
  </style>
  <rect x="0.5" y="0.5" width="${W - 1}" height="${h - 1}" rx="${RADIUS}" fill="none" stroke="${t.line}"/>
  ${label ? `<text x="${PAD}" y="${LABEL_Y}" font-family="${MONO}" font-size="18" fill="${t.muted}">${label}</text>` : ''}
  ${body}
</svg>
`;
}

function renderHeader(t) {
  const facts = [
    `<tspan fill="${t.fg}">1,600+</tspan> contributions since 2025`,
    `<tspan fill="${t.fg}">2</tspan> apps live on Vercel`,
    `learning <tspan fill="${t.fg}">C / C++</tspan> at school`,
  ];
  return panel(t, 260, {
    aria: 'Gear_Head. Computer engineering student. I build React and Supabase apps.',
    css: `\n    .rule { transform-box: fill-box; transform-origin: top; animation: draw 700ms ${EASE} both; }\n    @keyframes draw { from { transform: scaleY(0); } to { transform: none; } }`,
    body: `<rect class="rule" x="${PAD}" y="64" width="4" height="132" fill="${t.accent}"/>
  <g font-family="${SANS}">
    <text class="rise" ${delay(150)} x="80" y="146" font-size="92" font-weight="700" letter-spacing="-3" fill="${t.fg}">Gear<tspan fill="${t.accent}">_</tspan>Head</text>
    <text class="fade" ${delay(400)} x="84" y="192" font-size="24" fill="${t.muted}">Computer engineering student. I build React and Supabase apps.</text>
  </g>
  <g font-family="${MONO}" font-size="19" fill="${t.muted}" text-anchor="end">
    ${facts.map((f, i) => `<text class="rise" ${delay(750 + i * 150)} x="${W - PAD}" y="${108 + i * 32}">${f}</text>`).join('\n    ')}
  </g>`,
  });
}

const PROJECTS = {
  ahikut: {
    name: 'AHİKUT', url: 'ahikut.vercel.app',
    desc: 'Certification and accreditation platform where institutions, auditors and compliance evidence meet, with audit workflows that end in a report.',
    stack: 'Vite, React, TypeScript, Supabase, Postgres',
  },
  lutheus: {
    name: 'LUTHEUS', url: 'lutheus.vercel.app',
    desc: "Moderation panel for a Discord server's staff, with audit logs, real-time member sync and a dashboard that shows live counts.",
    stack: 'Next.js, TypeScript, Supabase, Postgres',
  },
};

function renderProject(t, p, jpegBase64) {
  const FW = 660, FH = 371, TX = PAD + FW + PAD, TW = W - PAD - TX; // frame ~55% of the panel, text column after one gutter
  const bottom = TOP + FH;
  const desc = wrap(p.desc, Math.floor(TW / (22 * 0.52)));
  const stack = wrap(p.stack, Math.floor(TW / (18 * MONO_EM)));
  const stackY = (i) => bottom - 44 - (stack.length - 1 - i) * 28;
  return panel(t, bottom + PAD, {
    label: 'project',
    aria: `${p.name}, live at ${p.url}. ${p.desc} Built with ${p.stack}.`,
    body: `<clipPath id="f"><rect x="${PAD}" y="${TOP}" width="${FW}" height="${FH}" rx="8"/></clipPath>
  <image class="fade" x="${PAD}" y="${TOP}" width="${FW}" height="${FH}" clip-path="url(#f)" preserveAspectRatio="xMidYMin slice" href="data:image/jpeg;base64,${jpegBase64}"/>
  <rect x="${PAD + 0.5}" y="${TOP + 0.5}" width="${FW - 1}" height="${FH - 1}" rx="8" fill="none" stroke="${t.line}"/>
  <text class="rise" ${delay(150)} x="${TX}" y="${TOP + 34}" font-family="${SANS}" font-size="44" font-weight="700" letter-spacing="-1" fill="${t.fg}">${p.name}</text>
  <g class="rise" ${delay(300)} font-family="${SANS}" font-size="22" fill="${t.muted}">
    ${desc.map((l, i) => `<text x="${TX}" y="${TOP + 84 + i * 34}">${esc(l)}</text>`).join('\n    ')}
  </g>
  <g class="rise" ${delay(450)} font-family="${MONO}" font-size="18">
    ${stack.map((l, i) => `<text x="${TX}" y="${stackY(i)}" fill="${t.muted}">${l}</text>`).join('\n    ')}
    <text x="${TX}" y="${bottom - 4}" fill="${t.accent}">${p.url}</text>
  </g>`,
  });
}

const TOOLKIT = [
  ['Daily', ['TypeScript', 'React', 'Next.js', 'Tailwind', 'Supabase', 'Postgres', 'Vercel', 'Git']],
  ['Comfortable', ['Python', 'Node.js', 'MySQL', 'Docker', 'Linux']],
  ['Learning', ['C', 'C++', 'C#']],
];

function renderToolkit(t) {
  const FS = 18, CH = 44, CPAD = 14, GAP = 10, ROW = 64, X0 = 248;
  let n = 0;
  const rows = TOOLKIT.map(([label, items], r) => {
    const y = TOP + r * ROW, daily = r === 0;
    let x = X0;
    const chips = items.map((name) => {
      const tw = name.length * FS * MONO_EM, cw = tw + 2 * CPAD;
      const chip = `<g class="rise" ${delay(200 + n++ * 40)}><rect x="${x + 0.5}" y="${y + 0.5}" width="${cw - 1}" height="${CH - 1}" rx="6" fill="none" stroke="${daily ? t.accent : t.line}"${daily ? ' stroke-opacity="0.7"' : ''}/><text x="${x + CPAD}" y="${y + 28}" textLength="${tw}" lengthAdjust="spacing" fill="${daily ? t.fg : t.muted}">${esc(name)}</text></g>`;
      x += cw + GAP;
      return chip;
    });
    assert.ok(x - GAP <= W - PAD, `toolkit row ${label} overflows the panel`);
    return `<text x="${PAD}" y="${y + 29}" font-family="${SANS}" font-size="22" fill="${t.fg}">${label}</text>
  <g font-family="${MONO}" font-size="${FS}">${chips.join('')}</g>`;
  });
  return panel(t, TOP + 2 * ROW + CH + PAD, {
    label: 'toolkit',
    aria: 'Toolkit. ' + TOOLKIT.map(([l, items]) => `${l}: ${items.join(', ')}.`).join(' '),
    body: rows.join('\n  '),
  });
}

function renderActivity(cal, t) {
  const days = cal.weeks.flatMap((w) => w.contributionDays);
  const counts = days.map((d) => d.contributionCount);
  // Four intensity steps from quartiles of the non-zero days, like GitHub's own grid.
  const nz = counts.filter((c) => c > 0).sort((a, b) => a - b);
  const q = [0.25, 0.5, 0.75].map((p) => nz[Math.floor(p * (nz.length - 1))] ?? 0);
  const level = (c) => (c === 0 ? 0 : c <= q[0] ? 1 : c <= q[1] ? 2 : c <= q[2] ? 3 : 4);
  const opacity = [1, 0.4, 0.6, 0.8, 1];

  // Grid fills the content width after a day-label column; its right edge sits on the padding line.
  const STEP = Math.floor((W - 2 * PAD - 48 + 4) / cal.weeks.length), CELL = STEP - 4;
  const X0 = W - PAD - (cal.weeks.length * STEP - 4), Y0 = TOP + 80;
  const H = Y0 + 7 * STEP + 96;

  let lastMonth = -1, lastLabelCol = 0;
  const months = [];
  const cols = cal.weeks.map((w, ci) => {
    const m = new Date(w.contributionDays[0].date + 'T00:00:00Z').getUTCMonth();
    if (m !== lastMonth && ci < cal.weeks.length - 1) {
      if (months.length === 1 && ci - lastLabelCol < 3) months.pop(); // partial first month would collide with the next label
      months.push(`<text x="${X0 + ci * STEP}" y="${Y0 - 12}">${MONTHS[m]}</text>`);
      lastLabelCol = ci;
    }
    lastMonth = m;
    const cells = w.contributionDays.map((d) => {
      const row = new Date(d.date + 'T00:00:00Z').getUTCDay();
      const l = level(d.contributionCount);
      const fill = l ? `fill="${t.accent}" fill-opacity="${opacity[l]}"` : `fill="${t.empty}"`;
      return `<rect x="${X0 + ci * STEP}" y="${Y0 + row * STEP}" width="${CELL}" height="${CELL}" rx="3" ${fill}><title>${d.date}: ${plural(d.contributionCount, 'contribution')}</title></rect>`;
    });
    return `<g class="col" ${delay(ci * 16)}>${cells.join('')}</g>`;
  });

  const last = days[days.length - 1].date;
  const [y, mo, d] = last.split('-').map(Number);
  const stats = [
    [plural(currentStreak(counts), 'day'), 'current streak'],
    [plural(longestStreak(counts), 'day'), 'longest streak'],
    [busiestWeekday(days), 'busiest day'],
  ];
  const statW = (W - 2 * PAD) / 3;
  const statEls = stats.map(([v, label], i) =>
    `<text class="fade" ${delay(900 + i * 120)} x="${Math.round(PAD + i * statW)}" y="${H - PAD}"><tspan fill="${t.fg}">${v}</tspan> ${label}</text>`);

  return panel(t, H, {
    label: 'activity',
    aria: `Activity. ${fmt(cal.totalContributions)} GitHub contributions in the last year. Current streak ${stats[0][0]}, longest streak ${stats[1][0]}, busiest day ${stats[2][0]}.`,
    css: `\n    .col { animation: rise 420ms ${EASE} both; }`,
    body: `<text x="${W - PAD}" y="${LABEL_Y}" font-family="${MONO}" font-size="18" fill="${t.muted}" text-anchor="end">updated ${d} ${MONTHS[mo - 1]} ${y}</text>
  <g font-family="${SANS}">
    <text x="${PAD}" y="${TOP + 22}" font-size="26" fill="${t.muted}"><tspan fill="${t.fg}" font-weight="600">${fmt(cal.totalContributions)}</tspan> contributions in the last year</text>
    <g font-size="15" fill="${t.muted}">${months.join('')}
      ${[1, 3, 5].map((r) => `<text x="${X0 - 12}" y="${Y0 + r * STEP + CELL - 3}" text-anchor="end">${DAY_NAMES[r].slice(0, 3)}</text>`).join('\n      ')}
    </g>
  </g>
  ${cols.join('\n  ')}
  <g font-family="${MONO}" font-size="20" fill="${t.muted}">
    ${statEls.join('\n    ')}
  </g>`,
  });
}

const out = (file, svg) => writeFileSync(new URL(`../assets/${file}`, import.meta.url), svg);

if (process.argv.includes('--test')) {
  selfTest();
} else {
  // Static panels are cheap, so every run rebuilds them too; only activity needs the API.
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN is not set');
  const cal = await fetchCalendar(token);
  for (const [name, t] of Object.entries(THEMES)) {
    out(`header-${name}.svg`, renderHeader(t));
    out(`toolkit-${name}.svg`, renderToolkit(t));
    for (const [slug, p] of Object.entries(PROJECTS)) {
      out(`${slug}-${name}.svg`, renderProject(t, p, readFileSync(new URL(`../assets/${slug}.jpg`, import.meta.url)).toString('base64')));
    }
    out(`activity-${name}.svg`, renderActivity(cal, t));
  }
  console.log(`wrote all panels: ${cal.totalContributions} contributions`);
}
