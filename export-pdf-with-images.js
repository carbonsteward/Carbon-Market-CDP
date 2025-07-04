#!/usr/bin/env node

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

/**
 * PDF Export with Image Support
 * Specifically designed to handle image loading properly
 */

async function exportToPDF() {
  const htmlFile = 'carbon_market_trends_2024_2025_standalone.html';
  const outputFile = 'Carbon_Market_CDP_Presentation_With_Images.pdf';
  
  console.log('🚀 Starting PDF export with image support...');
  
  // Check if HTML file exists
  const htmlPath = path.resolve(__dirname, htmlFile);
  if (!fs.existsSync(htmlPath)) {
    console.error('❌ HTML file not found:', htmlPath);
    return;
  }
  
  let browser;
  try {
    // Launch browser with file access
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--allow-file-access-from-files',
        '--disable-web-security'
      ]
    });
    
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1
    });
    
    // Enable console logging from the page
    page.on('console', msg => {
      if (msg.type() === 'warn' || msg.type() === 'error') {
        console.log(`Browser: ${msg.text()}`);
      }
    });
    
    const fileUrl = `file://${htmlPath}`;
    console.log(`📄 Loading: ${htmlFile}`);
    
    // Load the page
    await page.goto(fileUrl, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    
    console.log('⏳ Waiting for initial content...');
    await page.waitForTimeout(3000);
    
    // Check and wait for all images
    console.log('🖼️ Ensuring all images are loaded...');
    
    const imageInfo = await page.evaluate(async () => {
      // Wait for all images to load
      const images = Array.from(document.images);
      console.log(`Found ${images.length} images to check`);
      
      await Promise.all(
        images.map(img => {
          if (img.complete && img.naturalWidth > 0) {
            return Promise.resolve();
          }
          
          return new Promise((resolve) => {
            const timeout = setTimeout(() => {
              console.warn(`Image timeout: ${img.src}`);
              resolve();
            }, 5000);
            
            img.onload = () => {
              clearTimeout(timeout);
              console.log(`✅ Loaded: ${img.src.split('/').pop()}`);
              resolve();
            };
            
            img.onerror = () => {
              clearTimeout(timeout);
              console.warn(`❌ Failed: ${img.src.split('/').pop()}`);
              resolve();
            };
            
            // Trigger reload if not complete
            if (!img.complete) {
              const src = img.src;
              img.src = '';
              img.src = src;
            }
          });
        })
      );
      
      // Return image status
      return images.map(img => ({
        src: img.src.split('/').pop(),
        loaded: img.complete && img.naturalWidth > 0,
        width: img.naturalWidth,
        height: img.naturalHeight
      }));
    });
    
    console.log('📊 Image loading summary:');
    imageInfo.forEach(img => {
      const status = img.loaded ? '✅' : '❌';
      console.log(`  ${status} ${img.src} (${img.width}x${img.height})`);
    });
    
    // Apply basic fullscreen styles
    await page.addStyleTag({
      content: `
        @media print {
          #webslides > section {
            page-break-after: always !important;
            break-after: page !important;
            height: 95vh !important;
            position: relative !important;
            display: block !important;
          }
          
          #webslides > section:last-child {
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
        }
        
        .ws-nav, .ws-counter, .ws-pagination {
          display: none !important;
        }
      `
    });
    
    // Additional wait for styles to apply
    await page.waitForTimeout(2000);
    
    console.log('📖 Generating PDF with images...');
    
    // Generate PDF
    await page.pdf({
      path: outputFile,
      format: 'A4',
      landscape: true,
      printBackground: true,
      preferCSSPageSize: false,
      margin: {
        top: '0.2in',
        bottom: '0.2in',
        left: '0.2in',
        right: '0.2in'
      },
      scale: 0.85
    });
    
    console.log(`✅ PDF with images exported: ${outputFile}`);
    console.log(`🖼️ Images processed: ${imageInfo.length}`);
    console.log(`✅ Successful loads: ${imageInfo.filter(img => img.loaded).length}`);
    
  } catch (error) {
    console.error('❌ Export failed:', error.message);
  } finally {
    if (browser) {
      await browser.close();
      console.log('🧹 Browser closed');
    }
  }
}

// Run the export
exportToPDF().then(() => {
  console.log('🎉 Image-enabled export process completed');
}).catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});