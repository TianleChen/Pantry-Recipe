# Troubleshooting Guide

Common issues and how to fix them.

## Installation Issues

### Issue: `npm install` fails

**Error**: `npm ERR! code E404 Package not found`

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Try again
npm install
```

### Issue: Node version incompatible

**Error**: `npm ERR! Engine "node": "18+"`

**Solution**:
```bash
# Check your Node version
node --version

# If too old, upgrade from nodejs.org
# Then try npm install again
```

### Issue: Prisma client generation failed

**Error**: `Error validating datasource 'db': the URL must start with the protocol`

**Solution**:
```bash
# Check .env.local exists and has DATABASE_URL:
cat .env.local

# Should output:
# DATABASE_URL="file:./prisma/dev.db"

# If missing, create it:
echo 'DATABASE_URL="file:./prisma/dev.db"' > .env.local
```

---

## Database Issues

### Issue: "SQLITE_CANTOPEN" or database lock errors

**Error**: `Error: SQLITE_CANTOPEN: unable to open database file`

**Solution**:
```bash
# Stop npm run dev (Ctrl+C)

# Reset database
rm prisma/dev.db

# Recreate it
npx prisma migrate dev --name init

# Reseed with sample data
npm run seed

# Restart
npm run dev
```

### Issue: Database out of sync with schema

**Error**: `Error: P1000 Authentication failed`

**Solution**:
```bash
# Reset to schema version
npx prisma migrate reset

# Choose 'yes' when prompted to seed database
```

### Issue: Can't see changes in database

**Error**: Data doesn't appear after creating ingredient

**Solution**:
```bash
# Make sure npm run dev is still running
# Try refreshing the page in browser (F5)

# Check browser console for errors:
# Right-click → Inspect → Console tab

# If you see fetch errors, check:
# 1. API endpoint exists
# 2. Try the API directly:
curl http://localhost:3000/api/ingredients

# Verify database has data:
npx prisma studio

# This opens a GUI to explore database
```

---

## Server Issues

### Issue: Port 3000 already in use

**Error**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solution Option 1**: Stop the other process
```bash
# Find what's using port 3000
lsof -i :3000

# Stop it (note the PID from output)
kill -9 <PID>

# Try again
npm run dev
```

**Solution Option 2**: Use different port
```bash
npm run dev -- -p 3001

# Access at http://localhost:3001
```

### Issue: Hot reload not working

**Error**: Page doesn't reload when you edit code

**Solution**:
```bash
# Stop npm run dev (Ctrl+C)

# Clear Next.js cache
rm -rf .next

# Clear node_modules cache
npm cache clean --force

# Restart
npm run dev
```

### Issue: Page shows blank/404

**Error**: Going to `/recipes` shows "not found"

**Solution**:
```bash
# Check the page file exists:
ls src/app/recipes/page.tsx

# If missing, recreate it

# Check for syntax errors:
# Stop server, look at terminal output
# Fix any TypeScript errors

# Restart server
npm run dev
```

---

## Frontend Issues

### Issue: Page doesn't load data

**Error**: Ingredients list is empty, no loading state

**Solution**:
1. **Check browser console** (F12):
   - Look for fetch errors
   - Look for JavaScript errors

2. **Check if API works**:
   ```bash
   curl http://localhost:3000/api/ingredients
   ```
   - Should return JSON array
   - If error, API is broken

3. **Check network tab**:
   - F12 → Network tab
   - Reload page
   - Look for red X on API calls
   - Click them to see error details

### Issue: Chinese text shows as "???"

**Error**: Language switching doesn't work

**Solution**:
```bash
# Check if translation key exists:
cat src/lib/translations.ts | grep "inventory.title"

# If not found, add it to both en and zh sections

# Hard refresh browser (Ctrl+Shift+F5)
# This clears browser cache

# Check localStorage:
# F12 → Application → Local Storage → http://localhost:3000
# Should see 'language' key
```

### Issue: Form doesn't submit

**Error**: Click button, nothing happens

**Solution**:
1. **Check console for errors** (F12 → Console)
   - Often shows what's wrong

2. **Check form validation**:
   ```typescript
   // Add console.log to see what's happening
   async function handleSubmit(e) {
     console.log('Form submitted');
     e.preventDefault();
     console.log('Form data:', formData);
     // ...
   }
   ```

3. **Check required fields**:
   - Click "Add Ingredient" → make sure name is filled
   - Empty fields might cause submission to fail

### Issue: Layout looks broken on mobile

**Error**: Elements overlapping, text too small

**Solution**:
1. **Hard refresh** (Ctrl+Shift+F5)

2. **Check Tailwind classes**:
   - Look for `md:` and `lg:` prefixes
   - These control responsive behavior

3. **Test different screen sizes**:
   - F12 → toggle device toolbar (Ctrl+Shift+M)
   - Test at different widths

---

## API Issues

### Issue: API returns 500 error

**Error**: `{ "error": "Failed to fetch ingredients" }`

**Solution**:
1. **Check terminal** where `npm run dev` runs
   - Look for error message
   - Usually shows what went wrong

2. **Common causes**:
   - Database error → reset database (see above)
   - Missing required field → check request body
   - Invalid ID → verify ID exists

3. **Test with curl**:
   ```bash
   # Simple GET
   curl http://localhost:3000/api/ingredients

   # POST with data
   curl -X POST http://localhost:3000/api/ingredients \
     -H "Content-Type: application/json" \
     -d '{"name":"Test","quantity":1}'
   ```

### Issue: API returns 404

**Error**: `{ "error": "Ingredient not found" }`

**Solution**:
- Verify the ID exists:
  ```bash
  # Get all ingredients to see IDs
  curl http://localhost:3000/api/ingredients

  # Then use correct ID:
  curl http://localhost:3000/api/ingredients/[id-from-above]
  ```

### Issue: API returns 400 (bad request)

**Error**: `{ "error": "Name and quantity are required" }`

**Solution**:
- Check your request body has all required fields:
  ```bash
  # Good request:
  curl -X POST http://localhost:3000/api/ingredients \
    -H "Content-Type: application/json" \
    -d '{"name":"Tomato","quantity":5}'

  # Missing quantity:
  curl -X POST http://localhost:3000/api/ingredients \
    -H "Content-Type: application/json" \
    -d '{"name":"Tomato"}'  # This will fail
  ```

---

## Build Issues

### Issue: `npm run build` fails

**Error**: `error TS1234: TypeScript error`

**Solution**:
```bash
# Fix the TypeScript error shown in output
# Usually missing type annotation or wrong import

# Run build again to see if fixed
npm run build

# If still failing, try:
npx tsc --noEmit  # Check TypeScript errors
```

### Issue: Built app doesn't start

**Error**: Running `npm start` shows errors

**Solution**:
```bash
# Make sure build succeeded
npm run build

# Check for .env.local issues
cat .env.local

# Make sure DATABASE_URL is set

# Try starting again
npm start
```

---

## Data Issues

### Issue: Data from seed is missing

**Error**: Run `npm run seed` but no ingredients show up

**Solution**:
```bash
# Check seed script exists
cat prisma/seed.ts

# Run seed with verbose output
npm run seed

# Watch for any errors

# If it worked, verify data:
curl http://localhost:3000/api/ingredients

# Should return 20+ ingredients

# Or use Prisma Studio:
npx prisma studio
```

### Issue: Can't create ingredients

**Error**: Form submits but no ingredient appears

**Solution**:
1. **Check API endpoint**:
   ```bash
   curl -X POST http://localhost:3000/api/ingredients \
     -H "Content-Type: application/json" \
     -d '{"name":"Test","quantity":1,"unit":"pcs"}'
   ```

2. **Look at browser console** for fetch errors

3. **Check database**:
   ```bash
   npx prisma studio
   # Refresh and look for "Test" ingredient
   ```

---

## Performance Issues

### Issue: App is slow

**Error**: Pages take >5 seconds to load

**Solution**:
1. **Check network** (F12 → Network):
   - See which requests are slow
   - API calls should be <200ms

2. **Common causes**:
   - Database too large → consider pagination
   - Too many recommendations → limit results
   - Unoptimized images → compress them

3. **Debug timing**:
   ```typescript
   async function loadData() {
     const start = performance.now();
     const res = await fetch('/api/ingredients');
     const duration = performance.now() - start;
     console.log(`API took ${duration}ms`);
   }
   ```

### Issue: Recommendations are slow

**Error**: Clicking to `/recipes` page takes 10+ seconds

**Solution**:
- Recommendations loop through all recipes/ingredients
- This is slow with large data sets
- Future: add caching or pagination

For now:
- Work with smaller dataset
- Or optimize recommendation SQL query

---

## Git Issues

### Issue: Can't commit changes

**Error**: `git commit` fails

**Solution**:
```bash
# Check git status
git status

# Stage changes
git add .

# Try commit again with message
git commit -m "Your message here"

# If still failing, check:
# - Enough disk space
# - Git installed correctly
# - .git folder exists in project
```

### Issue: Merge conflicts

**Error**: `CONFLICT (content merge)`

**Solution**:
```bash
# See which files have conflicts
git status

# Open conflicted files and look for:
# <<<<<<< HEAD
# your changes
# =======
# their changes
# >>>>>>> branch-name

# Edit to keep what you want
# Then:
git add .
git commit -m "Resolve conflicts"
```

---

## Debugging Checklist

When something goes wrong:

- [ ] Check browser console (F12)
- [ ] Check terminal where `npm run dev` runs
- [ ] Check network tab (F12 → Network)
- [ ] Try hard refresh (Ctrl+Shift+F5)
- [ ] Try restarting server (stop & `npm run dev`)
- [ ] Check if similar code works elsewhere
- [ ] Use `console.log` to trace execution
- [ ] Use Prisma Studio to check database
- [ ] Use curl to test APIs directly
- [ ] Check the documentation again

## Getting Help

When stuck:

1. **Read the error message carefully**
   - It usually tells you exactly what's wrong

2. **Copy the error and search**
   - Google the error message
   - Often someone else had the same issue

3. **Check the documentation**
   - GETTING_STARTED.md
   - API.md
   - DEVELOPMENT.md

4. **Check the code**
   - Look for similar examples
   - See how other endpoints handle this

5. **Simplify the problem**
   - Try the most basic version first
   - Add features one at a time

---

Still stuck? Check the full documentation in the `docs/` folder or ask for help!
