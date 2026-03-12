-- CreateTable
CREATE TABLE "Ingredient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "unit" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "expirationDate" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Recipe" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "prepTimeMinutes" INTEGER NOT NULL DEFAULT 0,
    "cookTimeMinutes" INTEGER NOT NULL DEFAULT 0,
    "totalTimeMinutes" INTEGER NOT NULL DEFAULT 0,
    "steps" TEXT NOT NULL,
    "tags" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RecipeIngredient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recipeId" TEXT NOT NULL,
    "ingredientName" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "unit" TEXT NOT NULL,
    "isOptional" BOOLEAN NOT NULL DEFAULT false,
    "isKeyIngredient" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RecipeIngredient_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FavoriteRecipe" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recipeId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FavoriteRecipe_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CookedRecipe" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recipeId" TEXT NOT NULL,
    "cookedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CookedRecipe_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Ingredient_normalizedName_idx" ON "Ingredient"("normalizedName");

-- CreateIndex
CREATE INDEX "Ingredient_category_idx" ON "Ingredient"("category");

-- CreateIndex
CREATE INDEX "Ingredient_location_idx" ON "Ingredient"("location");

-- CreateIndex
CREATE INDEX "Ingredient_expirationDate_idx" ON "Ingredient"("expirationDate");

-- CreateIndex
CREATE INDEX "Recipe_title_idx" ON "Recipe"("title");

-- CreateIndex
CREATE INDEX "RecipeIngredient_recipeId_idx" ON "RecipeIngredient"("recipeId");

-- CreateIndex
CREATE INDEX "RecipeIngredient_normalizedName_idx" ON "RecipeIngredient"("normalizedName");

-- CreateIndex
CREATE INDEX "FavoriteRecipe_recipeId_idx" ON "FavoriteRecipe"("recipeId");

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteRecipe_recipeId_key" ON "FavoriteRecipe"("recipeId");

-- CreateIndex
CREATE INDEX "CookedRecipe_recipeId_idx" ON "CookedRecipe"("recipeId");
