# API Reference

Complete documentation of all API endpoints.

## Base URL

```
http://localhost:3000/api
```

## Ingredients API

### GET /api/ingredients

Get all ingredients with optional filtering and sorting.

**Query Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | Search by ingredient name (case-insensitive) |
| `category` | string | Filter by category (vegetables, meat, dairy, etc.) |
| `location` | string | Filter by location (fridge, freezer, pantry, counter) |
| `sortBy` | string | Sort by "name" or "expiration" |

**Example Requests**:

```bash
# Get all ingredients
GET /api/ingredients

# Search for tomato
GET /api/ingredients?search=tomato

# Get all vegetables in the fridge
GET /api/ingredients?category=vegetables&location=fridge

# Get ingredients sorted by expiration date
GET /api/ingredients?sortBy=expiration
```

**Response** (200 OK):

```json
[
  {
    "id": "cmmmwuq2g000113c4wwsi9u19",
    "name": "Rice",
    "normalizedName": "rice",
    "category": "grains",
    "quantity": 2,
    "unit": "kg",
    "location": "pantry",
    "expirationDate": null,
    "notes": null,
    "createdAt": "2026-03-12T03:30:58.552Z",
    "updatedAt": "2026-03-12T03:30:58.552Z"
  },
  ...
]
```

---

### POST /api/ingredients

Create a new ingredient.

**Request Body**:

```json
{
  "name": "Broccoli",
  "category": "vegetables",
  "quantity": 2,
  "unit": "pcs",
  "location": "fridge",
  "expirationDate": "2026-03-20T00:00:00Z",
  "notes": "Fresh from market"
}
```

**Required Fields**: `name`, `quantity`

**Optional Fields**: `category`, `unit`, `location`, `expirationDate`, `notes`

**Default Values**:
- `category`: "vegetables"
- `unit`: "pcs"
- `location`: "fridge"

**Response** (201 Created):

```json
{
  "id": "new-ingredient-id",
  "name": "Broccoli",
  "normalizedName": "broccoli",
  "category": "vegetables",
  "quantity": 2,
  "unit": "pcs",
  "location": "fridge",
  "expirationDate": "2026-03-20T00:00:00Z",
  "notes": "Fresh from market",
  "createdAt": "2026-03-12T03:35:00.000Z",
  "updatedAt": "2026-03-12T03:35:00.000Z"
}
```

**Errors**:

```json
// Missing required field
{ "error": "Name and quantity are required" }

// Server error
{ "error": "Failed to create ingredient" }
```

---

### PATCH /api/ingredients/[id]

Update an existing ingredient.

**URL Parameters**:
- `id` - Ingredient ID

**Request Body** (all fields optional):

```json
{
  "name": "Broccoli (updated)",
  "quantity": 1.5,
  "location": "freezer",
  "expirationDate": "2026-04-01T00:00:00Z"
}
```

**Response** (200 OK):

Returns updated ingredient object.

**Errors**:

```json
// Not found
{ "error": "Ingredient not found" }

// Server error
{ "error": "Failed to update ingredient" }
```

---

### DELETE /api/ingredients/[id]

Delete an ingredient.

**URL Parameters**:
- `id` - Ingredient ID

**Response** (200 OK):

```json
{ "message": "Ingredient deleted successfully" }
```

**Errors**:

```json
// Not found
{ "error": "Ingredient not found" }

// Server error
{ "error": "Failed to delete ingredient" }
```

---

## Recipes API

### GET /api/recipes

Get all recipes with their ingredients.

**Query Parameters**: None

**Response** (200 OK):

```json
[
  {
    "id": "recipe-id-1",
    "title": "Tomato Egg",
    "description": "Simple stir-fried tomato and eggs",
    "prepTimeMinutes": 5,
    "cookTimeMinutes": 10,
    "totalTimeMinutes": 15,
    "steps": "[\"Step 1\", \"Step 2\"]",
    "tags": "quick,easy,chinese",
    "createdAt": "2026-03-12T03:30:58.552Z",
    "updatedAt": "2026-03-12T03:30:58.552Z",
    "ingredients": [
      {
        "id": "ing-1",
        "recipeId": "recipe-id-1",
        "ingredientName": "Tomato",
        "normalizedName": "tomato",
        "quantity": 2,
        "unit": "pcs",
        "isOptional": false,
        "isKeyIngredient": true
      }
    ]
  }
]
```

---

### POST /api/recipes

Create a new recipe.

**Request Body**:

```json
{
  "title": "Pasta Carbonara",
  "description": "Classic Italian pasta",
  "prepTimeMinutes": 5,
  "cookTimeMinutes": 15,
  "totalTimeMinutes": 20,
  "steps": [
    "Boil water and cook pasta",
    "Cook bacon until crispy",
    "Mix eggs with cheese",
    "Combine everything"
  ],
  "tags": "italian,quick",
  "ingredients": [
    {
      "name": "Pasta",
      "quantity": 400,
      "unit": "g",
      "isOptional": false,
      "isKeyIngredient": true
    },
    {
      "name": "Egg",
      "quantity": 3,
      "unit": "pcs",
      "isOptional": false,
      "isKeyIngredient": true
    },
    {
      "name": "Cheese",
      "quantity": 100,
      "unit": "g",
      "isOptional": false,
      "isKeyIngredient": true
    }
  ]
}
```

**Required Fields**: `title`

**Optional Fields**: `description`, `prepTimeMinutes`, `cookTimeMinutes`, `totalTimeMinutes`, `steps`, `tags`, `ingredients`

**Response** (201 Created):

Returns created recipe with generated ID.

---

### GET /api/recipes/[id]

Get a specific recipe by ID.

**URL Parameters**:
- `id` - Recipe ID

**Response** (200 OK):

```json
{
  "id": "recipe-id",
  "title": "Pasta Carbonara",
  "description": "...",
  "ingredients": [...],
  ...
}
```

**Errors**:

```json
{ "error": "Recipe not found" }
```

---

### PATCH /api/recipes/[id]

Update a recipe.

**URL Parameters**:
- `id` - Recipe ID

**Request Body** (all fields optional):

```json
{
  "title": "Updated Recipe Name",
  "prepTimeMinutes": 10,
  "ingredients": [
    {
      "name": "New Ingredient",
      "quantity": 2,
      "unit": "pcs",
      "isOptional": false,
      "isKeyIngredient": true
    }
  ]
}
```

**Note**: If `ingredients` is provided, all old ingredients are replaced with new ones.

**Response** (200 OK):

Returns updated recipe.

---

### DELETE /api/recipes/[id]

Delete a recipe.

**URL Parameters**:
- `id` - Recipe ID

**Response** (200 OK):

```json
{ "message": "Recipe deleted successfully" }
```

---

## Recommendations API

### GET /api/recommendations

Get recipe recommendations based on current inventory.

**Query Parameters**: None

**Response** (200 OK):

```json
[
  {
    "id": "recipe-id",
    "title": "Tomato Egg",
    "description": "Simple stir-fried tomato and eggs",
    "match_score": 45,
    "match_percentage": 100,
    "matched_ingredients": ["Tomato", "Egg"],
    "missing_ingredients": [],
    "recommendation_reason": "Can cook now with your ingredients",
    "category": "can_cook",
    "prepTimeMinutes": 5,
    "cookTimeMinutes": 10,
    "totalTimeMinutes": 15
  },
  {
    "id": "recipe-id-2",
    "title": "Pasta",
    "description": "Simple pasta with tomato sauce",
    "match_score": 30,
    "match_percentage": 75,
    "matched_ingredients": ["Tomato", "Oil"],
    "missing_ingredients": ["Pasta"],
    "recommendation_reason": "Almost there - missing 1 ingredient",
    "category": "almost_there",
    "prepTimeMinutes": 5,
    "cookTimeMinutes": 15,
    "totalTimeMinutes": 20
  }
]
```

**Response Categories**:

| Category | Meaning |
|----------|---------|
| `can_cook` | All ingredients available (100%) |
| `almost_there` | Missing ≤2 ingredients, 75%+ available |
| `use_soon` | Uses expiring ingredients |

**Scoring Logic**:

```
match_score = 0

for each recipe ingredient:
  if ingredient in inventory:
    if expiring: score += 8
    if key ingredient: score += 20
    else: score += 10
  else:
    if key ingredient: score -= 15
    else: score -= 5

match_percentage = (matched_count / total_ingredients) * 100
```

---

## Favorites API

### GET /api/favorites

Get all favorite recipes.

**Response** (200 OK):

```json
[
  {
    "id": "favorite-id",
    "recipeId": "recipe-id",
    "createdAt": "2026-03-12T03:35:00.000Z"
  }
]
```

---

### POST /api/favorites/[id]

Add a recipe to favorites.

**URL Parameters**:
- `id` - Recipe ID

**Request Body**: None (empty body)

**Response** (201 Created):

```json
{
  "id": "favorite-id",
  "recipeId": "recipe-id",
  "createdAt": "2026-03-12T03:35:00.000Z"
}
```

**Errors**:

```json
// Recipe already favorited
{ "error": "Recipe already in favorites" }

// Recipe not found
{ "error": "Recipe not found" }
```

---

### DELETE /api/favorites/[id]

Remove a recipe from favorites.

**URL Parameters**:
- `id` - Recipe ID

**Response** (200 OK):

```json
{ "message": "Removed from favorites" }
```

---

## Cook Action API

### POST /api/recipes/[id]/cook

Mark a recipe as cooked and automatically deduct ingredients from inventory.

**URL Parameters**:
- `id` - Recipe ID

**Request Body**: None

**Behavior**:
- For each ingredient in the recipe, reduces quantity in inventory
- If quantity would go negative, sets it to 0
- Records the cook action in history

**Response** (200 OK):

```json
{
  "message": "Recipe marked as cooked",
  "updatedIngredients": [
    {
      "id": "ingredient-id",
      "name": "Tomato",
      "quantityUsed": 2,
      "newQuantity": 3
    }
  ]
}
```

**Errors**:

```json
// Recipe not found
{ "error": "Recipe not found" }

// No ingredients to deduct
{ "error": "Recipe has no ingredients" }
```

---

## Error Handling

### Standard Error Response

All errors follow this format:

```json
{
  "error": "Description of what went wrong"
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| `200` | Success |
| `201` | Created |
| `400` | Bad request (invalid data) |
| `404` | Not found |
| `500` | Server error |

### Common Errors

**Missing Required Fields**:
```json
{ "error": "Name and quantity are required" }
```

**Not Found**:
```json
{ "error": "Ingredient not found" }
```

**Server Error**:
```json
{ "error": "Failed to fetch ingredients" }
```

---

## Usage Examples

### Example 1: Create an ingredient and then use it in a recipe

```bash
# 1. Create an ingredient
curl -X POST http://localhost:3000/api/ingredients \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Garlic",
    "category": "vegetables",
    "quantity": 5,
    "unit": "pcs",
    "location": "pantry"
  }'

# 2. Create a recipe using it
curl -X POST http://localhost:3000/api/recipes \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Garlic Pasta",
    "ingredients": [
      {
        "name": "Garlic",
        "quantity": 3,
        "unit": "pcs",
        "isKeyIngredient": true
      }
    ]
  }'

# 3. Get recommendations
curl http://localhost:3000/api/recommendations

# 4. Cook the recipe
curl -X POST http://localhost:3000/api/recipes/[recipe-id]/cook
```

### Example 2: Filter ingredients

```bash
# Get all vegetables in the fridge expiring soon
curl "http://localhost:3000/api/ingredients?category=vegetables&location=fridge&sortBy=expiration"
```

### Example 3: Update a recipe

```bash
curl -X PATCH http://localhost:3000/api/recipes/[recipe-id] \
  -H "Content-Type: application/json" \
  -d '{
    "prepTimeMinutes": 10,
    "description": "Updated description"
  }'
```

---

## Rate Limiting

Currently, there is no rate limiting. In production, consider:
- Limiting requests per IP
- Caching expensive computations (recommendations)
- Adding request timeouts

---

## Performance Notes

- Recommendation API scans all recipes and ingredients - cache if slow
- Bulk operations (many ingredients) may be slow - consider pagination
- Database queries are the main bottleneck - consider indexing

---

## Future Endpoints

Potential endpoints for future versions:

```
POST   /api/auth/login           # User login
POST   /api/auth/logout          # User logout
GET    /api/users/[id]/prefs     # User preferences
POST   /api/groceries            # Generate shopping list
GET    /api/recipes/search       # Advanced recipe search
GET    /api/nutrition/[recipe]   # Nutrition info
POST   /api/meal-plan            # Create meal plan
```

---

Check DEVELOPMENT.md for how to extend these APIs.
