#!/usr/bin/env node

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

/**
 * PDF Export for WebSlides in Fullscreen Format
 * Mimics the exact appearance users see in fullscreen mode
 */

async function exportToPDF() {
  const htmlFile = 'carbon_market_trends_2024_2025_standalone.html';
  const outputFile = 'Carbon_Market_CDP_Presentation_Fullscreen.pdf';
  
  console.log('🚀 Starting fullscreen PDF export...');
  
  // Check if HTML file exists
  const htmlPath = path.resolve(__dirname, htmlFile);
  if (!fs.existsSync(htmlPath)) {
    console.error('❌ HTML file not found:', htmlPath);
    return;
  }
  
  let browser;
  try {
    // Launch browser with fullscreen simulation settings
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--start-fullscreen',
        '--kiosk'
      ]
    });
    
    const page = await browser.newPage();
    
    // Set viewport to match typical fullscreen dimensions (16:9 aspect ratio)
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1
    });
    
    const fileUrl = `file://${htmlPath}`;
    console.log(`📄 Loading: ${htmlFile}`);
    
    // Load the page with WebSlides
    await page.goto(fileUrl, {
      waitUntil: ['networkidle0', 'domcontentloaded'],
      timeout: 30000
    });
    
    // Wait for WebSlides to initialize
    console.log('⏳ Initializing WebSlides...');
    await page.waitForTimeout(2000);
    
    // Simulate fullscreen mode by injecting CSS and JavaScript
    await page.addStyleTag({
      content: `
        /* Fullscreen WebSlides simulation */
        body {
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
        }
        
        #webslides {
          width: 100vw !important;
          height: 100vh !important;
        }
        
        .ws-ready #webslides > section {
          width: 100vw !important;
          height: 100vh !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        
        .ws-ready #webslides > section .wrap {
          max-width: 90vw !important;
          max-height: 90vh !important;
          width: auto !important;
          height: auto !important;
        }
        
        /* Hide navigation elements */
        .ws-ready .ws-nav,
        .ws-ready .ws-counter,
        .ws-ready .ws-pagination {
          display: none !important;
        }
        
        /* Ensure Korean fonts render properly */
        .korean-font, .korean-font * {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans KR", "Malgun Gothic", sans-serif !important;
        }
        
        /* Print optimization */
        @media print {
          body { margin: 0; padding: 0; }
          #webslides { width: 100vw; height: 100vh; }
          section { page-break-after: always; }
          section:last-child { page-break-after: avoid; }
        }
      `
    });
    
    // Execute JavaScript to properly initialize fullscreen mode
    await page.evaluate(() => {
      // Force WebSlides initialization if not ready
      if (typeof WebSlides !== 'undefined' && !document.body.classList.contains('ws-ready')) {
        const ws = new WebSlides();
      }
      
      // Remove any overlay elements that might interfere
      const overlays = document.querySelectorAll('.ws-nav, .ws-counter, .ws-pagination');
      overlays.forEach(el => el.style.display = 'none');
      
      // Ensure all sections are visible for PDF generation
      const sections = document.querySelectorAll('#webslides > section');
      sections.forEach((section, index) => {
        section.style.display = 'block';
        section.style.position = 'relative';
        section.style.width = '100vw';
        section.style.height = '100vh';
        
        if (index > 0) {
          section.style.pageBreakBefore = 'always';
        }
      });
      
      return sections.length;
    });
    
    // Additional wait for all content to render
    console.log('📊 Rendering all slides...');
    await page.waitForTimeout(3000);
    
    // Get slide count
    const slideCount = await page.evaluate(() => {
      return document.querySelectorAll('#webslides > section').length;
    });
    
    console.log(`📄 Found ${slideCount} slides`);
    console.log('📖 Generating fullscreen PDF...');
    
    // Generate PDF with fullscreen optimization
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
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: `
        <div style="font-size: 10px; width: 100%; text-align: center; color: #666; margin: 0 1in;">
          <span class="pageNumber"></span> / <span class="totalPages"></span>
        </div>
      `,
      scale: 0.9 // Slightly scale down to ensure content fits
    });
    
    console.log(`✅ Fullscreen PDF exported successfully: ${outputFile}`);
    console.log(`📊 Total slides: ${slideCount}`);
    
  } catch (error) {
    console.error('❌ Export failed:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  } finally {
    if (browser) {
      await browser.close();
      console.log('🧹 Browser closed');
    }
  }
}

// Run the export
exportToPDF().then(() => {
  console.log('🎉 Fullscreen export process completed');
}).catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});