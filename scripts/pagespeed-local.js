#!/usr/bin/env node

const { exec } = require('child_process');
const https = require('https');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const url = process.argv[2] || 'http://localhost:3000';
const strategy = process.argv[3] || 'mobile';

console.log(`
${colors.cyan}════════════════════════════════════════════════════${colors.reset}
${colors.bright}     Local PageSpeed Insights Testing Tool${colors.reset}
${colors.cyan}════════════════════════════════════════════════════${colors.reset}

This tool helps you test PageSpeed Insights locally without API key issues.

${colors.yellow}Note: For production use, the API key needs to be configured with:${colors.reset}
1. Application restrictions set to "None" or proper HTTP referrers
2. API restrictions set to include "PageSpeed Insights API"

${colors.bright}Testing URL:${colors.reset} ${url}
${colors.bright}Strategy:${colors.reset} ${strategy}

${colors.dim}Opening PageSpeed Insights in your browser...${colors.reset}
`);

// Construct the PageSpeed Insights web URL
const webUrl = `https://pagespeed.web.dev/analysis?url=${encodeURIComponent(url)}&form_factor=${strategy}`;

// Open in browser based on platform
const platform = process.platform;
let command;

if (platform === 'darwin') {
  command = `open "${webUrl}"`;
} else if (platform === 'win32') {
  command = `start "${webUrl}"`;
} else {
  command = `xdg-open "${webUrl}"`;
}

exec(command, (error) => {
  if (error) {
    console.error(`${colors.red}Error opening browser: ${error.message}${colors.reset}`);
    console.log(`\n${colors.bright}Please open this URL manually:${colors.reset}`);
    console.log(`${colors.blue}${webUrl}${colors.reset}\n`);
  } else {
    console.log(`${colors.green}✓ Opened PageSpeed Insights in your browser${colors.reset}\n`);
  }
});

// Also try to fetch without API key (public endpoint)
console.log(`${colors.dim}Attempting to fetch basic metrics...${colors.reset}\n`);

const publicUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${strategy}&category=performance`;

https.get(publicUrl, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      
      if (result.error) {
        console.log(`${colors.yellow}ℹ️  API requires authentication for detailed results${colors.reset}`);
        console.log(`${colors.dim}   Configure your API key in .env to use the full API${colors.reset}\n`);
        
        console.log(`${colors.bright}API Key Configuration Instructions:${colors.reset}`);
        console.log(`1. Go to: https://console.cloud.google.com/apis/credentials`);
        console.log(`2. Find your API key or create a new one`);
        console.log(`3. Set Application restrictions to "None" for testing`);
        console.log(`4. Under API restrictions, add "PageSpeed Insights API"`);
        console.log(`5. Save and wait a few minutes for changes to propagate\n`);
      } else if (result.lighthouseResult) {
        // Display basic score if available
        const score = Math.round(result.lighthouseResult.categories.performance.score * 100);
        const color = score >= 90 ? colors.green : score >= 50 ? colors.yellow : colors.red;
        console.log(`${colors.bright}Performance Score:${colors.reset} ${color}${score}/100${colors.reset}\n`);
      }
    } catch (error) {
      // Silent fail - browser view is primary
    }
  });
}).on('error', () => {
  // Silent fail - browser view is primary
});

// Provide helpful commands
console.log(`${colors.bright}Quick Commands:${colors.reset}`);
console.log(`• Test production:  ${colors.cyan}npm run pagespeed:production${colors.reset}`);
console.log(`• Test preview:     ${colors.cyan}npm run pagespeed:preview${colors.reset}`);
console.log(`• Test local:       ${colors.cyan}npm run pagespeed http://localhost:3000${colors.reset}`);
console.log(`• Test desktop:     ${colors.cyan}npm run pagespeed [URL] desktop${colors.reset}\n`);