# Database Schema & Data Model

Complete guide to the database structure and relationships.

## Database Overview

- **Type**: SQLite
- **Location**: `prisma/dev.db`
- **ORM**: Prisma (provides type-safe access)
- **Schema Definition**: `prisma/schema.prisma`

## Core Tables

### 1. Ingredient

Represents items in your kitchen.

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
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([normalizedName])
  @@index([category])
  @@index([location])
  @@index([expirationDate])
}
```

**Fields Explained**:

| Field | Type | Purpose |
|-------|------|---------|
| `id` | String | Unique identifier (auto-generated) |
| `name` | String | Display name (e.g., "Tomato") |
| `normalizedName` | String | Lowercase version for searching |
| `category` | String | Type (vegetables, meat, dairy, etc.) |
| `quantity` | Float | How much (e.g., 2.5) |
| `unit` | String | Measurement unit (pcs, g, kg, ml, L) |
| `location` | String | Where stored (fridge, freezer, pantry, counter) |
| `expirationDate` | DateTime? | When it expires (optional) |
| `notes` | String? | User notes (optional) |
| `createdAt` | DateTime | When added |
| `updatedAt` | DateTime | Last modified |

**Example Data**:

```sql
id: "cmmmwuq2g000113c4wwsi9u19"
name: "Rice"
normalizedName: "rice"
category: "grains"
quantity: 2
unit: "kg"
location: "pantry"
expirationDate: null
notes: "Basmati rice"
```

**Indexes** (for faster queries):

- `normalizedName` - Speed up searches
- `category` - Speed up filtering by type
- `location` - Speed up filtering by storage location
- `expirationDate` - Speed up sorting by expiration

### 2. Recipe

Cooking instructions with ingredients needed.

```prisma
model Recipe {
  id              String   @id @default(cuid())
  title           String
  description     String?
  prepTimeMinutes Int      @default(0)
  cookTimeMinutes Int      @default(0)
  totalTimeMinutes Int     @default(0)
  steps           String   // JSON array
  tags            String?  // comma-separated
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  ingredients     RecipeIngredient[]
  favorites       FavoriteRecipe[]
  cookedRecords   CookedRecipe[]

  @@index([title])
}
```

**Fields Explained**:

| Field | Type | Purpose |
|-------|------|---------|
| `id` | String | Unique identifier |
| `title` | String | Recipe name |
| `description` | String? | Short summary |
| `prepTimeMinutes` | Int | Prep time |
| `cookTimeMinutes` | Int | Cooking time |
| `totalTimeMinutes` | Int | Total time |
| `steps` | String | JSON array: `["Step 1", "Step 2"]` |
| `tags` | String? | Comma-separated: `"quick,easy,chinese"` |
| `createdAt` | DateTime | When created |
| `updatedAt` | DateTime | Last modified |

**Relationships**:

- `ingredients` - Linked RecipeIngredient records
- `favorites` - Users who favorited this recipe
- `cookedRecords` - History of times cooked

**Example Data**:

```sql
id: "recipe-1"
title: "Tomato Egg"
description: "Simple stir-fried tomato and eggs"
prepTimeMinutes: 5
cookTimeMinutes: 10
totalTimeMinutes: 15
steps: '["Chop tomato", "Beat eggs", "Stir fry"]'
tags: "quick,easy,chinese"
```

### 3. RecipeIngredient

Links recipes to their required ingredients.

```prisma
model RecipeIngredient {
  id              String   @id @default(cuid())
  recipeId        String
  ingredientName  String
  normalizedName  String
  quantity        Float
  unit            String
  isOptional      Boolean  @default(false)
  isKeyIngredient Boolean  @default(false)
  createdAt       DateTime @default(now())

  recipe          Recipe   @relation(fields: [recipeId], references: [id], onDelete: Cascade)

  @@index([recipeId])
  @@index([normalizedName])
}
```

**Why separate table?**

A recipe can have multiple ingredients, and ingredients can be in multiple recipes. This junction table connects them with quantity info.

**Fields Explained**:

| Field | Type | Purpose |
|-------|------|---------|
| `id` | String | Unique identifier |
| `recipeId` | String | Which recipe (foreign key) |
| `ingredientName` | String | Ingredient name (not linked to Ingredient.id) |
| `normalizedName` | String | Lowercase for matching |
| `quantity` | Float | How much needed (e.g., 2) |
| `unit` | String | Measurement unit (pcs, g, kg, etc.) |
| `isOptional` | Boolean | Can skip this ingredient |
| `isKeyIngredient` | Boolean | Core ingredient for scoring |
| `createdAt` | DateTime | When added |

**Example Data**:

```sql
id: "ing-rec-1"
recipeId: "recipe-1"
ingredientName: "Tomato"
normalizedName: "tomato"
quantity: 2
unit: "pcs"
isOptional: false
isKeyIngredient: true
```

**Scoring Impact**:

- `isKeyIngredient: true` → +20 points if available, -15 if missing
- `isKeyIngredient: false` → +10 points if available, -5 if missing
- `isOptional: true` → Doesn't affect score as much

### 4. FavoriteRecipe

Tracks recipes marked as favorites.

```prisma
model FavoriteRecipe {
  id              String   @id @default(cuid())
  recipeId        String
  createdAt       DateTime @default(now())

  recipe          Recipe   @relation(fields: [recipeId], references: [id], onDelete: Cascade)

  @@unique([recipeId])
  @@index([recipeId])
}
```

**Fields**:

| Field | Type | Purpose |
|-------|------|---------|
| `id` | String | Unique record ID |
| `recipeId` | String | Which recipe (foreign key) |
| `createdAt` | DateTime | When favorited |

**Uniqueness**:

The `@@unique([recipeId])` constraint ensures a recipe is only favorited once.

**Example Data**:

```sql
id: "fav-1"
recipeId: "recipe-1"
createdAt: "2026-03-12T03:35:00.000Z"
```

### 5. CookedRecipe

History of when recipes were cooked.

```prisma
model CookedRecipe {
  id              String   @id @default(cuid())
  recipeId        String
  cookedAt        DateTime @default(now())

  recipe          Recipe   @relation(fields: [recipeId], references: [id], onDelete: Cascade)

  @@index([recipeId])
}
```

**Fields**:

| Field | Type | Purpose |
|-------|------|---------|
| `id` | String | Unique record ID |
| `recipeId` | String | Which recipe (foreign key) |
| `cookedAt` | DateTime | When cooked |

**Usage**: Tracks cooking history (for future "recently cooked" features).

**Example Data**:

```sql
id: "cooked-1"
recipeId: "recipe-1"
cookedAt: "2026-03-12T04:00:00.000Z"
```

## Entity Relationships (ERD)

```
┌─────────────────────┐
│    Ingredient       │
├─────────────────────┤
│ id (PK)             │
│ name                │
│ quantity            │
│ category            │
│ location            │
│ expirationDate      │
└─────────────────────┘
         △
         │ (referenced by)
         │
┌─────────────────────────────────┐
│    RecipeIngredient (Junction)  │
├─────────────────────────────────┤
│ id (PK)                         │
│ recipeId (FK) → Recipe.id       │
│ ingredientName                  │
│ quantity                        │
│ unit                            │
│ isOptional                      │
│ isKeyIngredient                 │
└─────────────────────────────────┘
         △
         │ (links to)
         │
┌─────────────────────┐
│      Recipe         │
├─────────────────────┤
│ id (PK)             │
│ title               │
│ description         │
│ prepTimeMinutes     │
│ cookTimeMinutes     │
│ steps (JSON)        │
│ tags                │
└─────────────────────┘
         │
         ├─ (has) → FavoriteRecipe
         └─ (has) → CookedRecipe
```

## Querying Examples

### Prisma ORM Queries

All queries in this app use Prisma. Here are common patterns:

#### Find all ingredients

```typescript
const ingredients = await prisma.ingredient.findMany();
```

#### Find by category

```typescript
const vegetables = await prisma.ingredient.findMany({
  where: {
    category: 'vegetables'
  }
});
```

#### Search by name (case-insensitive)

```typescript
const results = await prisma.ingredient.findMany({
  where: {
    normalizedName: {
      contains: 'tom'  // Finds "tomato"
    }
  }
});
```

#### Find expiring items

```typescript
const now = new Date();
const expiringSoon = await prisma.ingredient.findMany({
  where: {
    expirationDate: {
      gte: now,
      lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)  // Within 7 days
    }
  },
  orderBy: {
    expirationDate: 'asc'
  }
});
```

#### Get recipe with ingredients

```typescript
const recipe = await prisma.recipe.findUnique({
  where: { id: recipeId },
  include: {
    ingredients: true  // Load related RecipeIngredients
  }
});
```

#### Create ingredient

```typescript
const newIngredient = await prisma.ingredient.create({
  data: {
    name: 'Tomato',
    normalizedName: 'tomato',
    category: 'vegetables',
    quantity: 5,
    unit: 'pcs',
    location: 'counter'
  }
});
```

#### Update ingredient

```typescript
const updated = await prisma.ingredient.update({
  where: { id: ingredientId },
  data: {
    quantity: 3  // Only update quantity
  }
});
```

#### Delete with cascade

```typescript
// RecipeIngredients linking this recipe are automatically deleted
const deleted = await prisma.recipe.delete({
  where: { id: recipeId }
});
```

## Data Constraints

### Foreign Keys

- `RecipeIngredient.recipeId` → `Recipe.id`
  - `onDelete: Cascade` - If recipe deleted, delete ingredients
- `FavoriteRecipe.recipeId` → `Recipe.id`
  - `onDelete: Cascade` - If recipe deleted, delete favorite
- `CookedRecipe.recipeId` → `Recipe.id`
  - `onDelete: Cascade` - If recipe deleted, delete history

### Unique Constraints

- `FavoriteRecipe` - Only one favorite record per recipe

### Default Values

- `RecipeIngredient.isOptional` = false (required by default)
- `RecipeIngredient.isKeyIngredient` = false (optional ingredient by default)
- `Recipe.prepTimeMinutes` = 0
- `Recipe.cookTimeMinutes` = 0
- `Recipe.totalTimeMinutes` = 0
- All `createdAt` = current timestamp
- All `updatedAt` = current timestamp

## Categories & Units

### Category Values

```
vegetables  - Vegetables
meat        - Meat
seafood     - Seafood
dairy       - Dairy products
grains      - Grains, rice, pasta
condiments  - Seasonings, sauces
snacks      - Snacks
frozen      - Frozen items
```

### Location Values

```
fridge      - Refrigerator
freezer     - Freezer
pantry      - Pantry/cupboard
counter     - Counter/room temperature
```

### Unit Values

```
pcs         - Pieces
g           - Grams
kg          - Kilograms
ml          - Milliliters
L           - Liters
pack        - Package
box         - Box
```

## Migrations

Database changes are managed via migrations.

### Creating a migration

```bash
# After editing prisma/schema.prisma:
npx prisma migrate dev --name add_feature_name
```

This:
1. Runs the migration (updates database)
2. Generates new Prisma client types

### Existing migrations

Located in `prisma/migrations/` directory.

Each migration:
- Has a timestamp folder
- Contains `migration.sql` with SQL changes
- Is tracked in version control

## Backup & Reset

### Backup

```bash
# Copy the database file
cp prisma/dev.db prisma/dev.db.backup
```

### Reset (WARNING: Deletes all data)

```bash
rm prisma/dev.db
npx prisma migrate dev --name init
npm run seed  # Optional: restore sample data
```

### Export data

```bash
# Use sqlite3 command line
sqlite3 prisma/dev.db "SELECT * FROM Ingredient;" > ingredients_export.csv
```

## Performance Considerations

### Current Indexes

```
Ingredient:
  - normalizedName (for search)
  - category (for filtering)
  - location (for filtering)
  - expirationDate (for sorting)

Recipe:
  - title (for search)

RecipeIngredient:
  - recipeId (for joins)
  - normalizedName (for matching)
```

### Query Performance

For the recommendation engine:
1. Fetches all recipes
2. For each recipe, calculates scores
3. Sorts by score

With 100+ recipes and 100+ ingredients, this is still fast on SQLite.

For optimization:
- Add caching if recommendations slow
- Consider pagination for large lists
- Use `select` to fetch only needed fields

## Future Schema Changes

### Possible additions

```prisma
// User accounts
model User {
  id       String @id @default(cuid())
  email    String @unique
  password String
  recipes  Recipe[]
}

// Nutrition info
model RecipeNutrition {
  recipeId    String
  calories    Int
  protein     Float
  carbs       Float
  fat         Float
  recipe      Recipe @relation(fields: [recipeId], references: [id])
}

// Meal planning
model MealPlan {
  id       String @id @default(cuid())
  date     DateTime
  recipeId String
  recipe   Recipe @relation(fields: [recipeId], references: [id])
}
```

---

See DEVELOPMENT.md for how to add new fields and migrations.
