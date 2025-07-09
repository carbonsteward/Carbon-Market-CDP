# GitHub Pages Deployment Troubleshooting Guide

## Common Image Display Issues and Solutions

### 🚨 Issue: Images showing as broken/404 on GitHub Pages

**Root Cause**: Images referenced in presentation but not included in GitHub Actions deployment workflow.

**Solution Steps**:
1. **Check the workflow file**: `.github/workflows/deploy-pages.yml`
2. **Add missing images** to the `image_list` variable (line ~61)
3. **Commit and push** changes to trigger automatic deployment

### 🔍 How to Identify Missing Images

**Manual Check**:
```bash
# Search for image references in presentation
grep -o 'src="[^"]*\.\(jpg\|png\|svg\|gif\)' carbon_market_trends_2024_2025_standalone.html
```

**Automated Check**:
- The deployment workflow now auto-detects missing images
- Check GitHub Actions logs for warnings like:
  ```
  🚨 DEPLOYMENT WARNING: Image 'sbti1.jpg' found in presentation but not in deployment list!
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

### 🔧 Deployment Workflow Structure

**Current Image List** (as of last update):
```
icvcm-elets-terminology-comparison.jpg
cumulative-carbon-offset-rankings.jpg
carbon-offset-rankings-2024.jpg
top-buyers-2024.jpg
CarbonFlow.svg
sbti1.jpg
risk1.jpg risk2.jpg risk3.jpg risk4.jpg
safeguard1.jpg safeguard2.jpg safeguard3.jpg
cmiwg.jpg CMIWG2.jpg CMIWG3.jpg
gcc.jpg
pacm.jpg
```

### 📝 Adding New Images Checklist

When adding new images to the presentation:

1. **Add image file** to repository root
2. **Update deployment workflow**:
   ```yaml
   image_list="existing_images.jpg new_image.jpg"
   ```
3. **Use correct path** in HTML:
   ```html
   <img src="new_image.jpg" alt="Description">
   ```
4. **Test locally** before committing
5. **Check GitHub Actions** logs after deployment

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

### 🎯 Key Lessons Learned

1. **Always update deployment workflow** when adding images
2. **GitHub Actions deployment** is separate from repository - files must be explicitly copied
3. **Security-first approach** - only approved files are deployed
4. **Multiple path formats work** - choose the simplest (root directory)
5. **Automated detection** prevents future issues

### 🔄 Future Prevention

- **Pre-commit hooks** could validate image references
- **Automated PR checks** to ensure deployment workflow is updated
- **Image inventory** tracking in repository
- **Regular audits** of presentation vs deployment alignment

---

## Quick Reference

**Add New Image**:
1. Add to repo: `git add new_image.jpg`
2. Update workflow: Add to `image_list` in `deploy-pages.yml`
3. Update HTML: `<img src="new_image.jpg">`
4. Deploy: `git push origin main`

**Check Deployment**:
- GitHub Actions: https://github.com/carbonsteward/Carbon-Market-CDP/actions
- Live Site: https://carbonsteward.github.io/Carbon-Market-CDP/
- Test Page: https://carbonsteward.github.io/Carbon-Market-CDP/image-path-test.html