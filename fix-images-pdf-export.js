#!/usr/bin/env node

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

/**
 * Fix Images PDF Export
 * Converts all images to base64 data URLs to ensure they appear in PDF
 */

async function exportToPDF() {
  const htmlFile = 'carbon_market_trends_2024_2025_standalone.html';
  const outputFile = 'Carbon_Market_CDP_Presentation_Fixed_Images.pdf';
  
  console.log('🚀 Starting PDF export with image fix...');
  
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
        '--allow-file-access-from-files',
        '--disable-web-security',
        '--enable-local-file-accesses'
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
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    
    console.log('⏳ Waiting for content to load...');
    await page.waitForTimeout(3000);
    
    // Convert all images to base64 data URLs
    console.log('🔄 Converting images to base64...');
    
    const imageCount = await page.evaluate(async () => {
      const images = Array.from(document.images);
      let converted = 0;
      
      for (const img of images) {
        try {
          // Get the image source path
          const imgSrc = img.src;
          const imgPath = imgSrc.replace('file://', '').split('/').pop();
          
          console.log(`Converting: ${imgPath}`);
          
          // Create a canvas to convert image to base64
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Wait for image to load
          await new Promise((resolve) => {
            if (img.complete && img.naturalWidth > 0) {
              resolve();
            } else {
              img.onload = resolve;
              img.onerror = resolve;
              setTimeout(resolve, 2000);
            }
          });
          
          if (img.naturalWidth > 0) {
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            ctx.drawImage(img, 0, 0);
            
            // Convert to base64
            const dataURL = canvas.toDataURL('image/jpeg', 0.9);
            img.src = dataURL;
            converted++;
            console.log(`✅ Converted: ${imgPath}`);
          } else {
            console.warn(`❌ Failed to load: ${imgPath}`);
          }
        } catch (error) {
          console.warn(`❌ Error converting image: ${error.message}`);
        }
      }
      
      return converted;
    });
    
    console.log(`✅ Converted ${imageCount} images to base64`);
    
    // Wait for conversions to complete
    await page.waitForTimeout(2000);
    
    console.log('🔄 Applying PDF styles...');
    await page.addStyleTag({
      content: `
        @media print {
          #webslides > section {
            page-break-after: always !important;
            break-after: page !important;
            height: 95vh !important;
            position: relative !important;
            display: block !important;
            margin: 0 !important;
            padding: 1vh 1vw !important;
          }
          
          #webslides > section:last-child {
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
          
          img {
            max-width: 100% !important;
            height: auto !important;
            display: block !important;
          }
        }
        
        .ws-nav, .ws-counter, .ws-pagination {
          display: none !important;
        }
      `
    });
    
    // Remove navigation
    await page.evaluate(() => {
      const navElements = document.querySelectorAll('.ws-nav, .ws-counter, .ws-pagination');
      navElements.forEach(el => el.remove());
    });
    
    await page.waitForTimeout(1000);
    
    console.log('📖 Generating PDF with embedded images...');
    
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
    
    console.log(`✅ PDF with embedded images exported: ${outputFile}`);
    console.log(`🖼️ Images embedded: ${imageCount}`);
    
  } catch (error) {
    console.error('❌ Export failed:', error.message);
    console.error(error.stack);
  } finally {
    if (browser) {
      await browser.close();
      console.log('🧹 Browser closed');
    }
  }
}

exportToPDF().then(() => {
  console.log('🎉 Image-fixed export process completed');
}).catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});