# Home Pantry Recipe App

A simple, elegant web application to track ingredients in your home and get personalized recipe recommendations based on what you have available.

## Features

- **Ingredient Inventory**: Add, edit, delete, and search ingredients
- **Smart Organization**: Categorize by type (vegetables, meat, dairy, etc.) and location (fridge, freezer, pantry, counter)
- **Expiration Tracking**: Set expiration dates and get alerts for items expiring soon
- **Recipe Recommendations**: Get smart recipe suggestions based on available ingredients
- **Deterministic Scoring**: Rule-based recommendation engine (not LLM) for consistent, testable results
- **Recipe Cooking**: Mark recipes as cooked to automatically deduct ingredients from inventory
- **Favorites**: Save your favorite recipes for quick access
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite with Prisma ORM
- **UI Components**: Lucide React Icons

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm/yarn
- SQLite (included with most systems)

### Local Installation

1. **Clone/Navigate to project**:
   ```bash
   cd home-pantry-recipe
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up the database**:
   ```bash
   npx prisma migrate dev --name init
   ```

4. **Seed the database with sample data**:
   ```bash
   npm run seed
   ```
   
   This will create:
   - 22 sample ingredients (tomato, eggs, rice, chicken, salmon, etc.)
   - 20 sample recipes (tomato egg, fried rice, pasta, chicken soup, etc.)

5. **Start the development server**:
   ```bash
   npm run dev
   ```

6. **Open your browser**:
   Navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Main layout with navigation
│   ├── page.tsx                # Dashboard
│   ├── globals.css             # Tailwind styles
│   ├── inventory/
│   │   └── page.tsx            # Ingredient inventory management
│   ├── recipes/
│   │   ├── page.tsx            # Recipe recommendations
│   │   └── [id]/page.tsx       # Recipe detail view
│   ├── favorites/
│   │   └── page.tsx            # Saved recipes
│   ├── settings/
│   │   └── page.tsx            # App settings & info
│   └── api/
│       ├── ingredients/        # Ingredient CRUD endpoints
│       ├── recipes/            # Recipe endpoints
│       ├── recommendations/    # Smart recommendation engine
│       └── favorites/          # Favorite recipe endpoints
├── lib/
│   └── db.ts                   # Prisma client singleton
└── prisma/
    ├── schema.prisma           # Database schema
    └── seed.ts                 # Database seeding script
```

## API Endpoints

### Ingredients
- `GET /api/ingredients` - List all ingredients (with search, filter, sort)
- `POST /api/ingredients` - Create new ingredient
- `PATCH /api/ingredients/[id]` - Update ingredient
- `DELETE /api/ingredients/[id]` - Delete ingredient

**Query Parameters for GET**:
- `search` - Search by ingredient name
- `category` - Filter by category
- `location` - Filter by location
- `sortBy` - Sort by "name" or "expiration"

### Recipes
- `GET /api/recipes` - List all recipes
- `GET /api/recipes/[id]` - Get recipe details

### Recommendations
- `GET /api/recommendations` - Get scored recipe recommendations based on current inventory

**Response includes**:
- `match_score` - Total points for the recipe
- `match_percentage` - Percentage of ingredients available
- `matched_ingredients` - List of available ingredients
- `missing_ingredients` - List of missing ingredients
- `recommendation_reason` - Why this recipe was recommended
- `category` - "can_cook" | "almost_there" | "use_soon"

### Favorites
- `GET /api/favorites` - Get all favorite recipes
- `POST /api/favorites/[id]` - Favorite a recipe
- `DELETE /api/favorites/[id]` - Remove from favorites

### Cook Action
- `POST /api/recipes/[id]/cook` - Mark recipe as cooked and deduct ingredients from inventory

## Recommendation Logic

The scoring system is **rule-based and deterministic**:

| Event | Points |
|-------|--------|
| Key ingredient matched | +20 |
| Normal ingredient matched | +10 |
| Seasoning/condiment matched | +3 |
| Expiring ingredient used | +8 |
| Missing key ingredient | -15 |
| Missing optional ingredient | -5 |

Recipes are grouped into categories:
- **Can Cook Now**: All ingredients available
- **Almost There**: Missing ≤2 ingredients, no missing key ingredients
- **Use Soon**: Others, prioritizes recipes using expiring items

## Database Schema

### Ingredient
- `id` - Unique identifier
- `name` - Ingredient name
- `normalizedName` - Lowercase for matching
- `category` - vegetables, meat, seafood, dairy, grains, condiments, snacks, frozen
- `quantity` - Amount in storage
- `unit` - pcs, g, kg, ml, L, pack, box
- `location` - fridge, freezer, pantry, counter
- `expirationDate` - Optional expiration date
- `notes` - Optional notes
- `createdAt` - Timestamp
- `updatedAt` - Last modified timestamp

### Recipe
- `id` - Unique identifier
- `title` - Recipe name
- `description` - Short description
- `prepTimeMinutes` - Prep time
- `cookTimeMinutes` - Cooking time
- `totalTimeMinutes` - Total time
- `steps` - JSON array of cooking instructions
- `tags` - Comma-separated tags
- `createdAt` - Timestamp
- `updatedAt` - Last modified timestamp

### RecipeIngredient
- Links recipes to required ingredients with quantities
- `isKeyIngredient` - Core ingredients for the recipe
- `isOptional` - Optional additions

### FavoriteRecipe
- Stores user's favorite recipes

### CookedRecipe
- Logs when a recipe was cooked

## Features in Detail

### Smart Recommendations
- Scans your current ingredient inventory
- Scores recipes based on available vs. missing ingredients
- Prioritizes recipes using items that are expiring soon
- Groups results by cookability level

### Ingredient Tracking
- Support for fractional quantities (e.g., 0.5 kg)
- Multiple storage locations
- Optional expiration date tracking
- Full-text search
- Filter by category and location
- Sort by name or expiration date

### Recipe Management
- Add ingredients with quantities and preparation notes
- Mark key ingredients for scoring priority
- Store multi-step cooking instructions
- Tag recipes for easy organization
- Track which recipes you've cooked

## Seed Data

The app comes pre-seeded with:

**Recipes (20 total)**:
- Tomato Egg, Fried Rice, Pasta Carbonara, Chicken Soup
- Stir Fry Vegetables, Beef Noodles, Omelette, Salmon Rice Bowl
- Mushroom Pasta, Simple Fried Chicken, and 10 more

**Ingredients (22 total)**:
- Vegetables: tomato, garlic, onion, broccoli, carrot, green pepper, ginger
- Proteins: egg, chicken breast, salmon, beef
- Pantry: rice, pasta, noodles, oil, salt, pepper, sugar, soy sauce
- Dairy: milk, cheese

This data is designed to immediately demonstrate the app's functionality.

## Troubleshooting

### Database Issues
- If you see database errors, try resetting: `rm prisma/dev.db && npm run seed`
- Ensure `DATABASE_URL` in `.env.local` is correct

### Port Already in Use
- Default port is 3000. Change with: `npm run dev -- -p 3001`

### Missing Dependencies
- If you see module errors: `rm -rf node_modules && npm install`

## Engineering Decisions

1. **SQLite for MVP**: Local database perfect for single-user MVP, no server needed
2. **Prisma ORM**: Type-safe database operations with migrations
3. **Rule-Based Scoring**: Deterministic, testable recommendations (not LLM)
4. **Tailwind CSS**: Fast styling without UI library overhead
5. **Next.js App Router**: Modern, file-based routing with built-in API routes
6. **Client Components**: Used for interactive pages to keep it simple
7. **No authentication**: Single-user MVP, assumes trusted local use
8. **Graceful ingredient deduction**: If quantity goes negative when cooking, just set to 0

## Future Enhancements

- Multi-user support with authentication
- Grocery list generation from missing ingredients
- Recipe scaling based on ingredient availability
- Meal planning calendar
- Nutrition information
- Recipe ratings and reviews
- Import recipes from URLs
- Barcode scanning for ingredients
- Cloud sync across devices

## License

MIT

## Documentation

Complete developer documentation is available in the `docs/` folder:

- **[docs/README.md](docs/README.md)** - Documentation index & quick reference
- **[docs/GETTING_STARTED.md](docs/GETTING_STARTED.md)** - Setup & project overview
- **[docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)** - Code patterns & how to add features
- **[docs/API.md](docs/API.md)** - Complete API reference
- **[docs/DATABASE.md](docs/DATABASE.md)** - Database schema & data model
- **[docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)** - Common issues & fixes

**New to the project?** Start with [docs/GETTING_STARTED.md](docs/GETTING_STARTED.md).

## Support

For issues or feature requests:
1. Check [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) first
2. Search the documentation
3. Create an issue in the project repository

---

**Enjoy organizing your kitchen and discovering new recipes! 🥘**
