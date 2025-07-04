#!/usr/bin/env node

const PptxGenJS = require('pptxgenjs');
const fs = require('fs-extra');
const cheerio = require('cheerio');
const path = require('path');

console.log('🚀 Starting Professional PowerPoint export...');

class ProfessionalPowerPointExporter {
  constructor() {
    this.pptx = new PptxGenJS();
    this.setupPresentation();
    this.slideIndex = 0;
    
    // Korean Corporate Design System
    this.theme = {
      colors: {
        primary: '2C3E50',      // Korean Navy
        secondary: '505050',    // Dark Gray
        accent: '4A90E2',       // Accent Blue
        success: '27AE60',      // Success Green
        warning: 'F39C12',      // Warning Orange
        light: 'F8F9FA',        // Light Background
        white: 'FFFFFF',        // White
        text: '1A1A1A',         // Text Black
        border: 'E1E5E9'        // Border Gray
      },
      fonts: {
        title: { face: 'Arial', size: 28, bold: true },
        subtitle: { face: 'Arial', size: 16, bold: false },
        heading: { face: 'Arial', size: 18, bold: true },
        body: { face: 'Arial', size: 12, bold: false },
        caption: { face: 'Arial', size: 10, bold: false }
      }
    };
  }

  setupPresentation() {
    this.pptx.author = 'Carbon Market Research Team';
    this.pptx.company = 'Carbon Market CDP';
    this.pptx.subject = 'Carbon Market Trends 2024-2025: CDP Questionnaire Insights';
    this.pptx.title = 'Carbon Market Trends 2024-2025';
    this.pptx.layout = 'LAYOUT_WIDE'; // 16:9 widescreen
    
    console.log('✅ Professional presentation setup complete');
  }

  async parseHTML() {
    console.log('📄 Reading HTML and extracting content...');
    const htmlPath = path.join(__dirname, 'carbon_market_trends_2024_2025_standalone.html');
    const htmlContent = await fs.readFile(htmlPath, 'utf8');
    const $ = cheerio.load(htmlContent);
    
    const slides = [];
    
    $('section').each((index, element) => {
      const $slide = $(element);
      const slideData = this.extractProfessionalContent($slide, $, index);
      slides.push(slideData);
      console.log(`   📝 Slide ${index + 1}: "${slideData.title}"`);
      if (slideData.subtitle) console.log(`      └─ ${slideData.subtitle}`);
    });
    
    console.log(`✅ Successfully extracted content from ${slides.length} slides`);
    return slides;
  }

  extractProfessionalContent($slide, $, index) {
    // Title extraction with multiple fallbacks
    const title = this.cleanText(
      $slide.find('.korean-section-header h2').first().text() ||
      $slide.find('h2').first().text() ||
      $slide.find('h1').first().text() ||
      $slide.find('.korean-title').first().text() ||
      `Slide ${index + 1}`
    );

    // Subtitle extraction
    const subtitle = this.cleanText(
      $slide.find('.korean-section-header .subtitle').text() ||
      $slide.find('.subtitle').text()
    );

    // Content sections extraction
    const contentSections = this.extractContentSections($slide, $);
    
    // Metrics extraction
    const metrics = this.extractDetailedMetrics($slide, $);
    
    // Tables extraction with better formatting
    const tables = this.extractFormattedTables($slide, $);
    
    // Special elements
    const highlights = this.extractHighlights($slide, $);
    const images = this.extractImageInfo($slide, $);

    return {
      title,
      subtitle,
      contentSections,
      metrics,
      tables,
      highlights,
      images,
      index,
      slideType: this.determineSlideType(contentSections, metrics, tables)
    };
  }

  extractContentSections($slide, $) {
    const sections = [];
    
    // Extract structured card content
    $slide.find('.korean-card').each((i, card) => {
      const $card = $(card);
      const sectionTitle = this.cleanText($card.find('h3').first().text());
      const items = [];
      
      // Extract list items
      $card.find('.korean-list li, li').each((j, li) => {
        const text = this.cleanText($(li).text());
        if (text) items.push(text);
      });
      
      // Extract paragraphs if no list items
      if (items.length === 0) {
        $card.find('p').each((j, p) => {
          const text = this.cleanText($(p).text());
          if (text && !text.startsWith('주목:') && !text.startsWith('※')) {
            items.push(text);
          }
        });
      }
      
      if (sectionTitle || items.length > 0) {
        sections.push({
          title: sectionTitle,
          items: items,
          type: 'card'
        });
      }
    });

    // Extract grid content
    $slide.find('.korean-grid > div').each((i, gridItem) => {
      const $item = $(gridItem);
      if (!$item.hasClass('korean-card')) { // Avoid double processing
        const itemTitle = this.cleanText($item.find('h3, h4').first().text());
        const items = [];
        
        $item.find('li').each((j, li) => {
          const text = this.cleanText($(li).text());
          if (text) items.push(text);
        });
        
        if (itemTitle || items.length > 0) {
          sections.push({
            title: itemTitle,
            items: items,
            type: 'grid'
          });
        }
      }
    });

    // Fallback: extract any remaining lists
    if (sections.length === 0) {
      const items = [];
      $slide.find('li').each((i, li) => {
        const text = this.cleanText($(li).text());
        if (text) items.push(text);
      });
      
      if (items.length > 0) {
        sections.push({
          title: '',
          items: items,
          type: 'list'
        });
      }
    }

    return sections;
  }

  extractDetailedMetrics($slide, $) {
    const metrics = [];
    
    $slide.find('.korean-metric, .mckinsey-metric').each((i, metric) => {
      const $metric = $(metric);
      const value = this.cleanText($metric.find('.korean-metric-value, .mckinsey-metric-value').text());
      const label = this.cleanText($metric.find('.korean-metric-label, .mckinsey-metric-label').text());
      
      if (value && label) {
        metrics.push({
          value: value,
          label: label,
          combined: `${value}\n${label}`
        });
      }
    });

    return metrics;
  }

  extractFormattedTables($slide, $) {
    const tables = [];
    
    $slide.find('table').each((i, table) => {
      const tableData = [];
      const $table = $(table);
      
      // Extract headers
      const headers = [];
      $table.find('thead tr th, tr:first-child td').each((j, cell) => {
        headers.push(this.cleanText($(cell).text()));
      });
      
      if (headers.length > 0) {
        tableData.push(headers);
      }
      
      // Extract data rows
      $table.find('tbody tr, tr:not(:first-child)').each((j, row) => {
        const rowData = [];
        $(row).find('td').each((k, cell) => {
          rowData.push(this.cleanText($(cell).text()));
        });
        if (rowData.length > 0) {
          tableData.push(rowData);
        }
      });
      
      if (tableData.length > 0) {
        tables.push({
          data: tableData,
          title: this.cleanText($slide.find('h4, h3').filter((idx, el) => 
            $(el).text().includes('table') || $(el).text().includes('표')
          ).first().text())
        });
      }
    });

    return tables;
  }

  extractHighlights($slide, $) {
    const highlights = [];
    
    $slide.find('.korean-highlight, .highlight').each((i, highlight) => {
      const text = this.cleanText($(highlight).text());
      if (text) {
        highlights.push(text);
      }
    });

    return highlights;
  }

  extractImageInfo($slide, $) {
    const images = [];
    
    $slide.find('img').each((i, img) => {
      const src = $(img).attr('src');
      const alt = $(img).attr('alt') || 'Image';
      
      if (src && !src.startsWith('data:') && !src.startsWith('http')) {
        const imagePath = path.join(__dirname, src);
        if (fs.existsSync(imagePath)) {
          images.push({
            src: imagePath,
            alt: alt,
            title: alt
          });
        }
      }
    });

    return images;
  }

  determineSlideType(sections, metrics, tables) {
    if (tables.length > 0) return 'table';
    if (metrics.length > 3) return 'metrics';
    if (sections.length > 3) return 'multi-section';
    if (sections.length === 1 && sections[0].items.length > 8) return 'detailed-list';
    return 'standard';
  }

  cleanText(text) {
    return text ? text.trim().replace(/\s+/g, ' ').replace(/[•]/g, '').trim() : '';
  }

  createProfessionalSlide(slideData) {
    const slide = this.pptx.addSlide();
    this.slideIndex++;
    
    console.log(`      📄 Creating ${slideData.slideType} slide: ${slideData.title.substring(0, 30)}...`);
    
    // Add slide number
    slide.addText(`${this.slideIndex}`, {
      x: 12.5,
      y: 6.8,
      w: 0.5,
      h: 0.3,
      fontSize: 10,
      color: this.theme.colors.secondary,
      align: 'right',
      fontFace: this.theme.fonts.caption.face
    });

    let currentY = this.addSlideHeader(slide, slideData);
    
    // Route to appropriate slide type handler
    switch (slideData.slideType) {
      case 'table':
        this.createTableSlide(slide, slideData, currentY);
        break;
      case 'metrics':
        this.createMetricsSlide(slide, slideData, currentY);
        break;
      case 'multi-section':
        this.createMultiSectionSlide(slide, slideData, currentY);
        break;
      case 'detailed-list':
        this.createDetailedListSlide(slide, slideData, currentY);
        break;
      default:
        this.createStandardSlide(slide, slideData, currentY);
    }
  }

  addSlideHeader(slide, slideData) {
    let currentY = 0.3;
    
    // Title
    if (slideData.title) {
      slide.addText(slideData.title, {
        x: 0.5,
        y: currentY,
        w: 12,
        h: 1,
        fontSize: this.theme.fonts.title.size,
        color: this.theme.colors.primary,
        bold: this.theme.fonts.title.bold,
        fontFace: this.theme.fonts.title.face,
        wrap: true
      });
      currentY += 1.1;
    }

    // Subtitle
    if (slideData.subtitle) {
      slide.addText(slideData.subtitle, {
        x: 0.5,
        y: currentY,
        w: 12,
        h: 0.6,
        fontSize: this.theme.fonts.subtitle.size,
        color: this.theme.colors.secondary,
        fontFace: this.theme.fonts.subtitle.face,
        wrap: true
      });
      currentY += 0.7;
    }

    return currentY;
  }

  createMultiSectionSlide(slide, slideData, startY) {
    const sections = slideData.contentSections.slice(0, 3); // Max 3 sections
    const colWidth = 12 / sections.length;
    
    sections.forEach((section, index) => {
      const x = 0.5 + (index * colWidth);
      let y = startY;
      
      // Section title
      if (section.title) {
        slide.addText(section.title, {
          x: x,
          y: y,
          w: colWidth - 0.3,
          h: 0.5,
          fontSize: this.theme.fonts.heading.size,
          color: this.theme.colors.primary,
          bold: true,
          fontFace: this.theme.fonts.heading.face
        });
        y += 0.6;
      }
      
      // Section content
      const content = section.items.slice(0, 6).map(item => `• ${item}`).join('\n');
      if (content) {
        slide.addText(content, {
          x: x,
          y: y,
          w: colWidth - 0.3,
          h: 3.5,
          fontSize: this.theme.fonts.body.size,
          color: this.theme.colors.text,
          fontFace: this.theme.fonts.body.face,
          valign: 'top'
        });
      }
    });
    
    // Add metrics on the side if available
    if (slideData.metrics.length > 0) {
      this.addMetricsPanel(slide, slideData.metrics, 9, startY);
    }
  }

  createMetricsSlide(slide, slideData, startY) {
    // Content on left
    if (slideData.contentSections.length > 0) {
      const section = slideData.contentSections[0];
      const content = section.items.slice(0, 8).map(item => `• ${item}`).join('\n');
      
      slide.addText(content, {
        x: 0.5,
        y: startY,
        w: 7,
        h: 4.5,
        fontSize: this.theme.fonts.body.size,
        color: this.theme.colors.text,
        fontFace: this.theme.fonts.body.face,
        valign: 'top'
      });
    }
    
    // Metrics on right
    this.addMetricsPanel(slide, slideData.metrics, 8, startY);
  }

  createTableSlide(slide, slideData, startY) {
    if (slideData.tables.length > 0) {
      const table = slideData.tables[0];
      
      // Table title
      if (table.title) {
        slide.addText(table.title, {
          x: 0.5,
          y: startY,
          w: 12,
          h: 0.5,
          fontSize: this.theme.fonts.heading.size,
          color: this.theme.colors.primary,
          bold: true,
          fontFace: this.theme.fonts.heading.face
        });
        startY += 0.6;
      }
      
      // Table data
      slide.addTable(table.data, {
        x: 0.5,
        y: startY,
        w: 12,
        fontSize: 11,
        color: this.theme.colors.text,
        fill: { color: this.theme.colors.white },
        border: { pt: 1, color: this.theme.colors.border },
        align: 'left',
        valign: 'top'
      });
    }
  }

  createStandardSlide(slide, slideData, startY) {
    let currentY = startY;
    
    // Main content
    if (slideData.contentSections.length > 0) {
      const section = slideData.contentSections[0];
      
      if (section.title) {
        slide.addText(section.title, {
          x: 0.5,
          y: currentY,
          w: 12,
          h: 0.5,
          fontSize: this.theme.fonts.heading.size,
          color: this.theme.colors.primary,
          bold: true,
          fontFace: this.theme.fonts.heading.face
        });
        currentY += 0.6;
      }
      
      const content = section.items.slice(0, 10).map(item => `• ${item}`).join('\n');
      if (content) {
        slide.addText(content, {
          x: 0.5,
          y: currentY,
          w: slideData.metrics.length > 0 ? 7 : 12,
          h: 4,
          fontSize: this.theme.fonts.body.size,
          color: this.theme.colors.text,
          fontFace: this.theme.fonts.body.face,
          valign: 'top'
        });
      }
    }
    
    // Metrics if available
    if (slideData.metrics.length > 0) {
      this.addMetricsPanel(slide, slideData.metrics, 8, startY);
    }
    
    // Highlights
    if (slideData.highlights.length > 0) {
      const highlightText = slideData.highlights.join('\n\n');
      slide.addText(highlightText, {
        x: 0.5,
        y: 5.5,
        w: 12,
        h: 1,
        fontSize: 11,
        color: this.theme.colors.accent,
        fontFace: this.theme.fonts.body.face,
        fill: { color: this.theme.colors.light },
        italic: true
      });
    }
  }

  createDetailedListSlide(slide, slideData, startY) {
    const section = slideData.contentSections[0];
    const items = section.items;
    const midPoint = Math.ceil(items.length / 2);
    
    // Left column
    const leftContent = items.slice(0, midPoint).map(item => `• ${item}`).join('\n');
    slide.addText(leftContent, {
      x: 0.5,
      y: startY,
      w: 5.8,
      h: 4.5,
      fontSize: this.theme.fonts.body.size,
      color: this.theme.colors.text,
      fontFace: this.theme.fonts.body.face,
      valign: 'top'
    });
    
    // Right column
    const rightContent = items.slice(midPoint).map(item => `• ${item}`).join('\n');
    slide.addText(rightContent, {
      x: 6.5,
      y: startY,
      w: 5.8,
      h: 4.5,
      fontSize: this.theme.fonts.body.size,
      color: this.theme.colors.text,
      fontFace: this.theme.fonts.body.face,
      valign: 'top'
    });
  }

  addMetricsPanel(slide, metrics, x, y) {
    const metricsData = metrics.slice(0, 4).map(m => m.combined).join('\n\n');
    
    slide.addText(metricsData, {
      x: x,
      y: y,
      w: 4.5,
      h: 4,
      fontSize: 14,
      color: this.theme.colors.accent,
      bold: true,
      fontFace: this.theme.fonts.body.face,
      fill: { color: this.theme.colors.light },
      valign: 'top',
      align: 'center'
    });
  }

  async export() {
    try {
      console.log('🔄 Starting professional export process...');
      
      const slides = await this.parseHTML();
      
      console.log('📊 Creating professional PowerPoint slides...');
      slides.forEach((slideData) => {
        this.createProfessionalSlide(slideData);
      });

      const outputPath = path.join(__dirname, 'Carbon_Market_CDP_Presentation_Professional.pptx');
      console.log('💾 Saving professional PowerPoint file...');
      
      await this.pptx.writeFile({ fileName: outputPath });
      
      console.log('✅ Professional PowerPoint export completed successfully!');
      console.log(`📄 Output file: Carbon_Market_CDP_Presentation_Professional.pptx`);
      
      const stats = await fs.stat(outputPath);
      const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
      console.log(`📊 File size: ${fileSizeMB} MB`);
      console.log(`📋 Total slides created: ${this.slideIndex}`);
      
      return outputPath;
      
    } catch (error) {
      console.error('❌ Professional export failed:', error.message);
      throw error;
    }
  }
}

async function main() {
  try {
    const exporter = new ProfessionalPowerPointExporter();
    await exporter.export();
    console.log('🎉 Professional PowerPoint export completed successfully!');
  } catch (error) {
    console.error('💥 Professional export failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = ProfessionalPowerPointExporter;