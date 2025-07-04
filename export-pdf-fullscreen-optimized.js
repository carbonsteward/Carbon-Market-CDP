#!/usr/bin/env node

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

/**
 * Optimized PDF Export for WebSlides Fullscreen Mode
 * Replicates the exact visual format seen by users at F11 fullscreen
 */

async function exportToPDF() {
  const htmlFile = 'carbon_market_trends_2024_2025_standalone.html';
  const outputFile = 'Carbon_Market_CDP_Presentation_Fullscreen_Optimized.pdf';
  
  console.log('🚀 Starting optimized fullscreen PDF export...');
  
  // Check if HTML file exists
  const htmlPath = path.resolve(__dirname, htmlFile);
  if (!fs.existsSync(htmlPath)) {
    console.error('❌ HTML file not found:', htmlPath);
    return;
  }
  
  let browser;
  try {
    // Launch browser with optimal settings
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security'
      ],
      timeout: 60000
    });
    
    const page = await browser.newPage();
    
    // Set fullscreen viewport matching typical browser fullscreen (16:9)
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1
    });
    
    const fileUrl = `file://${htmlPath}`;
    console.log(`📄 Loading: ${htmlFile}`);
    
    // Load the page
    await page.goto(fileUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Wait for WebSlides to initialize
    console.log('⏳ Initializing WebSlides...');
    await page.waitForTimeout(3000);
    
    // Apply fullscreen styles that match what users see in F11 mode
    console.log('🔄 Applying fullscreen styles...');
    await page.addStyleTag({
      content: `
        /* Fullscreen mode - exact F11 simulation */
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
          background: #000 !important;
        }
        
        #webslides {
          width: 100vw !important;
          height: 100vh !important;
        }
        
        /* Hide all navigation elements */
        .ws-nav, .ws-counter, .ws-pagination,
        .ws-ready .ws-nav, .ws-ready .ws-counter, .ws-ready .ws-pagination {
          display: none !important;
        }
        
        /* Fullscreen slide layout */
        .ws-ready #webslides > section {
          width: 100vw !important;
          height: 100vh !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          position: relative !important;
        }
        
        /* Content wrapper - optimized for fullscreen viewing */
        .ws-ready #webslides > section .wrap {
          width: 90vw !important;
          height: 90vh !important;
          max-width: 90vw !important;
          max-height: 90vh !important;
          margin: 0 auto !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: center !important;
        }
        
        /* Page breaks for PDF */
        @media print {
          section { 
            page-break-after: always !important;
            page-break-inside: avoid !important;
          }
          section:last-child { 
            page-break-after: avoid !important;
          }
        }
        
        /* Font optimization for fullscreen */
        .korean-font, .korean-font * {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans KR", "Malgun Gothic", sans-serif !important;
        }
      `
    });
    
    // Remove navigation elements and optimize layout
    await page.evaluate(() => {
      // Remove navigation
      const navElements = document.querySelectorAll('.ws-nav, .ws-counter, .ws-pagination');
      navElements.forEach(el => el.remove());
      
      // Optimize sections for fullscreen
      const sections = document.querySelectorAll('#webslides > section');
      sections.forEach((section, index) => {
        section.style.position = 'relative';
        section.style.width = '100vw';
        section.style.height = '100vh';
        section.style.display = 'flex';
        section.style.alignItems = 'center';
        section.style.justifyContent = 'center';
        
        if (index > 0) {
          section.style.pageBreakBefore = 'always';
        }
      });
      
      return sections.length;
    });
    
    // Final wait for layout stabilization
    await page.waitForTimeout(2000);
    
    // Get slide count
    const slideCount = await page.evaluate(() => {
      return document.querySelectorAll('#webslides > section').length;
    });
    
    console.log(`📄 Found ${slideCount} slides`);
    console.log('📖 Generating fullscreen-optimized PDF...');
    
    // Generate PDF with fullscreen-optimized settings
    await page.pdf({
      path: outputFile,
      format: 'A4',
      landscape: true,
      printBackground: true,
      preferCSSPageSize: false,
      margin: {
        top: '0.25in',
        bottom: '0.25in',
        left: '0.25in',
        right: '0.25in'
      },
      displayHeaderFooter: false,
      scale: 0.9,
      timeout: 60000
    });
    
    console.log(`✅ Fullscreen PDF exported successfully: ${outputFile}`);
    console.log(`📊 Total slides: ${slideCount}`);
    console.log('📐 Format: Optimized for fullscreen viewing (F11 mode equivalent)');
    
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
  console.log('🎉 Fullscreen-optimized export process completed');
}).catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});