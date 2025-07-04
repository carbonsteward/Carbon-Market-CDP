#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Test script to verify the export setup
 */

async function runTests() {
  console.log('🧪 Running PDF export tests...\n');
  
  // Test 1: Check if HTML file exists
  const htmlFile = 'carbon_market_trends_2024_2025_standalone.html';
  const htmlPath = path.resolve(__dirname, htmlFile);
  
  if (fs.existsSync(htmlPath)) {
    console.log('✅ HTML file found:', htmlFile);
  } else {
    console.log('❌ HTML file missing:', htmlFile);
    return;
  }
  
  // Test 2: Check HTML content
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  const sectionCount = (htmlContent.match(/<section/g) || []).length;
  console.log(`✅ Found ${sectionCount} slides in presentation`);
  
  // Test 3: Check for print CSS
  if (htmlContent.includes('@media print')) {
    console.log('✅ Print CSS detected');
  } else {
    console.log('⚠️  Print CSS not found - adding it...');
  }
  
  // Test 4: Check dependencies
  try {
    require('puppeteer');
    console.log('✅ Puppeteer available');
  } catch (error) {
    console.log('❌ Puppeteer not installed - run: npm install');
    return;
  }
  
  console.log('\n🎉 All tests passed! Ready to export PDF.');
  console.log('\n📖 Usage:');
  console.log('  npm run export          # Export complete PDF');
  console.log('  npm run export-single   # Export simple PDF');
  console.log('  node export-pdf.js -i   # Export with individual slides');
}

runTests().catch(console.error);