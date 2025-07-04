#!/usr/bin/env node

const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const path = require('path');

/**
 * PDF Export Tool for Carbon Market CDP Presentation
 * Exports each slide as a separate page in a PDF
 */

class PresentationPDFExporter {
  constructor() {
    this.htmlFile = 'carbon_market_trends_2024_2025_standalone.html';
    this.outputFile = 'Carbon_Market_CDP_Presentation.pdf';
    this.browser = null;
    this.page = null;
  }

  async init() {
    console.log('🚀 Starting PDF export...');
    
    // Launch browser with optimized settings for PDF
    this.browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection'
      ]
    });

    this.page = await this.browser.newPage();
    
    // Set viewport for presentation size (16:9 aspect ratio)
    await this.page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1
    });
  }

  async loadPresentation() {
    console.log('📄 Loading presentation...');
    
    const htmlPath = path.resolve(__dirname, this.htmlFile);
    
    if (!await fs.pathExists(htmlPath)) {
      throw new Error(`HTML file not found: ${htmlPath}`);
    }
    
    const fileUrl = `file://${htmlPath}`;
    console.log(`Loading: ${fileUrl}`);
    
    await this.page.goto(fileUrl, {
      waitUntil: ['networkidle0', 'domcontentloaded'],
      timeout: 30000
    });
    
    // Wait for any animations or dynamic content to load
    await this.page.waitForTimeout(3000);
    
    console.log('✅ Presentation loaded successfully');
  }

  async exportToPDF() {
    console.log('📖 Generating PDF...');
    
    // Get the total number of slides
    const slideCount = await this.page.evaluate(() => {
      return document.querySelectorAll('section').length;
    });
    
    console.log(`Found ${slideCount} slides`);
    
    // PDF options optimized for presentations
    const pdfOptions = {
      path: this.outputFile,
      format: 'A4',
      landscape: true,
      printBackground: true,
      preferCSSPageSize: false,
      margin: {
        top: '0.5in',
        bottom: '0.5in',
        left: '0.5in',
        right: '0.5in'
      },
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: `
        <div style="font-size: 10px; width: 100%; text-align: center; color: #666;">
          <span class="pageNumber"></span> / <span class="totalPages"></span>
        </div>
      `
    };
    
    // Generate PDF with print CSS
    await this.page.pdf(pdfOptions);
    
    console.log(`✅ PDF exported successfully: ${this.outputFile}`);
    console.log(`📊 Total pages: ${slideCount}`);
  }

  async exportSeparateSlides() {
    console.log('📑 Exporting individual slides...');
    
    const slideCount = await this.page.evaluate(() => {
      return document.querySelectorAll('section').length;
    });
    
    // Create slides directory
    const slidesDir = 'slides';
    await fs.ensureDir(slidesDir);
    
    for (let i = 0; i < slideCount; i++) {
      console.log(`Exporting slide ${i + 1}/${slideCount}...`);
      
      // Navigate to specific slide (if presentation has navigation)
      await this.page.evaluate((slideIndex) => {
        const slides = document.querySelectorAll('section');
        if (slides[slideIndex]) {
          slides.forEach((slide, index) => {
            slide.style.display = index === slideIndex ? 'block' : 'none';
          });
        }
      }, i);
      
      await this.page.waitForTimeout(500);
      
      // Export individual slide as PDF
      await this.page.pdf({
        path: `${slidesDir}/slide_${String(i + 1).padStart(2, '0')}.pdf`,
        format: 'A4',
        landscape: true,
        printBackground: true,
        margin: {
          top: '0.5in',
          bottom: '0.5in',
          left: '0.5in',
          right: '0.5in'
        }
      });
    }
    
    console.log(`✅ Individual slides exported to ${slidesDir}/ directory`);
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      console.log('🧹 Browser closed');
    }
  }

  async run() {
    try {
      await this.init();
      await this.loadPresentation();
      await this.exportToPDF();
      
      // Optionally export individual slides
      const exportIndividual = process.argv.includes('--individual') || process.argv.includes('-i');
      if (exportIndividual) {
        await this.exportSeparateSlides();
      }
      
      console.log('🎉 Export completed successfully!');
      
    } catch (error) {
      console.error('❌ Export failed:', error.message);
      console.error(error.stack);
      process.exit(1);
    } finally {
      await this.cleanup();
    }
  }
}

// Run the exporter
if (require.main === module) {
  const exporter = new PresentationPDFExporter();
  exporter.run();
}

module.exports = PresentationPDFExporter;