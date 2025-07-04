#!/usr/bin/env node

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const http = require('http');

/**
 * PDF Export with HTTP Server
 * Serves files via HTTP to avoid file:// restrictions
 */

let server;

function startHttpServer(port = 8081) {
  return new Promise((resolve, reject) => {
    const currentDir = __dirname;
    
    server = http.createServer((req, res) => {
      let filePath = path.join(currentDir, req.url === '/' ? 'carbon_market_trends_2024_2025_standalone.html' : req.url);
      
      // Security check - only serve files in current directory
      if (!filePath.startsWith(currentDir)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }
      
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }
        
        // Set content type based on file extension
        const ext = path.extname(filePath);
        const contentTypes = {
          '.html': 'text/html',
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.png': 'image/png',
          '.svg': 'image/svg+xml',
          '.css': 'text/css',
          '.js': 'application/javascript'
        };
        
        res.writeHead(200, {
          'Content-Type': contentTypes[ext] || 'application/octet-stream',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(data);
      });
    });
    
    server.listen(port, 'localhost', () => {
      console.log(`🌐 HTTP server started on http://localhost:${port}`);
      resolve(port);
    });
    
    server.on('error', reject);
  });
}

function stopHttpServer() {
  if (server) {
    server.close();
    console.log('🔚 HTTP server stopped');
  }
}

async function exportToPDF() {
  const outputFile = 'Carbon_Market_CDP_Presentation_HTTP.pdf';
  
  console.log('🚀 Starting PDF export with HTTP server...');
  
  try {
    // Start HTTP server
    const port = await startHttpServer();
    const url = `http://localhost:${port}/`;
    
    // Give server a moment to start
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Launch browser
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
    
    console.log(`📄 Loading: ${url}`);
    
    await page.goto(url, {
      waitUntil: 'networkidle0',
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
            box-sizing: border-box !important;
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
    
    console.log('📖 Generating PDF with images...');
    
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
    
    console.log(`✅ PDF exported: ${outputFile}`);
    console.log(`🖼️ Images processed: ${imageStatus.length}`);
    console.log(`✅ Successfully loaded: ${imageStatus.filter(img => img.loaded).length}`);
    
  } catch (error) {
    console.error('❌ Export failed:', error.message);
    console.error(error.stack);
  } finally {
    stopHttpServer();
  }
}

// Handle cleanup on exit
process.on('SIGINT', () => {
  stopHttpServer();
  process.exit();
});

process.on('SIGTERM', () => {
  stopHttpServer();
  process.exit();
});

exportToPDF().then(() => {
  console.log('🎉 HTTP server export completed');
}).catch((error) => {
  console.error('💥 Fatal error:', error);
  stopHttpServer();
  process.exit(1);
});