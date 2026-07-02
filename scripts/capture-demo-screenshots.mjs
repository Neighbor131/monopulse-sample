import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const baseUrl = 'http://127.0.0.1:5173';
const outDir = 'docs/demo-screenshots';

const shots = [
  { name: '01-login', path: '/login', title: 'Access and role-scoped entry' },
  { name: '02-dashboard', path: '/dashboard', title: 'Operations dashboard' },
  { name: '03-campaigns', path: '/', title: 'Campaign portfolio' },
  { name: '04-campaign-detail', path: '/campaigns/c-1042', title: 'Campaign detail' },
  { name: '05-create-campaign', path: '/create', title: 'Campaign type picker' },
  { name: '06-builder-review', path: '/builder/review', title: 'Campaign review' },
  { name: '07-approvals', path: '/approvals', title: 'Approval inbox' },
  { name: '08-rewards', path: '/rewards', title: 'Reward catalog' },
  { name: '09-reward-detail', path: '/rewards/rw-fs-acr-20', title: 'Reward fulfillment detail' },
  { name: '10-players', path: '/players/PLR-88213', title: 'Player profile' },
  { name: '11-segments', path: '/segments', title: 'Segments and audiences' },
  { name: '12-monitoring', path: '/monitoring', title: 'Monitoring and incidents' },
  { name: '13-integrations', path: '/integrations', title: 'Integrations and provider health' },
  { name: '14-org', path: '/org', title: 'Org, brands and permissions' },
  { name: '15-settings', path: '/settings', title: 'Settings and governance' },
  { name: '18-campaign-ops', path: '/ops', title: 'Campaign Ops calendar, tasks and reports' },
];

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });

await page.addInitScript(() => {
  window.localStorage.setItem('monopulse-theme', 'dark');
});

for (const shot of shots) {
  await page.goto(`${baseUrl}${shot.path}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(450);
  await page.screenshot({ path: `${outDir}/${shot.name}.png`, fullPage: false });
  console.log(`${shot.name}.png - ${shot.title}`);
}

await page.goto(`${baseUrl}/dashboard`, { waitUntil: 'networkidle' });
await page.keyboard.press(process.platform === 'darwin' ? 'Meta+K' : 'Control+K');
await page.waitForTimeout(300);
await page.screenshot({ path: `${outDir}/16-command-palette.png`, fullPage: false });
console.log('16-command-palette.png - Global command palette');

await page.goto(`${baseUrl}/rewards/rw-fs-acr-20`, { waitUntil: 'networkidle' });
await page.getByRole('button', { name: /Test grant/i }).click();
await page.waitForTimeout(300);
await page.screenshot({ path: `${outDir}/17-action-modal.png`, fullPage: false });
console.log('17-action-modal.png - Action modal with permission check');

await browser.close();
