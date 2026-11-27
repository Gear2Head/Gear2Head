// Builds assets/activity-{dark,light}.svg from the real GitHub contribution calendar.
// Usage: GITHUB_TOKEN=... node scripts/build-cards.mjs   |   node scripts/build-cards.mjs --test
import { writeFileSync } from 'node:fs';
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

function render(cal, t) {
  const days = cal.weeks.flatMap((w) => w.contributionDays);
  const counts = days.map((d) => d.contributionCount);
  // Four intensity steps from quartiles of the non-zero days, like GitHub's own grid.
  const nz = counts.filter((c) => c > 0).sort((a, b) => a - b);
  const q = [0.25, 0.5, 0.75].map((p) => nz[Math.floor(p * (nz.length - 1))] ?? 0);
  const level = (c) => (c === 0 ? 0 : c <= q[0] ? 1 : c <= q[1] ? 2 : c <= q[2] ? 3 : 4);
  const opacity = [1, 0.4, 0.6, 0.8, 1];

  const X0 = 64, Y0 = 92, STEP = 14, CELL = 11;
  const W = X0 + cal.weeks.length * STEP - 3 + 32, H = 256;

  let lastMonth = -1, lastLabelCol = 0;
  const months = [];
  const cols = cal.weeks.map((w, ci) => {
    const m = new Date(w.contributionDays[0].date + 'T00:00:00Z').getUTCMonth();
    if (m !== lastMonth && ci < cal.weeks.length - 1) {
      if (months.length === 1 && ci - lastLabelCol < 3) months.pop(); // partial first month would collide with the next label
      months.push(`<text x="${X0 + ci * STEP}" y="${Y0 - 10}">${MONTHS[m]}</text>`);
      lastLabelCol = ci;
    }
    lastMonth = m;
    const cells = w.contributionDays.map((d) => {
      const row = new Date(d.date + 'T00:00:00Z').getUTCDay();
      const l = level(d.contributionCount);
      const fill = l ? `fill="${t.accent}" fill-opacity="${opacity[l]}"` : `fill="${t.empty}"`;
      return `<rect x="${X0 + ci * STEP}" y="${Y0 + row * STEP}" width="${CELL}" height="${CELL}" rx="2" ${fill}><title>${d.date}: ${plural(d.contributionCount, 'contribution')}</title></rect>`;
    });
    return `<g class="col" style="animation-delay:${ci * 16}ms">${cells.join('')}</g>`;
  });

  const last = days[days.length - 1].date;
  const [y, mo, d] = last.split('-').map(Number);
  const stats = [
    [plural(currentStreak(counts), 'day'), 'current streak'],
    [plural(longestStreak(counts), 'day'), 'longest streak'],
    [busiestWeekday(days), 'busiest day'],
  ];
  const statW = (W - X0 - 32) / 3;
  const statEls = stats.map(([v, label], i) =>
    `<text class="stat" style="animation-delay:${900 + i * 120}ms" x="${Math.round(X0 + i * statW)}" y="${Y0 + 7 * STEP + 40}"><tspan fill="${t.fg}">${v}</tspan> ${label}</text>`);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${fmt(cal.totalContributions)} GitHub contributions in the last year. Current streak ${stats[0][0]}, longest streak ${stats[1][0]}, busiest day ${stats[2][0]}.">
  <style>
    .col { animation: in 420ms cubic-bezier(.2,.7,.3,1) both; }
    .stat { animation: fade 500ms ease-out both; }
    @keyframes in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
    @keyframes fade { from { opacity: 0; } to { opacity: 1; } }
    @media (prefers-reduced-motion: reduce) { .col, .stat { animation: none; } }
  </style>
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="12" fill="none" stroke="${t.line}"/>
  <g font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif">
    <text x="${X0}" y="44" font-size="18" fill="${t.muted}"><tspan fill="${t.fg}" font-weight="600">${fmt(cal.totalContributions)}</tspan> contributions in the last year</text>
    <text x="${W - 32}" y="44" font-size="13" fill="${t.muted}" text-anchor="end">updated ${d} ${MONTHS[mo - 1]} ${y}</text>
    <g font-size="11" fill="${t.muted}">${months.join('')}
      <text x="${X0 - 10}" y="${Y0 + 1 * STEP + 9}" text-anchor="end">Mon</text>
      <text x="${X0 - 10}" y="${Y0 + 3 * STEP + 9}" text-anchor="end">Wed</text>
      <text x="${X0 - 10}" y="${Y0 + 5 * STEP + 9}" text-anchor="end">Fri</text>
    </g>
  </g>
  ${cols.join('\n  ')}
  <g font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-size="16" fill="${t.muted}">
    ${statEls.join('\n    ')}
  </g>
</svg>
`;
}

if (process.argv.includes('--test')) {
  selfTest();
} else {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN is not set');
  const cal = await fetchCalendar(token);
  for (const [name, t] of Object.entries(THEMES)) {
    writeFileSync(new URL(`../assets/activity-${name}.svg`, import.meta.url), render(cal, t));
  }
  console.log(`wrote activity cards: ${cal.totalContributions} contributions`);
}
