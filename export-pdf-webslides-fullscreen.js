#!/usr/bin/env node

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

/**
 * PDF Export for WebSlides - True Fullscreen Mode Simulation
 * Replicates exactly what users see when pressing F11 in WebSlides
 */

class WebSlidesFullscreenExporter {
  constructor() {
    this.htmlFile = 'carbon_market_trends_2024_2025_standalone.html';
    this.outputFile = 'Carbon_Market_CDP_Presentation_WebSlides_Fullscreen.pdf';
    this.browser = null;
    this.page = null;
  }

  async init() {
    console.log('🚀 Starting WebSlides fullscreen PDF export...');
    
    // Launch browser optimized for WebSlides
    this.browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--allow-file-access-from-files',
        '--disable-features=VizDisplayCompositor',
        '--enable-unsafe-webgpu',
        '--no-first-run'
      ],
      defaultViewport: null
    });

    this.page = await this.browser.newPage();
    
    // Set fullscreen viewport (typical fullscreen resolution)
    await this.page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1
    });

    console.log('✅ Browser initialized for fullscreen mode');
  }

  async loadPresentation() {
    console.log('📄 Loading WebSlides presentation...');
    
    const htmlPath = path.resolve(__dirname, this.htmlFile);
    
    if (!fs.existsSync(htmlPath)) {
      throw new Error(`HTML file not found: ${htmlPath}`);
    }
    
    const fileUrl = `file://${htmlPath}`;
    console.log(`Loading: ${fileUrl}`);
    
    await this.page.goto(fileUrl, {
      waitUntil: ['networkidle0', 'domcontentloaded'],
      timeout: 30000
    });
    
    // Wait for WebSlides to fully initialize
    await this.page.waitForTimeout(2000);
    
    console.log('✅ Presentation loaded');
  }

  async activateFullscreenMode() {
    console.log('🔄 Activating WebSlides fullscreen mode...');
    
    // Inject WebSlides fullscreen CSS and behavior
    await this.page.addStyleTag({
      content: `
        /* WebSlides Fullscreen Mode - Exact F11 simulation */
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
          width: 100vw !important;
          height: 100vh !important;
        }
        
        /* Main WebSlides container */
        #webslides {
          width: 100vw !important;
          height: 100vh !important;
          position: relative !important;
        }
        
        /* Individual slide styling - matches WebSlides fullscreen */
        .ws-ready #webslides > section {
          width: 100vw !important;
          height: 100vh !important;
          position: relative !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          box-sizing: border-box !important;
          padding: 2vh 2vw !important;
        }
        
        /* Content wrapper optimization */
        .ws-ready #webslides > section .wrap {
          width: 100% !important;
          height: 100% !important;
          max-width: 96vw !important;
          max-height: 96vh !important;
          margin: 0 auto !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: center !important;
          position: relative !important;
        }
        
        /* Hide navigation and UI elements */
        .ws-nav,
        .ws-counter,
        .ws-pagination,
        .ws-ready .ws-nav,
        .ws-ready .ws-counter,
        .ws-ready .ws-pagination {
          display: none !important;
          visibility: hidden !important;
        }
        
        /* Korean font optimization for fullscreen */
        .korean-font,
        .korean-font *,
        .korean-section-header,
        .korean-card {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans KR", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif !important;
        }
        
        /* Table scaling for fullscreen readability */
        table {
          width: 100% !important;
          font-size: 1.1rem !important;
        }
        
        /* Grid layouts fullscreen optimization */
        .korean-grid {
          width: 100% !important;
          height: auto !important;
        }
        
        /* Image scaling for fullscreen */
        img {
          max-width: 100% !important;
          height: auto !important;
        }
        
        /* Print page breaks */
        @media print {
          body { margin: 0; padding: 0; }
          #webslides { width: 100vw; height: 100vh; }
          section { 
            page-break-after: always; 
            page-break-inside: avoid;
          }
          section:last-child { page-break-after: avoid; }
        }
        
        /* Fullscreen title scaling */
        h1, h2, h3 {
          line-height: 1.2 !important;
        }
        
        /* Content area optimization */
        .alignleft .wrap {
          text-align: left !important;
        }
      `
    });
    
    // Execute JavaScript to simulate WebSlides fullscreen behavior
    await this.page.evaluate(() => {
      // Ensure WebSlides is properly initialized
      if (typeof WebSlides !== 'undefined') {
        // Remove any existing WebSlides instance
        if (window.ws) {
          window.ws = null;
        }
        
        // Initialize new WebSlides instance
        window.ws = new WebSlides({
          autoslide: false,
          changeOnClick: false,
          loop: false,
          navigateOnScroll: false,
          showIndex: false
        });
      }
      
      // Force remove all navigation elements
      const elementsToHide = [
        '.ws-nav', '.ws-counter', '.ws-pagination',
        '.webslides-nav', '.webslides-counter', '.webslides-pagination'
      ];
      
      elementsToHide.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          el.style.display = 'none';
          el.style.visibility = 'hidden';
          el.remove();
        });
      });
      
      // Optimize all sections for fullscreen display
      const sections = document.querySelectorAll('#webslides > section');
      sections.forEach((section, index) => {
        section.style.position = 'relative';
        section.style.width = '100vw';
        section.style.height = '100vh';
        section.style.display = 'flex';
        section.style.alignItems = 'center';
        section.style.justifyContent = 'center';
        
        // Add page break for PDF
        if (index > 0) {
          section.style.pageBreakBefore = 'always';
        }
        
        // Ensure wrap content is centered
        const wrap = section.querySelector('.wrap');
        if (wrap) {
          wrap.style.width = '100%';
          wrap.style.height = '100%';
          wrap.style.maxWidth = '96vw';
          wrap.style.maxHeight = '96vh';
          wrap.style.margin = '0 auto';
          wrap.style.display = 'flex';
          wrap.style.flexDirection = 'column';
          wrap.style.justifyContent = 'center';
        }
      });
      
      return sections.length;
    });
    
    // Additional wait for all styling to apply
    await this.page.waitForTimeout(1500);
    
    console.log('✅ Fullscreen mode activated');
  }

  async exportToPDF() {
    // Get slide count
    const slideCount = await this.page.evaluate(() => {
      return document.querySelectorAll('#webslides > section').length;
    });
    
    console.log(`📊 Found ${slideCount} slides in fullscreen mode`);
    console.log('📖 Generating fullscreen PDF...');
    
    // Export with optimized settings for WebSlides fullscreen
    await this.page.pdf({
      path: this.outputFile,
      format: 'A4',
      landscape: true,
      printBackground: true,
      preferCSSPageSize: false,
      margin: {
        top: '0.1in',
        bottom: '0.1in', 
        left: '0.1in',
        right: '0.1in'
      },
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: `
        <div style="font-size: 9px; width: 100%; text-align: center; color: #888; margin: 0;">
          Carbon Market CDP Presentation - Page <span class="pageNumber"></span> of <span class="totalPages"></span>
        </div>
      `,
      scale: 0.95, // Optimal scale for fullscreen content
      timeout: 60000
    });
    
    console.log(`✅ Fullscreen PDF exported: ${this.outputFile}`);
    console.log(`📄 Total slides: ${slideCount}`);
    
    return slideCount;
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
      await this.activateFullscreenMode();
      const slideCount = await this.exportToPDF();
      
      console.log('🎉 WebSlides fullscreen export completed successfully!');
      console.log(`📊 Exported ${slideCount} slides in true fullscreen format`);
      
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
  const exporter = new WebSlidesFullscreenExporter();
  exporter.run();
}

module.exports = WebSlidesFullscreenExporter;