# AI Frontend Generation Prompt: Korean Corporate Presentation Design System

## Overview
This prompt enables AI frontend tools (v0, Lovable, Claude Artifacts, etc.) to generate a professional Korean corporate presentation template that matches enterprise-grade design standards used in major Korean corporations and consulting firms.

## Design System Specifications

### 1. Color Palette - Korean Corporate Standard
```css
:root {
  /* Primary Colors */
  --korean-navy: #2C3E50;        /* Main corporate navy blue */
  --korean-black: #1A1A1A;       /* Deep text black */
  --korean-white: #FFFFFF;       /* Pure white backgrounds */
  
  /* Supporting Colors */
  --korean-dark-gray: #505050;   /* Dark secondary text */
  --korean-light-gray: #F8F9FA;  /* Light section backgrounds */
  --korean-border: #E1E5E9;      /* Subtle borders and dividers */
  --korean-accent: #4A90E2;      /* Subtle blue accent for interactions */
  
  /* Status Colors */
  --korean-success: #27AE60;     /* Success/positive indicators */
  --korean-warning: #F39C12;     /* Warning/attention indicators */
  --korean-danger: #E74C3C;      /* Error/negative indicators */
}
```

### 2. Typography System - Korean Corporate Hierarchy
```css
/* Font Stack for Korean/English Support */
font-family: 'Roboto', 'Noto Sans KR', 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif;

/* Typography Hierarchy */
.korean-title {
  font-size: 4rem;           /* Main slide titles */
  font-weight: 700;
  color: var(--korean-white);
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.korean-section-header h2 {
  font-size: 3.5rem;         /* Section headers */
  font-weight: 700;
  color: var(--korean-black);
  border-bottom: 3px solid var(--korean-black);
  padding-bottom: 1.5rem;
  margin-bottom: 3rem;
}

.korean-card h3 {
  font-size: 2.5rem;         /* Card titles */
  font-weight: 700;
  color: var(--korean-black);
  margin-bottom: 1rem;
}

.korean-card h4 {
  font-size: 2rem;           /* Card subtitles */
  font-weight: 600;
  color: var(--korean-dark-gray);
  margin-bottom: 1rem;
}

/* Body text */
body, p, li {
  font-size: 1.6rem;
  line-height: 1.8;
  color: var(--korean-black);
  font-weight: 400;
}
```

### 3. Layout System - Korean Corporate Structure

#### Header Structure
```html
<!-- Consistent header pattern for all slides -->
<div class="korean-section-header">
  <h2>Main Section Title</h2>
  <div class="subtitle">Optional descriptive subtitle</div>
</div>
```

#### Grid System
```css
.korean-grid {
  display: grid;
  gap: 1.5rem;
  margin: 2rem 0;
}

.korean-grid.two-col { grid-template-columns: 1fr 1fr; }
.korean-grid.three-col { grid-template-columns: 1fr 1fr 1fr; }
.korean-grid.four-col { grid-template-columns: repeat(4, 1fr); }
```

### 4. Component System - Korean Professional Cards

#### Standard Content Card
```css
.korean-card {
  background: var(--korean-white);
  border: 1px solid var(--korean-border);
  border-radius: 4px;           /* Minimal rounding for professional look */
  padding: 2rem;
  margin: 1rem 0;
  box-shadow: none;             /* Clean, flat design */
  transition: all 0.2s ease;
}

.korean-card:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  border-color: var(--korean-accent);
}
```

#### Metric Display Cards
```css
.korean-metric {
  text-align: center;
  padding: 2rem 1.5rem;
  background: var(--korean-white);
  border: 1px solid var(--korean-border);
  border-radius: 4px;
}

.korean-metric-value {
  font-size: 4rem;
  font-weight: 700;
  color: var(--korean-black);
  line-height: 1;
  margin-bottom: 0.75rem;
}

.korean-metric-label {
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--korean-dark-gray);
}
```

#### Professional Lists
```css
.korean-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.korean-list li {
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--korean-border);
  position: relative;
  padding-left: 1.5rem;
  font-size: 1.6rem;
  line-height: 1.6;
}

.korean-list li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--korean-dark-gray);
}

.korean-list li:last-child {
  border-bottom: none;
}
```

### 5. Background Sections - Korean Corporate Styling
```css
/* Primary section (navy background for titles) */
.bg-primary {
  background: var(--korean-navy);
  color: var(--korean-white);
  padding: 4rem 0;
}

/* Secondary section (light gray for content) */
.bg-secondary {
  background: var(--korean-light-gray);
  color: var(--korean-black);
  border-top: 1px solid var(--korean-border);
}

/* Content sections */
.bg-content {
  background: var(--korean-white);
  color: var(--korean-black);
}
```

### 6. Status and Indicator System
```css
/* Status badges */
.korean-status {
  display: inline-block;
  padding: 0.4rem 1rem;
  border-radius: 2px;
  font-size: 0.8rem;
  font-weight: 500;
  border: 1px solid var(--korean-border);
}

.korean-status.approved {
  background: var(--korean-white);
  color: var(--korean-success);
  border-color: var(--korean-success);
}

/* Trend indicators */
.trend-up::before { content: "↗ "; color: var(--korean-success); }
.trend-down::before { content: "↘ "; color: var(--korean-danger); }
.trend-stable::before { content: "→ "; color: var(--korean-dark-gray); }
```

### 7. Responsive Design - Mobile Optimization
```css
@media (max-width: 768px) {
  .korean-grid.two-col,
  .korean-grid.three-col,
  .korean-grid.four-col {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .korean-title {
    font-size: 3rem;
    line-height: 1.2;
  }

  .korean-section-header h2 {
    font-size: 2rem;
    line-height: 1.3;
  }

  .korean-card {
    margin: 0.5rem 0;
    padding: 1.5rem;
  }
}
```

### 8. Korean Language Support Requirements
```css
/* Korean text optimization */
body {
  font-family: 'Roboto', 'Noto Sans KR', 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif;
  line-height: 1.8;          /* Optimal for Korean text readability */
  word-break: keep-all;      /* Prevent awkward Korean word breaks */
}

/* Mixed Korean-English content support */
.mixed-content {
  font-feature-settings: "kern" 1;
  text-rendering: optimizeLegibility;
}
```

### 9. Data Visualization Integration
```css
/* Chart and diagram containers */
.korean-chart-container {
  background: var(--korean-white);
  border: 1px solid var(--korean-border);
  border-radius: 4px;
  padding: 2rem;
  margin: 1.5rem 0;
}

/* SVG and Mermaid diagram styling */
.mermaid {
  background: var(--korean-white);
  border-radius: 4px;
}

/* Table styling for data presentation */
table {
  width: 100%;
  border-collapse: collapse;
  margin: 2rem 0;
  background: var(--korean-white);
  border: 1px solid var(--korean-border);
}

table th {
  background: var(--korean-light-gray);
  color: var(--korean-black);
  font-weight: 700;
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid var(--korean-border);
}

table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--korean-border);
  color: var(--korean-black);
}
```

## Implementation Instructions for AI Tools

### For v0.dev / Lovable / Similar Tools:

1. **Create a React component** that implements this design system
2. **Use CSS-in-JS or Tailwind** to implement the Korean corporate color palette
3. **Implement responsive grid system** for multi-column layouts
4. **Add Korean font support** with appropriate fallbacks
5. **Create reusable card components** for consistent content presentation
6. **Implement hover effects** with subtle transitions
7. **Add status indicators** and trend arrows for data presentation

### Example Component Structure:
```jsx
const KoreanCorporateSlide = ({ title, subtitle, children, background = "content" }) => {
  const bgClass = {
    primary: "bg-korean-navy text-white",
    secondary: "bg-korean-light-gray",
    content: "bg-white"
  }[background];

  return (
    <section className={`min-h-screen p-8 ${bgClass}`}>
      <div className="max-w-7xl mx-auto">
        {title && (
          <div className="korean-section-header">
            <h2 className="text-5xl font-bold text-korean-black border-b-4 border-korean-black pb-6 mb-12">
              {title}
            </h2>
            {subtitle && (
              <div className="text-2xl text-korean-black mt-3">
                {subtitle}
              </div>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
};
```

### Key Design Principles:

1. **Clean Minimalism**: Avoid decorative elements, focus on content clarity
2. **High Contrast**: Use strong color contrast for readability
3. **Consistent Spacing**: Maintain uniform padding and margins
4. **Professional Typography**: Clear hierarchy with appropriate font weights
5. **Subtle Interactions**: Minimal hover effects and transitions
6. **Mobile-First**: Ensure responsive design for all screen sizes
7. **Korean Text Optimization**: Proper line-height and font rendering

### Content Structure Patterns:

1. **Title Slide**: Navy background, large white text, minimal content
2. **Section Headers**: Clean borders, hierarchical typography
3. **Multi-column Content**: Grid-based layouts with consistent card styling
4. **Data Presentation**: Metric cards, status indicators, trend arrows
5. **Conclusion Slides**: Summary cards with key takeaways

This design system creates professional presentations that match the aesthetic standards of major Korean corporations and consulting firms, ensuring cultural appropriateness and business-grade visual impact.