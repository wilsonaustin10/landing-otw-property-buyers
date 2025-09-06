#!/usr/bin/env node

const https = require('https');
const { parse } = require('url');
require('dotenv').config();

// Configuration
const API_KEY = process.env.PAGESPEED_API_KEY;
const API_URL = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';

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

// Get URL from command line arguments
const url = process.argv[2];
const strategy = process.argv[3] || 'mobile'; // Default to mobile

if (!url) {
  console.log(`
${colors.bright}Usage:${colors.reset}
  node scripts/pagespeed-insights.js <URL> [strategy]

${colors.bright}Arguments:${colors.reset}
  URL      - The URL to analyze (required)
  strategy - Either 'mobile' or 'desktop' (default: mobile)

${colors.bright}Examples:${colors.reset}
  node scripts/pagespeed-insights.js https://www.otwhomebuyers.com
  node scripts/pagespeed-insights.js https://www.otwhomebuyers.com desktop
  npm run pagespeed https://www.otwhomebuyers.com
  `);
  process.exit(1);
}

if (!API_KEY) {
  console.error(`${colors.red}Error: PAGESPEED_API_KEY not found in .env file${colors.reset}`);
  console.log('Please add PAGESPEED_API_KEY to your .env file');
  process.exit(1);
}

// Build API request URL with additional categories
const categories = ['performance', 'accessibility', 'best-practices', 'seo'];
const categoryParams = categories.map(cat => `category=${cat}`).join('&');
const apiUrl = `${API_URL}?url=${encodeURIComponent(url)}&strategy=${strategy}&${categoryParams}&key=${API_KEY}`;

console.log(`\n${colors.cyan}🔍 Analyzing ${strategy} performance for: ${url}${colors.reset}\n`);

// Make API request
https.get(apiUrl, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      
      if (result.error) {
        console.error(`${colors.red}API Error: ${result.error.message}${colors.reset}`);
        process.exit(1);
      }

      displayResults(result);
    } catch (error) {
      console.error(`${colors.red}Error parsing response: ${error.message}${colors.reset}`);
      process.exit(1);
    }
  });
}).on('error', (error) => {
  console.error(`${colors.red}Request failed: ${error.message}${colors.reset}`);
  process.exit(1);
});

function displayResults(data) {
  const lighthouse = data.lighthouseResult;
  const categories = lighthouse.categories;
  const audits = lighthouse.audits;

  // Display scores
  console.log(`${colors.bright}═══ Performance Scores ═══${colors.reset}\n`);
  
  Object.entries(categories).forEach(([key, category]) => {
    const score = Math.round(category.score * 100);
    const color = getScoreColor(score);
    const emoji = getScoreEmoji(score);
    console.log(`${emoji} ${color}${category.title}: ${score}/100${colors.reset}`);
  });

  // Core Web Vitals
  console.log(`\n${colors.bright}═══ Core Web Vitals ═══${colors.reset}\n`);
  
  const metrics = {
    'largest-contentful-paint': 'LCP (Largest Contentful Paint)',
    'first-contentful-paint': 'FCP (First Contentful Paint)',
    'cumulative-layout-shift': 'CLS (Cumulative Layout Shift)',
    'total-blocking-time': 'TBT (Total Blocking Time)',
    'speed-index': 'Speed Index',
    'interactive': 'Time to Interactive'
  };

  Object.entries(metrics).forEach(([auditId, label]) => {
    if (audits[auditId]) {
      const audit = audits[auditId];
      const value = audit.displayValue || audit.score;
      const score = Math.round(audit.score * 100);
      const color = getScoreColor(score);
      console.log(`${color}${label}: ${value}${colors.reset}`);
    }
  });

  // Top Opportunities
  console.log(`\n${colors.bright}═══ Top Opportunities ═══${colors.reset}\n`);
  
  const opportunities = Object.values(audits)
    .filter(audit => audit.details && audit.details.type === 'opportunity' && audit.score < 0.9)
    .sort((a, b) => (a.score || 0) - (b.score || 0))
    .slice(0, 5);

  if (opportunities.length > 0) {
    opportunities.forEach((opp, index) => {
      const savings = opp.details.overallSavingsMs;
      console.log(`${colors.yellow}${index + 1}. ${opp.title}${colors.reset}`);
      if (savings) {
        console.log(`   ${colors.dim}Potential savings: ${Math.round(savings)}ms${colors.reset}`);
      }
      if (opp.displayValue) {
        console.log(`   ${colors.dim}${opp.displayValue}${colors.reset}`);
      }
      console.log();
    });
  } else {
    console.log(`${colors.green}✓ No major optimization opportunities found!${colors.reset}`);
  }

  // Diagnostics
  console.log(`${colors.bright}═══ Key Diagnostics ═══${colors.reset}\n`);
  
  const diagnostics = Object.values(audits)
    .filter(audit => audit.details && audit.details.type === 'table' && audit.score < 0.9)
    .slice(0, 3);

  if (diagnostics.length > 0) {
    diagnostics.forEach(diag => {
      console.log(`${colors.cyan}• ${diag.title}${colors.reset}`);
      if (diag.displayValue) {
        console.log(`  ${colors.dim}${diag.displayValue}${colors.reset}`);
      }
    });
  }

  // Summary
  console.log(`\n${colors.bright}═══ Summary ═══${colors.reset}\n`);
  console.log(`Full report: ${colors.blue}${data.id}${colors.reset}`);
  console.log(`Analyzed URL: ${lighthouse.finalUrl}`);
  console.log(`Strategy: ${lighthouse.configSettings.formFactor}`);
  console.log(`Timestamp: ${new Date(lighthouse.fetchTime).toLocaleString()}`);
}

function getScoreColor(score) {
  if (score >= 90) return colors.green;
  if (score >= 50) return colors.yellow;
  return colors.red;
}

function getScoreEmoji(score) {
  if (score >= 90) return '🟢';
  if (score >= 50) return '🟡';
  return '🔴';
}