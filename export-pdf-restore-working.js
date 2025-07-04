#!/usr/bin/env node

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

/**
 * Restored Working PDF Export
 * Based on the version that successfully generated the 24-page PDF
 */

async function exportToPDF() {
  const htmlFile = 'carbon_market_trends_2024_2025_standalone.html';
  const outputFile = 'Carbon_Market_CDP_Presentation_Restored.pdf';
  
  console.log('🚀 Starting restored PDF export...');
  
  const htmlPath = path.resolve(__dirname, htmlFile);
  if (!fs.existsSync(htmlPath)) {
    console.error('❌ HTML file not found:', htmlPath);
    return;
  }
  
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--allow-file-access-from-files'
      ]
    });
    
    const page = await browser.newPage();
    
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1
    });
    
    const fileUrl = `file://${htmlPath}`;
    console.log(`📄 Loading: ${htmlFile}`);
    
    await page.goto(fileUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    console.log('⏳ Waiting for content to load...');
    await page.waitForTimeout(5000);
    
    console.log('🔄 Applying fullscreen mode styles...');
    await page.addStyleTag({
      content: `
        html, body {
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
          display: block !important;
          position: relative !important;
          transform: none !important;
          left: 0 !important;
          top: 0 !important;
        }
        
        .ws-ready #webslides > section .wrap {
          max-width: 90vw !important;
          max-height: 90vh !important;
          width: 100% !important;
          height: 100% !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: center !important;
          align-items: center !important;
          margin: 0 auto !important;
        }
        
        #webslides {
          transform: none !important;
          transition: none !important;
        }
        
        #webslides > section {
          transform: none !important;
          transition: none !important;
          left: 0 !important;
          right: 0 !important;
          top: 0 !important;
          bottom: 0 !important;
          margin: 0 !important;
          position: relative !important;
        }
        
        .ws-nav, .ws-counter, .ws-pagination,
        .ws-ready .ws-nav, .ws-ready .ws-counter, .ws-ready .ws-pagination {
          display: none !important;
        }
        
        @page {
          size: A4 landscape;
          margin: 0.2in;
        }
        
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          #webslides {
            height: auto !important;
          }
          
          #webslides > section {
            page-break-after: always !important;
            page-break-before: auto !important;
            page-break-inside: avoid !important;
            break-after: page !important;
            break-before: auto !important;
            break-inside: avoid !important;
            height: 95vh !important;
            min-height: 95vh !important;
            width: 100vw !important;
            position: relative !important;
            display: block !important;
            margin: 0 !important;
            padding: 1vh 1vw !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
          }
          
          #webslides > section:last-child {
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
          
          #webslides > section .wrap {
            height: auto !important;
            max-height: 90vh !important;
            width: 100% !important;
            overflow: visible !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
          }
        }
      `
    });
    
    await page.evaluate(() => {
      const navElements = document.querySelectorAll('.ws-nav, .ws-counter, .ws-pagination');
      navElements.forEach(el => el.remove());
      
      const sections = document.querySelectorAll('#webslides > section');
      sections.forEach((section, index) => {
        section.style.display = 'block';
        section.style.position = 'relative';
        section.style.width = '100vw';
        section.style.height = '100vh';
        section.style.pageBreakAfter = 'always';
        section.style.pageBreakInside = 'avoid';
        section.style.transform = 'none';
        section.style.left = '0';
        section.style.top = '0';
        
        if (index === sections.length - 1) {
          section.style.pageBreakAfter = 'avoid';
        }
      });
      
      return sections.length;
    });
    
    const slideCount = await page.evaluate(() => {
      return document.querySelectorAll('#webslides > section').length;
    });
    
    console.log(`📊 Processing ${slideCount} slides for PDF generation...`);
    console.log('📖 Generating PDF...');
    
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
      scale: 0.85,
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: `
        <div style="font-size: 9px; width: 100%; text-align: center; color: #666; margin: 0;">
          <span class="pageNumber"></span> / <span class="totalPages"></span>
        </div>
      `
    });
    
    console.log(`✅ PDF exported successfully: ${outputFile}`);
    console.log(`📊 Total slides exported: ${slideCount}`);
    
  } catch (error) {
    console.error('❌ Export failed:', error.message);
  } finally {
    if (browser) {
      await browser.close();
      console.log('🧹 Browser closed');
    }
  }
}

exportToPDF().then(() => {
  console.log('🎉 Export process completed');
}).catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});