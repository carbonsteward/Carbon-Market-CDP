#!/usr/bin/env node

const PptxGenJS = require('pptxgenjs');
const fs = require('fs-extra');
const cheerio = require('cheerio');
const path = require('path');

console.log('🚀 Starting Enhanced PowerPoint export...');

class EnhancedPowerPointExporter {
  constructor() {
    this.pptx = new PptxGenJS();
    this.setupPresentation();
    this.colors = {
      navy: '2C3E50',
      darkGray: '505050', 
      lightGray: 'F8F9FA',
      black: '1A1A1A',
      accent: '4A90E2',
      success: '27AE60',
      warning: 'F39C12',
      white: 'FFFFFF'
    };
  }

  setupPresentation() {
    this.pptx.author = 'Carbon Market Research Team';
    this.pptx.company = 'Carbon Market CDP';
    this.pptx.subject = 'Carbon Market Trends 2024-2025: CDP Questionnaire Insights';
    this.pptx.title = 'Carbon Market Trends 2024-2025';
    this.pptx.layout = 'LAYOUT_WIDE';
    
    console.log('✅ Enhanced presentation setup complete');
  }

  async parseHTML() {
    console.log('📄 Reading and parsing HTML file...');
    const htmlPath = path.join(__dirname, 'carbon_market_trends_2024_2025_standalone.html');
    const htmlContent = await fs.readFile(htmlPath, 'utf8');
    const $ = cheerio.load(htmlContent);
    
    const slides = [];
    
    $('section').each((index, element) => {
      const $slide = $(element);
      const slideData = this.extractDetailedSlideContent($slide, $, index);
      slides.push(slideData);
      console.log(`   📝 Slide ${index + 1}: ${slideData.title.substring(0, 50)}...`);
    });
    
    console.log(`✅ Successfully parsed ${slides.length} slides`);
    return slides;
  }

  extractDetailedSlideContent($slide, $, index) {
    // Extract title with better selectors
    let title = $slide.find('.korean-section-header h2').first().text().trim() ||
                $slide.find('h2').first().text().trim() ||
                $slide.find('h1').first().text().trim() ||
                $slide.find('.korean-title').first().text().trim() ||
                `Slide ${index + 1}`;

    // Extract subtitle
    const subtitle = $slide.find('.korean-section-header .subtitle').text().trim() ||
                     $slide.find('.subtitle').text().trim();

    // Extract structured content
    const content = this.extractStructuredContent($slide, $);
    
    // Extract metrics with values and labels
    const metrics = this.extractMetrics($slide, $);
    
    // Extract tables
    const tables = this.extractTables($slide, $);
    
    // Extract key points from cards
    const keyPoints = this.extractKeyPoints($slide, $);

    return {
      title,
      subtitle,
      content,
      metrics,
      tables,
      keyPoints,
      index,
      hasComplexContent: content.length > 10 || keyPoints.length > 0 || tables.length > 0
    };
  }

  extractStructuredContent($slide, $) {
    const content = [];
    
    // Extract from korean-list items
    $slide.find('.korean-list li').each((i, li) => {
      const text = $(li).text().trim();
      if (text && text.length > 0) {
        content.push('• ' + text);
      }
    });
    
    // Extract from regular lists if no korean-list found
    if (content.length === 0) {
      $slide.find('li').each((i, li) => {
        const text = $(li).text().trim();
        if (text && text.length > 0 && !text.includes('•')) {
          content.push('• ' + text);
        }
      });
    }
    
    // Extract paragraphs if no lists
    if (content.length === 0) {
      $slide.find('p').each((i, p) => {
        const text = $(p).text().trim();
        if (text && text.length > 0 && !text.startsWith('주목:') && !text.startsWith('※')) {
          content.push(text);
        }
      });
    }

    return content;
  }

  extractMetrics($slide, $) {
    const metrics = [];
    
    $slide.find('.korean-metric').each((i, metric) => {
      const value = $(metric).find('.korean-metric-value').text().trim();
      const label = $(metric).find('.korean-metric-label').text().trim();
      if (value && label) {
        metrics.push({
          value: value,
          label: label,
          combined: `${value} ${label}`
        });
      }
    });

    return metrics;
  }

  extractTables($slide, $) {
    const tables = [];
    
    $slide.find('table').each((i, table) => {
      const rows = [];
      $(table).find('tr').each((j, tr) => {
        const cells = [];
        $(tr).find('td, th').each((k, cell) => {
          cells.push($(cell).text().trim());
        });
        if (cells.length > 0) {
          rows.push(cells);
        }
      });
      if (rows.length > 0) {
        tables.push(rows);
      }
    });

    return tables;
  }

  extractKeyPoints($slide, $) {
    const keyPoints = [];
    
    // Extract from korean-card sections
    $slide.find('.korean-card').each((i, card) => {
      const cardTitle = $(card).find('h3').first().text().trim();
      const cardContent = [];
      
      $(card).find('li').each((j, li) => {
        const text = $(li).text().trim();
        if (text) cardContent.push('• ' + text);
      });
      
      if (cardTitle || cardContent.length > 0) {
        keyPoints.push({
          title: cardTitle,
          content: cardContent
        });
      }
    });

    return keyPoints;
  }

  createEnhancedSlide(slideData) {
    const slide = this.pptx.addSlide();
    let currentY = 0.5;

    // Title
    if (slideData.title) {
      slide.addText(slideData.title, {
        x: 0.3,
        y: currentY,
        w: 12,
        h: 1,
        fontSize: 24,
        color: this.colors.navy,
        bold: true,
        fontFace: 'Arial',
        wrap: true
      });
      currentY += 1.2;
    }

    // Subtitle
    if (slideData.subtitle) {
      slide.addText(slideData.subtitle, {
        x: 0.3,
        y: currentY,
        w: 12,
        h: 0.6,
        fontSize: 14,
        color: this.colors.darkGray,
        fontFace: 'Arial',
        wrap: true
      });
      currentY += 0.8;
    }

    // Handle complex content with multiple sections
    if (slideData.hasComplexContent) {
      this.addComplexContent(slide, slideData, currentY);
    } else {
      this.addSimpleContent(slide, slideData, currentY);
    }
  }

  addComplexContent(slide, slideData, startY) {
    let currentY = startY;
    
    // Key points in columns
    if (slideData.keyPoints.length > 0) {
      const colWidth = 12 / Math.min(slideData.keyPoints.length, 3);
      
      slideData.keyPoints.slice(0, 3).forEach((point, index) => {
        const x = 0.3 + (index * colWidth);
        
        // Point title
        if (point.title) {
          slide.addText(point.title, {
            x: x,
            y: currentY,
            w: colWidth - 0.2,
            h: 0.5,
            fontSize: 14,
            color: this.colors.navy,
            bold: true,
            fontFace: 'Arial'
          });
        }
        
        // Point content
        if (point.content.length > 0) {
          const contentText = point.content.slice(0, 6).join('\n');
          slide.addText(contentText, {
            x: x,
            y: currentY + 0.6,
            w: colWidth - 0.2,
            h: 3,
            fontSize: 11,
            color: this.colors.black,
            fontFace: 'Arial',
            valign: 'top'
          });
        }
      });
      currentY += 4;
    }
    
    // Metrics section
    if (slideData.metrics.length > 0) {
      const metricsText = slideData.metrics.map(m => m.combined).join('\n');
      slide.addText(metricsText, {
        x: 8,
        y: startY,
        w: 4.5,
        h: 3,
        fontSize: 12,
        color: this.colors.accent,
        bold: true,
        fontFace: 'Arial',
        fill: { color: this.colors.lightGray },
        valign: 'top'
      });
    }

    // Tables
    if (slideData.tables.length > 0) {
      slideData.tables.forEach((tableData, index) => {
        if (currentY < 6.5) { // Space remaining
          slide.addTable(tableData, {
            x: 0.3,
            y: currentY,
            w: 12,
            fontSize: 9,
            color: this.colors.black,
            fill: { color: this.colors.white },
            border: { pt: 1, color: this.colors.lightGray }
          });
          currentY += 1.5;
        }
      });
    }
  }

  addSimpleContent(slide, slideData, startY) {
    let currentY = startY;
    
    // Main content
    if (slideData.content.length > 0) {
      const contentText = slideData.content.slice(0, 12).join('\n');
      slide.addText(contentText, {
        x: 0.3,
        y: currentY,
        w: 7,
        h: 4.5,
        fontSize: 12,
        color: this.colors.black,
        fontFace: 'Arial',
        valign: 'top'
      });
    }

    // Metrics on the right
    if (slideData.metrics.length > 0) {
      const metricsText = slideData.metrics.map(m => m.combined).join('\n\n');
      slide.addText(metricsText, {
        x: 8,
        y: currentY,
        w: 4.5,
        h: 4.5,
        fontSize: 14,
        color: this.colors.accent,
        bold: true,
        fontFace: 'Arial',
        fill: { color: this.colors.lightGray },
        valign: 'top'
      });
    }
  }

  async export() {
    try {
      console.log('🔄 Starting enhanced export process...');
      
      const slides = await this.parseHTML();
      
      console.log('📊 Creating enhanced PowerPoint slides...');
      slides.forEach((slideData, index) => {
        console.log(`   🎯 Creating slide ${index + 1}: ${slideData.title.substring(0, 40)}...`);
        this.createEnhancedSlide(slideData);
      });

      const outputPath = path.join(__dirname, 'Carbon_Market_CDP_Presentation_Enhanced.pptx');
      console.log('💾 Saving enhanced PowerPoint file...');
      
      await this.pptx.writeFile({ fileName: outputPath });
      
      console.log('✅ Enhanced PowerPoint export completed successfully!');
      console.log(`📄 Output file: Carbon_Market_CDP_Presentation_Enhanced.pptx`);
      
      const stats = await fs.stat(outputPath);
      const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
      console.log(`📊 File size: ${fileSizeMB} MB`);
      
      return outputPath;
      
    } catch (error) {
      console.error('❌ Enhanced export failed:', error.message);
      throw error;
    }
  }
}

async function main() {
  try {
    const exporter = new EnhancedPowerPointExporter();
    await exporter.export();
    console.log('🎉 Enhanced PowerPoint export completed!');
  } catch (error) {
    console.error('💥 Enhanced export failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = EnhancedPowerPointExporter;