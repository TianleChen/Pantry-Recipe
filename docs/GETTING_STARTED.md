# Getting Started with Home Pantry Recipe

A complete guide for new developers to understand and work with the project.

## Quick Start (5 minutes)

### 1. Install & Run

```bash
# Navigate to the project directory
cd home-pantry-recipe

# Install dependencies
npm install

# Set up database (creates tables)
npx prisma migrate dev --name init

# Seed with sample data (optional but recommended)
npm run seed

# Start the dev server
npm run dev
```

Open http://localhost:3000 in your browser. You should see the dashboard with data.

### 2. Key Pages

- **Dashboard** (`/`) - Overview of ingredients and recommendations
- **Inventory** (`/inventory`) - Manage your ingredients (add/edit/delete)
- **Recipes** (`/recipes`) - See recommendations and create custom recipes
- **Favorites** (`/favorites`) - Your saved recipes
- **Settings** (`/settings`) - App info and tips

## Project Overview

### What is this app?

A personal kitchen assistant that:
1. **Tracks** what ingredients you have (and where: fridge/freezer/pantry)
2. **Remembers** expiration dates and warns you
3. **Recommends** recipes based on what you have
4. **Helps** you cook by deducting ingredients automatically

### Why is it useful?

- Never waste food again - see what's expiring
- Get recipe ideas from what you already have
- Organize ingredients by location
- Works offline (local SQLite database)

## Architecture

### Frontend (What you see)

```
React Components (Next.js Client Components)
    ↓
Tailwind CSS Styling
    ↓
HTML/JavaScript in Browser
```

**Pages**:
- `/src/app/page.tsx` - Dashboard
- `/src/app/inventory/page.tsx` - Ingredient CRUD
- `/src/app/recipes/page.tsx` - Recommendations + Recipe CRUD
- `/src/app/favorites/page.tsx` - Saved recipes
- `/src/app/settings/page.tsx` - Settings page

### Backend (What happens behind the scenes)

```
Next.js API Routes (/api/*)
    ↓
Business Logic (Scoring, Recommendations)
    ↓
Prisma ORM
    ↓
SQLite Database (prisma/dev.db)
```

**API Endpoints**:
- `/api/ingredients/` - CRUD operations on ingredients
- `/api/recipes/` - CRUD operations on recipes
- `/api/recommendations/` - Smart scoring engine
- `/api/favorites/` - Save/unsave recipes

### Database

All data is stored in a single SQLite file: `prisma/dev.db`

**Main Tables**:
- `Ingredient` - What you have in your kitchen
- `Recipe` - Available recipes
- `RecipeIngredient` - Links recipes to their ingredients
- `FavoriteRecipe` - Your favorite recipes
- `CookedRecipe` - History of cooked recipes

## File Structure

```
home-pantry-recipe/
├── src/
│   ├── app/
│   │   ├── api/                    # API endpoints
│   │   │   ├── ingredients/        # Ingredient CRUD
│   │   │   ├── recipes/            # Recipe CRUD + recommendations
│   │   │   └── favorites/          # Favorite management
│   │   ├── inventory/              # Ingredient page
│   │   ├── recipes/                # Recipes & recommendations
│   │   ├── favorites/              # Favorites page
│   │   ├── settings/               # Settings page
│   │   ├── [id]/                   # Dynamic routes
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Dashboard
│   │   └── globals.css             # Global styles
│   ├── components/
│   │   └── Navigation.tsx          # Navigation bar
│   └── lib/
│       ├── db.ts                   # Prisma client
│       ├── translations.ts         # i18n (English/Chinese)
│       └── use-language-safe.ts    # Language hook
├── prisma/
│   ├── schema.prisma               # Database schema
│   └── seed.ts                     # Sample data
├── docs/
│   ├── GETTING_STARTED.md          # This file
│   ├── API.md                      # API reference
│   ├── DEVELOPMENT.md              # Dev guide
│   └── DATABASE.md                 # Database schema
├── README.md                       # Project overview
├── package.json                    # Dependencies
└── tsconfig.json                   # TypeScript config
```

## Common Tasks

### Adding a new ingredient type

1. Open `prisma/schema.prisma`
2. Find the `Ingredient` model
3. Add a new field (e.g., `storageType: String`)
4. Run `npx prisma migrate dev --name add_storage_type`
5. Update components to use the new field

### Adding a new recipe category

1. Update seed data in `prisma/seed.ts`
2. Add recipe to `Recipe` table
3. Add ingredients using `RecipeIngredient` links
4. Run `npm run seed`

### Changing the recommendation logic

1. Open `/src/app/api/recommendations/route.ts`
2. Modify the scoring function
3. Adjust point values (KEY_INGREDIENT_POINTS, etc.)
4. Test with `/recipes` page

### Adding translations

1. Open `/src/lib/translations.ts`
2. Add new key to both `en` and `zh` sections
3. Use in components: `t(language, 'key.path')`

## Tech Stack Explained

### Next.js
- Modern React framework
- API routes built-in (no separate backend needed)
- File-based routing (easy to understand)
- Fast server-side rendering

### TypeScript
- Catches bugs before runtime
- Better IDE autocomplete
- Makes refactoring safer

### Tailwind CSS
- Utility-first styling
- No CSS files needed
- Fast styling without writing CSS

### Prisma
- Database ORM (Object-Relational Mapping)
- Type-safe queries
- Automatic migrations

### SQLite
- Serverless database
- Single file (easy to backup)
- Perfect for MVP/single-user apps

## Development Workflow

### 1. Start the dev server

```bash
npm run dev
```

The app reloads automatically when you change files.

### 2. Make a change

Edit a `.tsx` file (e.g., `/src/app/inventory/page.tsx`).

### 3. See the result

Browser reloads automatically. Check the browser console for errors.

### 4. Debug issues

- Check browser console (F12)
- Check terminal where `npm run dev` runs
- Use React DevTools browser extension

### 5. Commit your changes

```bash
git add .
git commit -m "Add feature X"
git push
```

## Understanding the Key Concepts

### Ingredients

**What**: Items in your kitchen (tomato, eggs, milk, etc.)

**Properties**:
- `name` - Display name
- `category` - Type (vegetables, meat, dairy, etc.)
- `quantity` - How much you have (5 pcs, 2 kg, 1 L)
- `location` - Where it's stored (fridge, freezer, pantry, counter)
- `expirationDate` - When it expires (optional)

**Where used**: Inventory page, used in recipe matching

### Recipes

**What**: Cooking instructions with required ingredients

**Properties**:
- `title` - Recipe name
- `description` - Short summary
- `steps` - Cooking instructions (JSON array)
- `ingredients` - What's needed (with quantities)
- `prepTimeMinutes` - Preparation time
- `cookTimeMinutes` - Cooking time

**Where used**: Recipes page, recommendations

### Recommendations

**What**: Scoring system that suggests recipes based on your inventory

**Logic**:
```
For each recipe:
  score = 0
  for each ingredient needed:
    if you have it:
      if it's expiring: score += 8
      if it's key ingredient: score += 20
      else: score += 10
    else:
      if it's key ingredient: score -= 15
      else: score -= 5
  
  if score > threshold:
    show this recipe
```

**Categories**:
- **Can Cook Now** (100% ingredients available)
- **Almost There** (75%+ available, missing ≤2 items)
- **Use Soon** (uses expiring ingredients)

## Next Steps

1. **Explore the code** - Open a file and read it
2. **Make a small change** - Edit a translation or color
3. **Read API.md** - Understand the endpoints
4. **Read DEVELOPMENT.md** - Learn the patterns used
5. **Build a feature** - Add something new!

## Asking for Help

When something doesn't work:

1. **Check the error message** - What does it say?
2. **Check the browser console** - Any red errors?
3. **Check the terminal** - Any errors when you ran `npm run dev`?
4. **Search the code** - Look for similar code patterns
5. **Google the error** - Often someone else had the same issue

## Key Vocabulary

| Term | Meaning |
|------|---------|
| **API** | Backend endpoint that the frontend calls |
| **Component** | A React UI element (reusable piece of interface) |
| **Route** | A URL path (e.g., `/inventory` is a route) |
| **State** | Data that changes during runtime (e.g., ingredient list) |
| **Props** | Data passed to a component |
| **Hook** | Function to add functionality to components (e.g., `useState`) |
| **Middleware** | Code that runs on every request |
| **ORM** | Tool to interact with database (Prisma) |
| **Seeding** | Populating database with sample data |
| **Migration** | Database schema change (version control for DB) |

## Performance Tips

- Database queries are cached when possible
- Images should be optimized
- API routes should be fast (< 200ms)
- Don't make unnecessary API calls

## Security Notes

This is a **local MVP** - no authentication needed. If you add:
- Multi-user support: Add authentication
- Public sharing: Add CORS headers carefully
- Data sync: Use HTTPS only

---

**Ready to code? Check out DEVELOPMENT.md for patterns and examples!**
