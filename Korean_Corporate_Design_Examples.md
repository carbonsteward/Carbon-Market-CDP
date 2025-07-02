# Korean Corporate Design System - Implementation Examples

## Example 1: Complete Slide Structure

### HTML Structure
```html
<!-- Title Slide -->
<section class="bg-primary">
  <div class="wrap aligncenter">
    <h1 class="korean-title">
      <strong>CDP 문항으로 해석하는 탄소시장 현황 및 트렌드</strong>
    </h1>
    <p class="text-intro">
      2024-2025 주요 변화사항 및 시장 분석
    </p>
  </div>
</section>

<!-- Content Slide -->
<section class="bg-content">
  <div class="wrap korean-font alignleft">
    <div class="korean-section-header">
      <h2>CDP 질문 변경으로 본 마켓 트렌드</h2>
      <div class="subtitle">용어 표준화 및 정의 명확화 과정</div>
    </div>

    <div class="korean-grid two-col">
      <div class="korean-card">
        <h3>용어의 스탠다드화</h3>
        <h4>예) Retirement vs Cancellation</h4>
        <ul class="korean-list">
          <li><strong>2022: C11.2:</strong> "Has your organization originated or purchased any project-based carbon credits within the reporting period?"</li>
          <li><strong>2023: C11.2:</strong> "Has your organization canceled any project-based carbon credits within the reporting year?"</li>
          <li><strong>2025: 7.79:</strong> "Has your organization retired any project-based carbon credits within the reporting year?"</li>
        </ul>
      </div>
      
      <div class="korean-card">
        <h3>프로젝트 기반 크레딧 vs Sectoral 크레딧</h3>
        <h4>cf) sectoral 크레딧은 기업용으로 사용 가능한가?</h4>
        <div class="korean-metric">
          <div class="korean-metric-value trend-up">75%</div>
          <div class="korean-metric-label">시장 선호도 증가</div>
        </div>
      </div>
    </div>
  </div>
</section>
```

## Example 2: Metric Cards Layout

### React Component Example
```jsx
const MetricCard = ({ value, label, trend, change }) => {
  const trendClass = {
    up: 'trend-up',
    down: 'trend-down',
    stable: 'trend-stable'
  }[trend] || '';

  return (
    <div className="korean-metric">
      <div className={`korean-metric-value ${trendClass}`}>
        {value}
      </div>
      <div className="korean-metric-label">
        {label}
      </div>
      {change && (
        <div className={`korean-metric-change ${trend}`}>
          {change}
        </div>
      )}
    </div>
  );
};

// Usage
<div className="korean-grid four-col">
  <MetricCard 
    value="$1.4B" 
    label="시장 규모" 
    trend="up" 
    change="+15%" 
  />
  <MetricCard 
    value="$4.8" 
    label="평균 가격/tCO2e" 
    trend="stable" 
    change="±2%" 
  />
  <MetricCard 
    value="50%" 
    label="고품질 크레딧 비율" 
    trend="up" 
    change="+8%" 
  />
  <MetricCard 
    value="16.3B" 
    label="기업 투자액" 
    trend="up" 
    change="+23%" 
  />
</div>
```

## Example 3: Status Indicators System

### CSS Implementation
```css
/* Status badges with Korean corporate styling */
.korean-status {
  display: inline-block;
  padding: 0.4rem 1rem;
  border-radius: 2px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0;
  border: 1px solid var(--korean-border);
  margin-right: 0.5rem;
}

.korean-status.high-growth {
  background: var(--korean-white);
  color: var(--korean-success);
  border-color: var(--korean-success);
}

.korean-status.stable {
  background: var(--korean-white);
  color: var(--korean-warning);
  border-color: var(--korean-warning);
}

.korean-status.declining {
  background: var(--korean-white);
  color: var(--korean-danger);
  border-color: var(--korean-danger);
}
```

### HTML Usage
```html
<div class="korean-card">
  <h3>
    시장 세분화 현황 
    <span class="korean-status high-growth">성장</span>
  </h3>
  <ul class="korean-list">
    <li>
      <strong>Premium Credits:</strong> 
      <span class="korean-status high-growth">고성장</span>
      $15-50/tCO2e
    </li>
    <li>
      <strong>Standard Credits:</strong> 
      <span class="korean-status stable">안정</span>
      $3-8/tCO2e
    </li>
    <li>
      <strong>Legacy Credits:</strong> 
      <span class="korean-status declining">감소</span>
      $0.5-3/tCO2e
    </li>
  </ul>
</div>
```

## Example 4: Data Visualization Integration

### Chart Container Styling
```css
.korean-chart-container {
  background: var(--korean-white);
  border: 1px solid var(--korean-border);
  border-radius: 4px;
  padding: 2rem;
  margin: 1.5rem 0;
  position: relative;
}

.korean-chart-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, 
    var(--korean-navy) 0%, 
    var(--korean-accent) 100%);
}

.korean-chart-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--korean-black);
  margin-bottom: 1.5rem;
  text-align: center;
}
```

### SVG Chart Example
```html
<div class="korean-chart-container">
  <h3 class="korean-chart-title">탄소시장 생태계 구조도</h3>
  <svg viewBox="0 0 1400 700" style="width: 100%; height: auto;">
    <!-- Chart content with Korean corporate color scheme -->
    <rect width="1400" height="700" fill="#ffffff"/>
    
    <!-- Use Korean corporate colors -->
    <rect x="50" y="140" width="300" height="280" 
          fill="none" stroke="#2C3E50" stroke-width="2"/>
    
    <text x="200" y="120" font-size="24" font-weight="bold" 
          fill="#2C3E50" text-anchor="middle">
      Demand
    </text>
    
    <!-- Additional chart elements... -->
  </svg>
</div>
```

## Example 5: Responsive Breakpoints

### Mobile-First Implementation
```css
/* Base styles (mobile-first) */
.korean-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin: 1rem 0;
}

.korean-card {
  padding: 1.5rem;
  margin: 0.5rem 0;
}

.korean-title {
  font-size: 2.5rem;
  line-height: 1.2;
}

/* Tablet breakpoint */
@media (min-width: 768px) {
  .korean-grid.two-col {
    grid-template-columns: 1fr 1fr;
  }
  
  .korean-card {
    padding: 2rem;
    margin: 1rem 0;
  }
  
  .korean-title {
    font-size: 3.5rem;
  }
}

/* Desktop breakpoint */
@media (min-width: 1024px) {
  .korean-grid.three-col {
    grid-template-columns: 1fr 1fr 1fr;
  }
  
  .korean-grid.four-col {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .korean-title {
    font-size: 4rem;
  }
  
  .korean-section-header h2 {
    font-size: 3.5rem;
  }
}

/* Large desktop */
@media (min-width: 1400px) {
  .wrap {
    max-width: 1400px;
    margin: 0 auto;
    padding: 2rem 2%;
  }
}
```

## Example 6: Korean Typography Optimization

### Font Loading and Fallbacks
```css
/* Optimal Korean font stack */
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Roboto:wght@300;400;500;700&display=swap');

body {
  font-family: 'Roboto', 'Noto Sans KR', 'Malgun Gothic', 'Apple SD Gothic Neo', 'Helvetica Neue', sans-serif;
  
  /* Korean text optimization */
  line-height: 1.8;
  word-break: keep-all;
  overflow-wrap: break-word;
  
  /* Font rendering optimization */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  font-feature-settings: "kern" 1;
}

/* Mixed content handling */
.mixed-korean-english {
  font-variant-numeric: lining-nums;
  letter-spacing: -0.01em;
}

/* Korean headings */
h1, h2, h3, h4, h5, h6 {
  font-family: 'Roboto', 'Noto Sans KR', 'Malgun Gothic', sans-serif;
  font-weight: 700;
  letter-spacing: -0.02em;
  word-break: keep-all;
}
```

## Example 7: Interactive Elements

### Hover Effects and Transitions
```css
/* Subtle Korean corporate interactions */
.korean-card {
  transition: all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1);
  cursor: default;
}

.korean-card:hover {
  transform: none; /* No dramatic movements */
  box-shadow: 0 2px 8px rgba(44, 62, 80, 0.08);
  border-color: var(--korean-accent);
}

/* Button styling */
.korean-button {
  background: var(--korean-navy);
  color: var(--korean-white);
  border: none;
  padding: 1rem 2rem;
  font-size: 1.4rem;
  font-weight: 500;
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.korean-button:hover {
  background: #34495e;
  box-shadow: 0 2px 4px rgba(44, 62, 80, 0.2);
}

.korean-button:active {
  transform: translateY(1px);
}
```

## Example 8: Print Optimization

### PDF Export Styling
```css
@media print {
  /* Optimize for PDF generation */
  body {
    background: white !important;
    color: black !important;
    font-size: 12pt;
    line-height: 1.5;
  }
  
  .korean-section-header {
    page-break-after: avoid;
  }
  
  .korean-card {
    page-break-inside: avoid;
    box-shadow: none !important;
    border: 1px solid #ccc !important;
  }
  
  .korean-grid {
    display: block;
  }
  
  .korean-grid > * {
    margin-bottom: 1rem;
    display: block;
  }
  
  /* Ensure Korean fonts render in PDF */
  * {
    font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif !important;
  }
}
```

These examples demonstrate how to implement the Korean corporate design system across different use cases, ensuring consistency and professional appearance while maintaining cultural appropriateness and technical excellence.