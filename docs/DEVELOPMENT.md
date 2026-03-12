# Development Guide

How to develop features, patterns used, and best practices.

## Code Patterns

### API Route Pattern

All API routes follow this structure:

```typescript
import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request?: NextRequest) {
  try {
    // Your logic here
    const data = await prisma.model.findMany();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Validate input
    if (!body.requiredField) {
      return NextResponse.json(
        { error: 'Required field missing' },
        { status: 400 }
      );
    }
    // Create and return
    const created = await prisma.model.create({
      data: body
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to create' },
      { status: 500 }
    );
  }
}
```

**Key Points**:
- Always wrap in try/catch
- Always return NextResponse with status code
- Validate input before using it
- Log errors for debugging

### Page Component Pattern

All page components follow this structure:

```typescript
'use client';  // Required for client-side interactivity

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useLanguageSafe } from '@/lib/use-language-safe';
import { t } from '@/lib/translations';

export default function MyPage() {
  const language = useLanguageSafe();
  const [data, setData] = useState<Data[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const res = await fetch('/api/endpoint');
      if (res.ok) {
        const data = await res.json();
        setData(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1>{t(language, 'key.title')}</h1>
      {/* Your content */}
    </div>
  );
}
```

**Key Points**:
- Use `'use client'` for client-side state/effects
- Use `force-dynamic` to prevent caching issues
- Always load data in `useEffect`
- Use `useLanguageSafe()` for translations
- Show loading state
- Handle errors gracefully

## Common Tasks

### Task 1: Adding a New Ingredient Field

**Goal**: Add a "brandName" field to ingredients.

1. **Update the database schema** (`prisma/schema.prisma`):

```prisma
model Ingredient {
  id              String   @id @default(cuid())
  name            String
  normalizedName  String
  category        String
  quantity        Float
  unit            String
  location        String
  expirationDate  DateTime?
  notes           String?
  brandName       String?  // <- Add this line
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

2. **Create a migration**:

```bash
npx prisma migrate dev --name add_brand_name
```

3. **Update the API** (`src/app/api/ingredients/route.ts`):

```typescript
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, quantity, brandName, ... } = body;  // Add brandName
    
    const ingredient = await prisma.ingredient.create({
      data: {
        name: name.trim(),
        normalizedName: name.toLowerCase(),
        quantity,
        brandName: brandName?.trim() || null,  // Add this
        ...
      }
    });
    return NextResponse.json(ingredient, { status: 201 });
  } catch (error) { ... }
}
```

4. **Update the UI** (`src/app/inventory/page.tsx`):

```typescript
const [formData, setFormData] = useState({
  name: '',
  brandName: '',  // Add this
  ...
});

// In the form:
<input
  type="text"
  placeholder="Brand name (optional)"
  value={formData.brandName}
  onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
  className="border rounded-lg px-4 py-2"
/>
```

5. **Update display** (in the table or cards):

```typescript
<td>{ing.name} {ing.brandName && `(${ing.brandName})`}</td>
```

### Task 2: Adding a New Translation

**Goal**: Add "Expiring Soon" alert to Chinese.

1. **Open** `src/lib/translations.ts`

2. **Find the English version**:

```typescript
dashboard: {
  expiringAlerts: 'Items Expiring Soon',
  ...
}
```

3. **Add Chinese translation**:

```typescript
dashboard: {
  expiringAlerts: '即将过期的物品',
  ...
}
```

4. **Use in component**:

```typescript
<h2>{t(language, 'dashboard.expiringAlerts')}</h2>
```

5. **Test**:
- Start the app
- Switch to Chinese
- Verify the translation shows

### Task 3: Adding a New API Endpoint

**Goal**: Add endpoint to get ingredients by expiration date.

1. **Create the file** `src/app/api/ingredients/expiring/route.ts`:

```typescript
import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const daysUntilExpire = 7;  // Expiring within 7 days
    const now = new Date();
    const futureDate = new Date(now.getTime() + daysUntilExpire * 24 * 60 * 60 * 1000);

    const expiringIngredients = await prisma.ingredient.findMany({
      where: {
        expirationDate: {
          gte: now,
          lte: futureDate,
        },
      },
      orderBy: {
        expirationDate: 'asc',
      },
    });

    return NextResponse.json(expiringIngredients);
  } catch (error) {
    console.error('GET /api/ingredients/expiring error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expiring ingredients' },
      { status: 500 }
    );
  }
}
```

2. **Use in a component**:

```typescript
useEffect(() => {
  async function loadExpiringItems() {
    const res = await fetch('/api/ingredients/expiring');
    const data = await res.json();
    setExpiringItems(data);
  }
  loadExpiringItems();
}, []);
```

### Task 4: Modifying the Recommendation Scoring

**Goal**: Give more points for expiring items.

1. **Open** `src/app/api/recommendations/route.ts`

2. **Find the scoring constants**:

```typescript
const EXPIRING_INGREDIENT_POINTS = 8;  // <- Change this
const KEY_INGREDIENT_POINTS = 20;
const NORMAL_INGREDIENT_POINTS = 10;
const MISSING_KEY_PENALTY = -15;
const MISSING_OPTIONAL_PENALTY = -5;
```

3. **Adjust the value**:

```typescript
const EXPIRING_INGREDIENT_POINTS = 15;  // Increased from 8
```

4. **Test**:
- Go to `/recipes`
- Items with expiring ingredients should rank higher

### Task 5: Adding a New Page

**Goal**: Add a "Meal Plan" page.

1. **Create the file** `src/app/meal-plan/page.tsx`:

```typescript
'use client';

export const dynamic = 'force-dynamic';

import { useLanguageSafe } from '@/lib/use-language-safe';
import { t } from '@/lib/translations';

export default function MealPlanPage() {
  const language = useLanguageSafe();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">
        {t(language, 'mealPlan.title')}
      </h1>
      <p>Coming soon...</p>
    </div>
  );
}
```

2. **Add to Navigation** (`src/components/Navigation.tsx`):

```typescript
const navItems = {
  en: {
    mealPlan: 'Meal Plan',  // Add this
    ...
  },
  zh: {
    mealPlan: '饮食计划',  // Add this
    ...
  },
};

// In desktop nav:
<Link href="/meal-plan" className="text-gray-700 hover:text-blue-600 font-medium">
  {labels.mealPlan}
</Link>

// In mobile nav:
<Link href="/meal-plan" className="block text-gray-700 hover:text-blue-600 font-medium py-2">
  {labels.mealPlan}
</Link>
```

3. **Add translations** (`src/lib/translations.ts`):

```typescript
mealPlan: {
  title: 'Meal Plan',
  ...
}
```

## Testing

### Manual Testing

1. **Start the app**:
```bash
npm run dev
```

2. **Test in browser**:
- Create an ingredient
- Create a recipe
- Check recommendations
- Switch language

3. **Check console**:
- Open DevTools (F12)
- Look for errors
- Check network requests

### Testing an API Endpoint

```bash
# Test GET
curl http://localhost:3000/api/ingredients

# Test POST
curl -X POST http://localhost:3000/api/ingredients \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","quantity":1}'

# Test with query params
curl "http://localhost:3000/api/ingredients?search=tomato"
```

## Debugging

### Common Issues

**Issue**: Page doesn't reload after code change

**Solution**:
```bash
# Stop npm run dev (Ctrl+C)
# Clear cache:
rm -rf .next
# Restart:
npm run dev
```

**Issue**: Database errors

**Solution**:
```bash
# Reset database
rm prisma/dev.db
npx prisma migrate dev --name init
npm run seed
```

**Issue**: TypeScript errors

**Solution**:
```bash
# Rebuild types
npx prisma generate
```

**Issue**: Ingredients not showing in recipe form

**Solution**:
- Check browser console for fetch errors
- Check `npm run dev` terminal for API errors
- Verify API endpoint exists

### Using React DevTools

1. Install React DevTools browser extension
2. Open DevTools (F12)
3. Go to "Components" tab
4. Find your component
5. See its state and props in real-time

### Console Logging

Add logging to debug:

```typescript
async function loadData() {
  try {
    console.log('Loading data...');  // Log 1
    const res = await fetch('/api/endpoint');
    console.log('Response:', res);   // Log 2
    if (res.ok) {
      const data = await res.json();
      console.log('Data received:', data);  // Log 3
      setData(data);
    }
  } catch (error) {
    console.error('Error:', error);  // Always log errors
  }
}
```

## Performance Optimization

### Query Optimization

```typescript
// Bad: Fetches all data every time
const ingredients = await prisma.ingredient.findMany();

// Good: Only fetch what you need
const ingredients = await prisma.ingredient.findMany({
  where: {
    category: 'vegetables'
  },
  select: {
    id: true,
    name: true,
    quantity: true
  }
});
```

### Memoization

```typescript
// Prevent unnecessary re-renders
import { useMemo } from 'react';

function ExpensiveComponent({ data }) {
  const processed = useMemo(() => {
    return data.map(item => expensiveCalculation(item));
  }, [data]);

  return <div>{processed}</div>;
}
```

### Debouncing Search

```typescript
// Don't search on every keystroke
import { useEffect, useState } from 'react';

function SearchComponent() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);  // Wait 300ms after user stops typing

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (debouncedSearch) {
      // Now fetch results
      fetch(`/api/ingredients?search=${debouncedSearch}`);
    }
  }, [debouncedSearch]);

  return <input value={search} onChange={(e) => setSearch(e.target.value)} />;
}
```

## Code Style

### TypeScript

```typescript
// Use types for clarity
interface Ingredient {
  id: string;
  name: string;
  quantity: number;
}

// Avoid `any`
const ingredient: Ingredient = { ... };  // Good
const ingredient: any = { ... };          // Avoid
```

### Naming

```typescript
// Use descriptive names
const handleDeleteIngredient = () => { ... }  // Good
const delete_ing = () => { ... }              // Bad

// Use full words
const expirationDate = ...;  // Good
const expDate = ...;         // Bad
```

### Comments

```typescript
// Comment WHY, not WHAT
// Good:
// Check if item is expiring within 7 days to prioritize usage
const isExpiringSoon = expirationDate < today.plus(7);

// Bad:
// Add 7 to today
const expireDate = today + 7;
```

### Formatting

- Use 2 spaces for indentation
- Use semicolons
- Use `const` by default
- Use single quotes for strings

## Version Control

### Commit Messages

```bash
# Good commits
git commit -m "Add brand name field to ingredients"
git commit -m "Fix: recipe recommendation scoring"
git commit -m "Improve: mobile navigation performance"

# Bad commits
git commit -m "fixes"
git commit -m "update stuff"
```

### Branches

```bash
# Create a feature branch
git checkout -b feature/meal-planning

# Work on it
git add .
git commit -m "Add meal planning page"

# Merge back to main
git checkout main
git merge feature/meal-planning
```

## Tools & Extensions

### Recommended VS Code Extensions

- **Prettier** - Auto-format code
- **ESLint** - Catch errors
- **Tailwind CSS IntelliSense** - CSS autocomplete
- **Prisma** - Database schema highlighting
- **TypeScript Vue Plugin** - Better TypeScript support

### Package Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm start         # Run production build
npm run seed      # Seed database with sample data
```

## Deployment

### Building for Production

```bash
npm run build    # Creates optimized bundle
npm start        # Runs production server on port 3000
```

### Environment Variables

Create `.env.local` for development:

```
DATABASE_URL="file:./prisma/dev.db"
```

For production, set actual database URL.

## Next Steps

1. **Understand the codebase** - Read through existing components
2. **Make a small change** - Add a field or translation
3. **Create a new endpoint** - Follow the API pattern
4. **Add a new feature** - Use this guide as reference

---

Check API.md for endpoint reference and GETTING_STARTED.md for high-level overview.
