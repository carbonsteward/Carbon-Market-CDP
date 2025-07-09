# GitHub Pages Deployment Troubleshooting Guide

## Security-First Deployment Architecture

### 🛡️ Core Principle: Only Presentation Files Deployed

The deployment system now uses a **security-first approach** that automatically:
- Deploys only HTML presentation files and their directly referenced images
- Excludes all complementary materials (PDFs, CSVs, scripts, etc.)
- Dynamically scans HTML files to extract image references
- Validates that all referenced images are successfully deployed

### 🚨 Issue: Images showing as broken/404 on GitHub Pages

**Root Cause**: Images referenced in presentation but missing from repository or not properly scanned.

**Solution Steps**:
1. **Verify image exists** in repository root directory
2. **Check image reference** in HTML uses correct path format
3. **Commit and push** - deployment automatically detects and includes referenced images

### 🔍 How to Identify Missing Images

**Automated Detection**:
- The deployment workflow automatically scans HTML files for image references
- Missing images cause build failures with clear error messages
- Check GitHub Actions logs for detailed scanning results

**Manual Check**:
```bash
# Search for image references in presentation
grep -o 'src="[^"]*\.\(jpg\|png\|svg\|gif\|webp\)' carbon_market_trends_2024_2025_standalone.html
```

### 📋 Image Path Best Practices

**✅ Recommended Path Format**:
```html
<img src="image.jpg" alt="Description">
```

**✅ Alternative Working Formats**:
```html
<img src="./image.jpg" alt="Description">
<img src="images/image.jpg" alt="Description">
```

**❌ Avoid**:
```html
<img src="/image.jpg" alt="Description">  <!-- Absolute paths fail -->
```

### 🔧 New Dynamic Deployment Architecture

**How It Works**:
1. **HTML Scanning**: Automatically scans whitelisted HTML files
2. **Image Extraction**: Extracts all referenced images dynamically
3. **Validation**: Ensures all referenced images exist and are deployed
4. **Security Check**: Prevents deployment of non-presentation files

**No Manual Management Required**:
- No need to maintain static image lists
- Images are automatically included if referenced in HTML
- Unused images are automatically excluded from deployment

### 📝 Adding New Images Checklist

When adding new images to the presentation:

1. **Add image file** to repository root directory
2. **Reference in HTML** using correct path format:
   ```html
   <img src="new_image.jpg" alt="Description">
   ```
3. **Commit and push** - deployment automatically includes the image
4. **Check GitHub Actions** logs for confirmation

### 🚀 Deployment Process

1. **Automatic Trigger**: Push to `main` branch
2. **Build Process**: GitHub Actions copies approved files to `_site/`
3. **Security Check**: Prevents sensitive files from being deployed
4. **Image Validation**: Warns about missing images in deployment vs presentation
5. **Deploy**: Publishes to GitHub Pages

### 🔍 Testing Image Paths

**Test Page**: `image-path-test.html`
- Tests 5 different image path approaches
- Shows which methods work/fail on GitHub Pages
- Provides debugging information

**Test Results Summary**:
- ✅ Root directory (`image.jpg`) - Works
- ✅ Relative path (`./image.jpg`) - Works  
- ✅ Images directory (`images/image.jpg`) - Works
- ❌ Absolute path (`/image.jpg`) - Fails
- ✅ GitHub Raw URL - Works (but not recommended)

### 📞 Emergency Recovery

If images are broken on live site:

1. **Quick Fix**: Add missing images to deployment workflow
2. **Force Deployment**: Use GitHub Actions "Run workflow" manually
3. **Rollback Option**: Revert to previous working commit
4. **Test First**: Use test pages to verify before main deployment

### 🎯 Key Features of Security-First Deployment

1. **Automated Image Detection** - No manual image list management required
2. **Dynamic Scanning** - Only images referenced in HTML are deployed
3. **Comprehensive Security** - Prevents accidental deployment of sensitive files
4. **Build Validation** - Ensures all referenced images are successfully deployed
5. **Zero Configuration** - Just add images to repo and reference in HTML

### 🔄 Security Benefits

- **Minimal Attack Surface** - Only presentation files and referenced images deployed
- **No Sensitive Data Exposure** - PDFs, CSVs, scripts automatically excluded
- **Automated Validation** - Build fails if security checks don't pass
- **Clear Error Messages** - Detailed feedback for troubleshooting

---

## Quick Reference

**Add New Image**:
1. Add to repo: `git add new_image.jpg`
2. Reference in HTML: `<img src="new_image.jpg">`
3. Deploy: `git push origin main`

**Security-First Deployment**:
- Only HTML presentations and referenced images deployed
- All complementary materials (PDFs, CSVs, scripts) automatically excluded
- Dynamic scanning ensures no unused images are deployed
- Comprehensive security validation prevents sensitive file exposure

**Check Deployment**:
- GitHub Actions: https://github.com/carbonsteward/Carbon-Market-CDP/actions
- Live Site: https://carbonsteward.github.io/Carbon-Market-CDP/