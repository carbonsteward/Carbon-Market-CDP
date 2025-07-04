#!/usr/bin/env node

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function exportToPDF() {
  const htmlFile = 'carbon_market_trends_2024_2025_standalone.html';
  const outputFile = 'Carbon_Market_CDP_Presentation_With_Images_Final.pdf';
  
  console.log('🚀 Starting PDF export...');
  
  const htmlPath = path.resolve(__dirname, htmlFile);
  if (!fs.existsSync(htmlPath)) {
    console.error('❌ HTML file not found:', htmlPath);
    return;
  }
  
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--allow-file-access-from-files']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    const fileUrl = `file://${htmlPath}`;
    console.log(`📄 Loading: ${htmlFile}`);
    
    await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 30000 });
    
    console.log('⏳ Waiting for content and images...');
    await page.waitForTimeout(5000);
    
    // Simple image loading check
    await page.evaluate(() => {
      return new Promise((resolve) => {
        const images = Array.from(document.images);
        let loaded = 0;
        
        if (images.length === 0) {
          resolve();
          return;
        }
        
        images.forEach(img => {
          if (img.complete) {
            loaded++;
          } else {
            img.onload = img.onerror = () => {
              loaded++;
              if (loaded === images.length) resolve();
            };
          }
        });
        
        if (loaded === images.length) resolve();
        setTimeout(resolve, 3000); // Timeout after 3 seconds
      });
    });
    
    console.log('📖 Generating PDF...');
    
    await page.pdf({
      path: outputFile,
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: { top: '0.2in', bottom: '0.2in', left: '0.2in', right: '0.2in' },
      scale: 0.85
    });
    
    console.log(`✅ PDF exported: ${outputFile}`);
    
  } catch (error) {
    console.error('❌ Export failed:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

exportToPDF();