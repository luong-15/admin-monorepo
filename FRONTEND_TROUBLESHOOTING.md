# Frontend Troubleshooting Guide

## Common Issues & Solutions

### 1. Theme Flashing on Page Load
**Symptoms:** White/light background briefly appears before dark mode loads

**Solution Already Applied:**
- Added `bg-background` to `<html>` element
- Added `bg-background text-foreground` to `<body>` element
- CSS variables are properly resolved at page load time

**If issue persists:**
```bash
npm run build
npm run dev
# Clear browser cache (Ctrl+Shift+Delete)
```

---

### 2. Animations Not Working
**Symptoms:** Floating animations, fade-ins, or slide animations don't work

**Solution Already Applied:**
- Added missing `@keyframes float` definition
- Consolidated all animation imports
- Verified animations.css is properly imported

**If issue persists:**
Check that animations.css is imported:
```css
/* In app/globals.css */
@import "../components/animations/animations.css";
```

---

### 3. Sidebar Not Displaying on Mobile
**Symptoms:** Mobile hamburger menu exists but sidebar doesn't slide in

**Solution:**
The sidebar uses CSS transitions and z-index layering. Make sure:
1. TailwindCSS is properly compiled
2. Dark mode is correctly applied
3. Browser DevTools shows the sidebar with proper transform values

**Debug:**
Open DevTools and check:
- Element has `translate-x-0` or `-translate-x-full` class
- `transition-transform duration-300` is applied
- z-index layering (z-50) is correct

---

### 4. Dark Mode Not Persisting
**Symptoms:** Theme preference doesn't save between page reloads

**Solution:**
This is handled by `next-themes` provider in `components/theme-provider.tsx`. If not working:

```bash
# Clear localStorage
localStorage.clear()

# Reload page
```

---

### 5. Build Fails with CSS Errors
**Symptoms:** `npm run build` fails with CSS parsing errors

**Solution Already Applied:**
- Removed invalid `@custom-variant` directive
- Fixed all @keyframes definitions
- Verified Tailwind v4 compatibility

**If issue persists:**
```bash
# Clear build cache
rm -rf .next
npm run build
```

---

### 6. TypeScript Errors in Dev Server
**Symptoms:** TypeScript compilation errors in VS Code

**Solution:**
All TypeScript issues are fixed. If you see new errors:

```bash
# Verify no TypeScript errors
npx tsc --noEmit

# Restart dev server
npm run dev
```

---

### 7. Page Layout Breaks on Resize
**Symptoms:** Layout shifts when resizing browser window

**Solution Already Applied:**
- Responsive grid layout: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- Proper padding and spacing with Tailwind utilities
- Mobile-first design approach

**Debug:**
- Check breakpoint media queries are correct
- Verify no hardcoded pixel widths
- Test with DevTools device emulation

---

### 8. Cards/Components Have Wrong Colors
**Symptoms:** Cards appear with wrong background or text colors

**Solution Already Applied:**
- Extended Tailwind config with CSS variable mappings
- Added color fallbacks for theme system
- Mapped all semantic colors properly

**If issue persists:**
1. Check `styles/design-tokens.css` for color definitions
2. Verify CSS variables are loaded: `var(--background)`, `var(--foreground)`, etc.
3. Check `tailwind.config.ts` for color mappings

---

## Dev Server Issues

### Dev Server Won't Start
```bash
# Kill existing process
pkill -f "next dev"

# Clean cache and restart
rm -rf .next
npm run dev
```

### Port 3000 Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Start dev server
npm run dev
```

### Hot Module Replacement (HMR) Not Working
```bash
# Restart dev server
npm run dev

# If still issues, clear node_modules
rm -rf node_modules
npm install
npm run dev
```

---

## Performance Issues

### Slow Build Times
**Solution:**
- Turbopack should compile in ~5-6 seconds
- If slower, check for large imports
- Verify SSD has enough space

```bash
# Check build time
npm run build
# Look for "Compiled successfully in X.Xs"
```

### High Memory Usage
**Solution:**
```bash
# Monitor memory during build
npm run build

# If excessive, restart Node process
node --max-old-space-size=2048 node_modules/.bin/next build
```

### Slow CSS Loading
**Solution Already Applied:**
- Optimized CSS variable references
- Removed unused animations
- Consolidated import statements

---

## Browser Console Issues

### "Cannot find module" Errors
**Solution:**
Clear browser cache and reload:
1. Open DevTools (F12)
2. Settings → Network → Disable cache (while DevTools open)
3. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

### "CSS Custom Property Not Found"
**Solution Already Applied:**
- All custom properties are defined in `globals.css`
- Fallback values provided in Tailwind config

**If issue persists:**
Check that `:root` CSS variables are loaded:
```css
:root {
  --background: oklch(0.11 0.01 240);
  --foreground: oklch(0.98 0 0);
  /* ... etc */
}
```

---

## Getting Help

If issues persist after these troubleshooting steps:

1. **Check the build log:**
   ```bash
   npm run build 2>&1 | tee build.log
   ```

2. **Check browser console:**
   - F12 → Console tab
   - Look for actual error messages (not warnings)

3. **Clear everything and rebuild:**
   ```bash
   rm -rf .next node_modules
   npm install
   npm run build
   npm run dev
   ```

4. **Verify environment:**
   - Check `.env.development.local` exists
   - Verify Supabase credentials are set
   - Check all required APIs are accessible

---

## Performance Checklist

- [ ] Build time is ~5-6 seconds
- [ ] Dev server starts in ~500ms
- [ ] No CSS errors in build output
- [ ] No TypeScript errors
- [ ] Theme transitions smoothly (no flashing)
- [ ] All pages render without layout shift
- [ ] Mobile responsive layout works
- [ ] Browser console is clean (no errors)

---

**Last Updated:** July 22, 2026
**Status:** ✅ All common issues documented and fixed
