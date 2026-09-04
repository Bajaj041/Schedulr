import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = '/Users/adityabajaj/.gemini/antigravity-ide/brain/110fbd63-4265-4012-b025-a2ef99b61a5e/screenshots';
const WORKSPACE_DIR = '/Users/adityabajaj/Documents/college projects/schedulr/screenshots';

// Ensure directories exist
fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
fs.mkdirSync(WORKSPACE_DIR, { recursive: true });

const pagesToCapture = [
  { name: '01_dashboard_1080p_light', base: '01_dashboard', url: 'http://localhost:5174/app/dashboard', title: 'Host Dashboard (1080p Light)' },
  { name: '02_event_types_1080p_light', base: '02_event_types', url: 'http://localhost:5174/app/event-types', title: 'Event Types (1080p Light)' },
  { name: '03_bookings_1080p_light', base: '03_bookings', url: 'http://localhost:5174/app/bookings', title: 'Bookings Management (1080p Light)' },
  { name: '04_availability_1080p_light', base: '04_availability', url: 'http://localhost:5174/app/availability', title: 'Availability Schedule (1080p Light)' },
  { name: '05_integrations_1080p_light', base: '05_integrations', url: 'http://localhost:5174/app/integrations', title: 'Integrations Hub (1080p Light)' },
  { name: '06_team_1080p_light', base: '06_team', url: 'http://localhost:5174/app/team', title: 'Team Management (1080p Light)' },
  { name: '07_analytics_1080p_light', base: '07_analytics', url: 'http://localhost:5174/app/analytics', title: 'Analytics Dashboard (1080p Light)' },
  { name: '08_settings_1080p_light', base: '08_settings', url: 'http://localhost:5174/app/settings', title: 'Host Settings (1080p Light)' },
  { name: '09_login_1080p_light', base: '09_login', url: 'http://localhost:5174/login', title: 'Host Login (1080p Light)' },
  { name: '10_public_host_profile_1080p_light', base: '10_public_host_profile', url: 'http://localhost:5174/aditya', title: 'Public Host Profile (1080p Light)' },
  { name: '11_public_booking_page_1080p_light', base: '11_public_booking_page', url: 'http://localhost:5174/aditya/30min', title: 'Public Booking Page (1080p Light)' },
  { name: '12_public_reschedule_1080p_light', base: '12_public_reschedule', url: 'http://localhost:5174/reschedule/bkg_sample_1', title: 'Public Reschedule (1080p Light)' },
  { name: '13_public_cancel_1080p_light', base: '13_public_cancel', url: 'http://localhost:5174/cancel/bkg_sample_1', title: 'Public Cancellation (1080p Light)' },
];

async function capture1080pLight() {
  console.log('🚀 Launching Chrome at Full HD 1080p (1920x1080) in Light Mode...');
  let browser;
  try {
    browser = await chromium.launch({ channel: 'chrome' });
  } catch {
    browser = await chromium.launch();
  }

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }, // 1080p resolution
    deviceScaleFactor: 1,                     // Native 1080p pixels
  });

  // Enforce Light Mode globally
  await context.addInitScript(() => {
    localStorage.setItem('schedulr_theme', '"light"');
    document.documentElement.classList.remove('dark');
  });

  const page = await context.newPage();

  for (const item of pagesToCapture) {
    console.log(`📸 Capturing 1080p Light: ${item.title}...`);
    try {
      await page.goto(item.url, { waitUntil: 'networkidle', timeout: 15000 });
      await page.evaluate(() => {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('schedulr_theme', '"light"');
      });
      await page.waitForTimeout(800);

      const filePath1080p = path.join(WORKSPACE_DIR, `${item.name}.png`);
      const fileArtifact1080p = path.join(ARTIFACT_DIR, `${item.name}.png`);

      // Save 1080p screenshot
      await page.screenshot({ path: filePath1080p, fullPage: true });
      fs.copyFileSync(filePath1080p, fileArtifact1080p);

      // Also update base name file to ensure it's pure light mode
      const baseWorkspace = path.join(WORKSPACE_DIR, `${item.base}.png`);
      const baseArtifact = path.join(ARTIFACT_DIR, `${item.base}.png`);
      fs.copyFileSync(filePath1080p, baseWorkspace);
      fs.copyFileSync(filePath1080p, baseArtifact);

      console.log(`✅ Saved 1080p: ${item.name}.png`);
    } catch (err) {
      console.error(`❌ Failed ${item.name}:`, err.message);
    }
  }

  await browser.close();
  console.log('🎉 All 1080p Light Mode screenshots captured successfully!');
}

capture1080pLight();
