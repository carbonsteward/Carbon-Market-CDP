#!/usr/bin/env node

const fs = require('fs');

/**
 * Simple PDF page counter
 * Counts pages by looking for PDF page objects
 */

function countPDFPages(filePath) {
  try {
    const data = fs.readFileSync(filePath);
    const pdfString = data.toString();
    
    // Count page objects in PDF
    const pageMatches = pdfString.match(/\/Type\s*\/Page[^s]/g);
    const pageCount = pageMatches ? pageMatches.length : 0;
    
    console.log(`📄 PDF: ${filePath}`);
    console.log(`📊 Pages found: ${pageCount}`);
    
    // Also check for alternative page counting method
    const catalogMatches = pdfString.match(/\/Count\s+(\d+)/g);
    if (catalogMatches) {
      const catalogCount = catalogMatches[0].match(/\d+/)[0];
      console.log(`📋 Catalog count: ${catalogCount}`);
    }
    
    return pageCount;
    
  } catch (error) {
    console.error('❌ Error reading PDF:', error.message);
    return 0;
  }
}

// Check the main PDF file
const pdfFile = 'Carbon_Market_CDP_Presentation_Chrome_Direct.pdf';
const pages = countPDFPages(pdfFile);

if (pages > 0) {
  console.log(`✅ PDF contains ${pages} pages`);
  if (pages === 21) {
    console.log('🎉 All 21 slides successfully exported!');
  } else if (pages < 21) {
    console.log(`⚠️  Expected 21 slides, found ${pages} pages`);
  }
} else {
  console.log('❌ Could not determine page count');
}