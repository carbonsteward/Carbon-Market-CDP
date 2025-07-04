#!/usr/bin/env node

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

/**
 * Force Page Breaks PDF Export
 * Completely overrides WebSlides to force each section onto a separate page
 */

async function exportToPDF() {
  const htmlFile = 'carbon_market_trends_2024_2025_standalone.html';
  const outputFile = 'Carbon_Market_CDP_Presentation_Force_PageBreaks.pdf';
  
  console.log('🚀 Starting force page breaks PDF export...');
  
  // Check if HTML file exists
  const htmlPath = path.resolve(__dirname, htmlFile);
  if (!fs.existsSync(htmlPath)) {
    console.error('❌ HTML file not found:', htmlPath);
    return;
  }
  
  let browser;
  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      timeout: 60000
    });
    
    const page = await browser.newPage();
    
    // Set viewport
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
    
    console.log('⏳ Waiting for content to load...');
    await page.waitForTimeout(3000);
    
    // Completely restructure the page for PDF
    console.log('🔧 Restructuring page for proper PDF page breaks...');
    
    const slideCount = await page.evaluate(() => {
      // Disable WebSlides completely
      if (window.WebSlides) {
        window.WebSlides = null;
      }
      
      // Remove all WebSlides classes and behaviors
      document.body.classList.remove('ws-ready');
      const webslides = document.getElementById('webslides');
      if (webslides) {
        webslides.classList.remove('ws-ready');
      }
      
      // Get all sections
      const sections = document.querySelectorAll('#webslides > section');
      const sectionCount = sections.length;
      
      // Remove WebSlides container and restructure
      const body = document.body;
      const newContainer = document.createElement('div');
      newContainer.id = 'pdf-container';
      
      // Move each section to new container with proper spacing
      sections.forEach((section, index) => {
        // Remove WebSlides classes
        section.classList.remove('ws-ready');
        
        // Create a new page wrapper for each section
        const pageWrapper = document.createElement('div');
        pageWrapper.className = 'pdf-page';
        pageWrapper.style.cssText = `
          width: 100vw;
          height: 100vh;
          padding: 2vh 2vw;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: center;
          page-break-after: always;
          page-break-inside: avoid;
          break-after: page;
          break-inside: avoid;
          position: relative;
          background: white;
        `;
        
        // Don't add page break to last section
        if (index === sections.length - 1) {
          pageWrapper.style.pageBreakAfter = 'avoid';
          pageWrapper.style.breakAfter = 'avoid';
        }
        
        // Clone the section content
        const sectionClone = section.cloneNode(true);
        sectionClone.style.cssText = `
          width: 100%;
          height: 100%;
          max-width: 96vw;
          max-height: 96vh;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          position: relative;
        `;
        
        pageWrapper.appendChild(sectionClone);
        newContainer.appendChild(pageWrapper);
      });
      
      // Replace the body content
      body.innerHTML = '';
      body.appendChild(newContainer);
      
      return sectionCount;
    });
    
    // Apply CSS specifically for PDF generation
    await page.addStyleTag({
      content: `
        /* PDF-specific styles */
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
          height: 100% !important;
          background: white !important;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans KR", "Malgun Gothic", sans-serif !important;
        }
        
        #pdf-container {
          width: 100% !important;
          height: auto !important;
        }
        
        .pdf-page {
          width: 100vw !important;
          height: 100vh !important;
          page-break-after: always !important;
          page-break-inside: avoid !important;
          break-after: page !important;
          break-inside: avoid !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          background: white !important;
          position: relative !important;
        }
        
        .pdf-page:last-child {
          page-break-after: avoid !important;
          break-after: avoid !important;
        }
        
        /* Korean font optimization */
        .korean-font, .korean-font * {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans KR", "Malgun Gothic", sans-serif !important;
        }
        
        /* Ensure tables and content scale properly */
        table {
          width: 100% !important;
          font-size: 1.1rem !important;
        }
        
        /* Grid layouts */
        .korean-grid {
          width: 100% !important;
          height: auto !important;
        }
        
        /* Images */
        img {
          max-width: 100% !important;
          height: auto !important;
        }
      `
    });
    
    console.log(`📊 Restructured ${slideCount} slides for PDF generation...`);
    console.log('📖 Generating PDF with forced page breaks...');
    
    await page.waitForTimeout(1000);
    
    // Generate PDF
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
    
    console.log(`✅ Force page breaks PDF exported: ${outputFile}`);
    console.log(`📊 Total slides: ${slideCount}`);
    console.log('📐 Format: Each slide forced onto separate page');
    
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
  console.log('🎉 Force page breaks export process completed');
}).catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});