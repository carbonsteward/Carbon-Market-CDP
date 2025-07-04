#!/usr/bin/env node

const PptxGenJS = require('pptxgenjs');
const fs = require('fs-extra');
const cheerio = require('cheerio');
const path = require('path');

console.log('🚀 Starting PowerPoint export...');

class PowerPointExporter {
  constructor() {
    this.pptx = new PptxGenJS();
    this.setupPresentation();
  }

  setupPresentation() {
    // Set presentation properties
    this.pptx.author = 'Carbon Market Research Team';
    this.pptx.company = 'Carbon Market CDP';
    this.pptx.subject = 'Carbon Market Trends 2024-2025: CDP Questionnaire Insights';
    this.pptx.title = 'Carbon Market Trends 2024-2025';
    
    // Set slide layout to widescreen (16:9)
    this.pptx.layout = 'LAYOUT_WIDE';
    
    console.log('✅ Presentation setup complete');
  }

  async parseHTML() {
    console.log('📄 Reading HTML file...');
    const htmlPath = path.join(__dirname, 'carbon_market_trends_2024_2025_standalone.html');
    const htmlContent = await fs.readFile(htmlPath, 'utf8');
    const $ = cheerio.load(htmlContent);
    
    console.log('🔍 Parsing slides...');
    const slides = [];
    
    $('section').each((index, element) => {
      const $slide = $(element);
      const slideData = this.extractSlideContent($slide, $);
      slides.push(slideData);
      console.log(`   📝 Slide ${index + 1}: ${slideData.title}`);
    });
    
    console.log(`✅ Found ${slides.length} slides`);
    return slides;
  }

  extractSlideContent($slide, $) {
    // Extract title
    const title = $slide.find('h2').first().text().trim() || 
                  $slide.find('h1').first().text().trim() ||
                  `Slide ${$slide.index() + 1}`;
    
    // Extract subtitle
    const subtitle = $slide.find('.subtitle').text().trim();
    
    // Extract main content
    const content = [];
    
    // Extract lists
    $slide.find('li').each((i, li) => {
      const text = $(li).text().trim();
      if (text && text.length > 0) {
        content.push('• ' + text);
      }
    });
    
    // Extract paragraphs if no lists found
    if (content.length === 0) {
      $slide.find('p').each((i, p) => {
        const text = $(p).text().trim();
        if (text && text.length > 0 && !text.startsWith('주목:')) {
          content.push(text);
        }
      });
    }

    // Extract metrics
    const metrics = [];
    $slide.find('.korean-metric').each((i, metric) => {
      const value = $(metric).find('.korean-metric-value').text().trim();
      const label = $(metric).find('.korean-metric-label').text().trim();
      if (value && label) {
        metrics.push(`${value} - ${label}`);
      }
    });

    // Extract images
    const images = [];
    $slide.find('img').each((i, img) => {
      const src = $(img).attr('src');
      const alt = $(img).attr('alt') || 'Image';
      if (src && !src.startsWith('data:') && !src.startsWith('http')) {
        images.push({ src, alt });
      }
    });

    return {
      title,
      subtitle,
      content,
      metrics,
      images,
      index: $slide.index()
    };
  }

  createSlide(slideData) {
    const slide = this.pptx.addSlide();
    
    // Korean Corporate Color Scheme
    const colors = {
      navy: '2C3E50',
      darkGray: '505050',
      lightGray: 'F8F9FA',
      black: '1A1A1A',
      accent: '4A90E2',
      success: '27AE60'
    };

    // Add title
    if (slideData.title) {
      slide.addText(slideData.title, {
        x: 0.5,
        y: 0.5,
        w: 11,
        h: 1,
        fontSize: 28,
        color: colors.navy,
        bold: true,
        fontFace: 'Roboto, Arial, sans-serif'
      });
    }

    // Add subtitle
    if (slideData.subtitle) {
      slide.addText(slideData.subtitle, {
        x: 0.5,
        y: 1.7,
        w: 11,
        h: 0.6,
        fontSize: 16,
        color: colors.darkGray,
        fontFace: 'Roboto, Arial, sans-serif'
      });
    }

    // Add main content
    let yPosition = slideData.subtitle ? 2.5 : 2.0;
    
    if (slideData.content.length > 0) {
      const contentText = slideData.content.slice(0, 8).join('\n'); // Limit to 8 items per slide
      slide.addText(contentText, {
        x: 0.5,
        y: yPosition,
        w: 6,
        h: 4,
        fontSize: 14,
        color: colors.black,
        fontFace: 'Roboto, Arial, sans-serif',
        valign: 'top'
      });
    }

    // Add metrics if available
    if (slideData.metrics.length > 0) {
      const metricsText = slideData.metrics.join('\n');
      slide.addText(metricsText, {
        x: 7,
        y: yPosition,
        w: 4.5,
        h: 4,
        fontSize: 16,
        color: colors.accent,
        bold: true,
        fontFace: 'Roboto, Arial, sans-serif',
        valign: 'top',
        fill: { color: colors.lightGray }
      });
    }

    // Add images if available (basic placeholder)
    if (slideData.images.length > 0) {
      slideData.images.forEach((img, index) => {
        if (index < 2) { // Limit to 2 images per slide
          const imagePath = path.join(__dirname, img.src);
          if (fs.existsSync(imagePath)) {
            try {
              slide.addImage({
                path: imagePath,
                x: 7 + (index * 2.5),
                y: yPosition + 2,
                w: 2,
                h: 1.5
              });
            } catch (error) {
              console.log(`⚠️  Could not add image: ${img.src}`);
            }
          }
        }
      });
    }

    return slide;
  }

  async export() {
    try {
      console.log('🔄 Starting export process...');
      
      // Parse HTML content
      const slides = await this.parseHTML();
      
      // Create PowerPoint slides
      console.log('📊 Creating PowerPoint slides...');
      slides.forEach((slideData, index) => {
        console.log(`   🎯 Creating slide ${index + 1}: ${slideData.title}`);
        this.createSlide(slideData);
      });

      // Save PowerPoint file
      const outputPath = path.join(__dirname, 'Carbon_Market_CDP_Presentation.pptx');
      console.log('💾 Saving PowerPoint file...');
      
      await this.pptx.writeFile({ fileName: outputPath });
      
      console.log('✅ PowerPoint export completed successfully!');
      console.log(`📄 Output file: ${outputPath}`);
      
      // Get file size
      const stats = await fs.stat(outputPath);
      const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
      console.log(`📊 File size: ${fileSizeMB} MB`);
      
      return outputPath;
      
    } catch (error) {
      console.error('❌ Export failed:', error.message);
      throw error;
    }
  }
}

// Run the export
async function main() {
  try {
    const exporter = new PowerPointExporter();
    await exporter.export();
    console.log('🎉 PowerPoint export process completed!');
  } catch (error) {
    console.error('💥 Export process failed:', error);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}

module.exports = PowerPointExporter;