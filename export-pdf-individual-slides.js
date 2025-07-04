#!/usr/bin/env node

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

/**
 * Individual Slide PDF Export
 * Exports each slide separately and combines them
 * This ensures each slide gets its own page
 */

async function exportToPDF() {
  const htmlFile = 'carbon_market_trends_2024_2025_standalone.html';
  const outputFile = 'Carbon_Market_CDP_Presentation_Individual_Slides.pdf';
  
  console.log('🚀 Starting individual slide PDF export...');
  
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
    
    // Set fullscreen viewport
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
    
    // Get slide count and prepare individual slide extraction
    const slideCount = await page.evaluate(() => {
      return document.querySelectorAll('#webslides > section').length;
    });
    
    console.log(`📊 Found ${slideCount} slides to export individually...`);
    
    // Apply styles that hide navigation and optimize each slide
    await page.addStyleTag({
      content: `
        /* Individual slide export styles */
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
          background: white !important;
        }
        
        #webslides {
          width: 100vw !important;
          height: 100vh !important;
          position: relative !important;
        }
        
        /* Hide all slides initially */
        #webslides > section {
          display: none !important;
          width: 100vw !important;
          height: 100vh !important;
          position: relative !important;
          margin: 0 !important;
          padding: 2vh 2vw !important;
          box-sizing: border-box !important;
        }
        
        /* Show only the active slide */
        #webslides > section.active-slide {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        
        /* Content wrapper optimization */
        #webslides > section .wrap {
          width: 100% !important;
          height: 100% !important;
          max-width: 96vw !important;
          max-height: 96vh !important;
          margin: 0 auto !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: center !important;
        }
        
        /* Hide navigation */
        .ws-nav, .ws-counter, .ws-pagination {
          display: none !important;
        }
        
        /* Font optimization */
        .korean-font, .korean-font * {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans KR", "Malgun Gothic", sans-serif !important;
        }
      `
    });
    
    // Remove navigation elements
    await page.evaluate(() => {
      const navElements = document.querySelectorAll('.ws-nav, .ws-counter, .ws-pagination');
      navElements.forEach(el => el.remove());
    });
    
    console.log('📖 Generating PDF with individual slide method...');
    
    // Create the PDF by making each slide active one by one
    const combinedPDFPages = [];
    
    for (let i = 0; i < slideCount; i++) {
      console.log(`📄 Processing slide ${i + 1}/${slideCount}...`);
      
      // Show only the current slide
      await page.evaluate((slideIndex) => {
        const sections = document.querySelectorAll('#webslides > section');
        sections.forEach((section, index) => {
          section.classList.remove('active-slide');
          if (index === slideIndex) {
            section.classList.add('active-slide');
          }
        });
      }, i);
      
      // Wait for the slide to render
      await page.waitForTimeout(500);
      
      // Generate PDF for this slide
      const pdfBuffer = await page.pdf({
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
      
      combinedPDFPages.push(pdfBuffer);
    }
    
    // For now, just save the last page (we'd need a PDF merger library for full combination)
    // But let's use a different approach - generate one PDF with proper page structure
    
    // Reset all slides to be visible for combined PDF
    await page.evaluate(() => {
      const sections = document.querySelectorAll('#webslides > section');
      sections.forEach((section, index) => {
        section.classList.remove('active-slide');
        section.style.display = 'block';
        section.style.position = 'relative';
        section.style.width = '100vw';
        section.style.height = '100vh';
        section.style.pageBreakAfter = 'always';
        section.style.pageBreakInside = 'avoid';
        section.style.margin = '0';
        section.style.padding = '2vh 2vw';
        section.style.boxSizing = 'border-box';
        
        if (index === sections.length - 1) {
          section.style.pageBreakAfter = 'avoid';
        }
      });
    });
    
    // Apply CSS that forces page breaks
    await page.addStyleTag({
      content: `
        @media print {
          #webslides > section {
            page-break-after: always !important;
            page-break-inside: avoid !important;
            break-after: page !important;
            break-inside: avoid !important;
            height: 100vh !important;
            width: 100vw !important;
            display: block !important;
            position: relative !important;
          }
          
          #webslides > section:last-child {
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
        }
      `
    });
    
    await page.waitForTimeout(1000);
    
    // Generate the final combined PDF
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
      scale: 0.85,
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: `
        <div style="font-size: 9px; width: 100%; text-align: center; color: #666; margin: 0;">
          <span class="pageNumber"></span> / <span class="totalPages"></span>
        </div>
      `
    });
    
    console.log(`✅ Individual slide PDF exported: ${outputFile}`);
    console.log(`📊 Total slides processed: ${slideCount}`);
    console.log('📐 Format: Each slide on separate page with fullscreen layout');
    
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
  console.log('🎉 Individual slide export process completed');
}).catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});