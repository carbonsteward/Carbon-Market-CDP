#!/usr/bin/env node

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

/**
 * PDF Export with Absolute Image Paths
 * Creates a temporary HTML file with absolute image paths
 */

async function exportToPDF() {
  const htmlFile = 'carbon_market_trends_2024_2025_standalone.html';
  const tempHtmlFile = 'temp_carbon_market_trends_absolute_paths.html';
  const outputFile = 'Carbon_Market_CDP_Presentation_Absolute_Paths.pdf';
  
  console.log('🚀 Starting PDF export with absolute image paths...');
  
  const htmlPath = path.resolve(__dirname, htmlFile);
  const currentDir = path.resolve(__dirname);
  
  if (!fs.existsSync(htmlPath)) {
    console.error('❌ HTML file not found:', htmlPath);
    return;
  }
  
  try {
    // Read the original HTML file
    console.log('📝 Creating temporary HTML with absolute paths...');
    let htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    // List of images to convert to absolute paths
    const imageFiles = [
      'sbti1.jpg', 'sbti2.jpg', 'sbti3.jpg',
      'safeguard1.jpg', 'safeguard2.jpg', 'safeguard3.jpg',
      'risk1.jpg', 'risk2.jpg', 'risk3.jpg', 'risk4.jpg',
      'cmiwg.jpg', 'CarbonFlow.svg',
      'carbon-offset-rankings-2024.jpg',
      'cumulative-carbon-offset-rankings.jpg',
      'top-buyers-2024.jpg',
      'icvcm-elets-terminology-comparison.jpg'
    ];
    
    // Replace relative image paths with absolute file:// URLs
    imageFiles.forEach(imageName => {
      const imagePath = path.resolve(currentDir, imageName);
      if (fs.existsSync(imagePath)) {
        const absoluteUrl = `file://${imagePath}`;
        // Replace src="imageName" with absolute path
        const regex = new RegExp(`src="${imageName}"`, 'g');
        htmlContent = htmlContent.replace(regex, `src="${absoluteUrl}"`);
        console.log(`✅ Updated path for: ${imageName}`);
      } else {
        console.log(`⚠️  Image not found: ${imageName}`);
      }
    });
    
    // Write temporary HTML file
    const tempHtmlPath = path.resolve(__dirname, tempHtmlFile);
    fs.writeFileSync(tempHtmlPath, htmlContent);
    console.log(`📄 Created temporary HTML: ${tempHtmlFile}`);
    
    // Launch browser and export PDF
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1
    });
    
    const fileUrl = `file://${tempHtmlPath}`;
    console.log(`📄 Loading temporary HTML...`);
    
    await page.goto(fileUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    console.log('⏳ Waiting for content and images to load...');
    await page.waitForTimeout(5000);
    
    // Check image loading status
    const imageStatus = await page.evaluate(() => {
      const images = Array.from(document.images);
      return images.map(img => ({
        src: img.src.split('/').pop(),
        loaded: img.complete && img.naturalWidth > 0,
        width: img.naturalWidth,
        height: img.naturalHeight
      }));
    });
    
    console.log('📊 Image loading status:');
    imageStatus.forEach(img => {
      const status = img.loaded ? '✅' : '❌';
      console.log(`  ${status} ${img.src} (${img.width}x${img.height})`);
    });
    
    // Apply PDF styles
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
      scale: 0.85
    });
    
    await browser.close();
    
    // Clean up temporary file
    fs.unlinkSync(tempHtmlPath);
    console.log('🧹 Cleaned up temporary HTML file');
    
    console.log(`✅ PDF exported: ${outputFile}`);
    console.log(`🖼️ Images processed: ${imageStatus.length}`);
    console.log(`✅ Successfully loaded: ${imageStatus.filter(img => img.loaded).length}`);
    
  } catch (error) {
    console.error('❌ Export failed:', error.message);
    console.error(error.stack);
  }
}

exportToPDF().then(() => {
  console.log('🎉 Absolute paths export completed');
}).catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});