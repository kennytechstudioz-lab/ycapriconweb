const fs = require('fs');
const path = require('path');

const devEnvPath = path.join(__dirname, '../.env.development');
const prodEnvPath = path.join(__dirname, '../.env.production');
const localEnvPath = path.join(__dirname, '../.env.local');
const defaultEnvPath = path.join(__dirname, '../.env');

console.log('======================================================');
console.log(' CAPRICORN - Next.js Environment Sync Prebuild Script');
console.log('======================================================');

// 1. Ensure .env.development is cleanly configured for local API
const devContent = `NEXT_PUBLIC_API_URL=http://localhost:5002
NEXTAUTH_SECRET=a-super-secure-production-ready-jwt-salt-change-me
NEXTAUTH_URL=http://localhost:3000
`;
fs.writeFileSync(devEnvPath, devContent.trim() + '\n');
console.log('✓ Ensured .env.development points to local API: http://localhost:5002');

// 2. Ensure .env.production is configured for production API
const prodApiUrl =
  process.env.NEXT_PUBLIC_API_URL || "https://capricornapi.up.railway.app";
const prodAuthUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
const prodAuthSecret =
  process.env.NEXTAUTH_SECRET ||
  "a-super-secure-production-ready-jwt-salt-change-me";

const prodContent = `NEXT_PUBLIC_API_URL=${prodApiUrl}
NEXTAUTH_SECRET=${prodAuthSecret}
NEXTAUTH_URL=${prodAuthUrl}
`;
fs.writeFileSync(prodEnvPath, prodContent.trim() + "\n");
console.log(`✓ Ensured .env.production points to production API: ${prodApiUrl}`);

// 3. Remove general .env if it interferes with next environment loaders
if (fs.existsSync(defaultEnvPath)) {
  fs.unlinkSync(defaultEnvPath);
  console.log('✓ Cleaned up redundant .env root file to prevent interference.');
}

// 4. Safe cleanup of local API url overrides in .env.local
if (fs.existsSync(localEnvPath)) {
  let localContent = fs.readFileSync(localEnvPath, 'utf8');
  if (localContent.includes('NEXT_PUBLIC_API_URL')) {
    localContent = localContent
      .split('\n')
      .filter((line) => !line.trim().startsWith('NEXT_PUBLIC_API_URL'))
      .join('\n');
    fs.writeFileSync(localEnvPath, localContent.trim() + '\n');
    console.log('✓ Safely removed NEXT_PUBLIC_API_URL from .env.local to prevent environment hijack.');
  }
}

console.log('======================================================');
console.log(' Environment synchronization completed successfully! ');
console.log('======================================================\n');
