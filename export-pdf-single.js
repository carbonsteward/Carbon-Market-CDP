#!/usr/bin/env node

const puppeteer = require('puppeteer');
const path = require('path');

/**
 * Simple PDF Export - All slides in one PDF file
 */

async function exportToPDF() {
  const htmlFile = 'carbon_market_trends_2024_2025_standalone.html';
  const outputFile = 'Carbon_Market_CDP_Presentation_Complete.pdf';
  
  console.log('🚀 Starting simple PDF export...');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Set large viewport for presentation
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 2
    });
    
    const htmlPath = path.resolve(__dirname, htmlFile);
    const fileUrl = `file://${htmlPath}`;
    
    console.log(`📄 Loading: ${fileUrl}`);
    
    await page.goto(fileUrl, {
      waitUntil: ['networkidle0', 'domcontentloaded'],
      timeout: 30000
    });
    
    // Wait for content to load
    await page.waitForTimeout(2000);
    
    console.log('📖 Generating PDF...');
    
    // Export to PDF with optimal settings
    await page.pdf({
      path: outputFile,
      format: 'A4',
      landscape: true,
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: '0.2in',
        bottom: '0.2in',
        left: '0.2in',
        right: '0.2in'
      },
      displayHeaderFooter: false
    });
    
    console.log(`✅ PDF exported: ${outputFile}`);
    
  } catch (error) {
    console.error('❌ Export failed:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

exportToPDF();