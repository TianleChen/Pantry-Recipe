# Documentation Index

Welcome! This folder contains complete documentation for the Home Pantry Recipe app. Choose your starting point below.

## 🚀 Quick Start (5 minutes)

**New to the project?** Start here.

📖 **[GETTING_STARTED.md](./GETTING_STARTED.md)**
- Installation & setup
- Project overview
- Key concepts
- Common tasks

---

## 📚 Full Documentation

### For Users

**[../README.md](../README.md)**
- Features overview
- How to use the app
- Troubleshooting

### For Developers

**[DEVELOPMENT.md](./DEVELOPMENT.md)** - How to code and extend
- Code patterns used
- Adding features step-by-step
- Testing & debugging
- Performance tips
- Code style guide

**[API.md](./API.md)** - All API endpoints
- Ingredients CRUD
- Recipes CRUD
- Recommendations
- Favorites
- Example requests/responses

**[DATABASE.md](./DATABASE.md)** - Data model & schema
- Table descriptions
- Field explanations
- Relationships
- Query examples
- Migrations

**[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Fix common issues
- Installation problems
- Database issues
- Server issues
- Frontend issues
- API issues
- Debugging checklist

---

## 🎯 Find What You Need

### "I want to..."

#### ...understand the project
→ Start with [GETTING_STARTED.md](./GETTING_STARTED.md)

#### ...set up locally
→ See **Quick Start** section in [GETTING_STARTED.md](./GETTING_STARTED.md)

#### ...add a new feature
→ Follow examples in [DEVELOPMENT.md](./DEVELOPMENT.md)

#### ...add a database field
→ See "Adding a New Ingredient Field" in [DEVELOPMENT.md](./DEVELOPMENT.md)

#### ...understand the data model
→ Read [DATABASE.md](./DATABASE.md)

#### ...use the API
→ Reference [API.md](./API.md)

#### ...fix an error
→ Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

#### ...add a translation
→ Follow "Adding a New Translation" in [DEVELOPMENT.md](./DEVELOPMENT.md)

#### ...create a new page
→ Follow "Adding a New Page" in [DEVELOPMENT.md](./DEVELOPMENT.md)

#### ...add an API endpoint
→ Follow "Adding a New API Endpoint" in [DEVELOPMENT.md](./DEVELOPMENT.md)

---

## 📖 Documentation Map

```
docs/
├── README.md                    ← You are here
├── GETTING_STARTED.md          (← Start here if new)
├── DEVELOPMENT.md              (Code patterns, how to build features)
├── API.md                       (All endpoints documented)
├── DATABASE.md                  (Schema, relationships, queries)
└── TROUBLESHOOTING.md          (Fix common issues)
```

---

## 💡 Key Concepts

### Architecture

```
Frontend (React + Tailwind)
    ↓
Next.js API Routes
    ↓
Prisma ORM
    ↓
SQLite Database
```

### Database Structure

```
Ingredient ←→ RecipeIngredient ←→ Recipe
            (junction table)
                                    ├→ FavoriteRecipe
                                    └→ CookedRecipe
```

### Recommendation Logic

```
Score each recipe based on:
  ✓ Have ingredient → +10 points
  ✓ Have key ingredient → +20 points
  ✓ Expiring ingredient → +8 points
  ✗ Missing ingredient → -5 points
  ✗ Missing key ingredient → -15 points

Group by: Can Cook Now | Almost There | Use Soon
```

---

## 🛠️ Common Tasks Cheat Sheet

### Start development
```bash
npm install
npx prisma migrate dev --name init
npm run seed
npm run dev
# Open http://localhost:3000
```

### Add a field to ingredient
1. Edit `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name add_field_name`
3. Update API endpoints
4. Update UI components

### Create a new recipe via API
```bash
curl -X POST http://localhost:3000/api/recipes \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Recipe",
    "ingredients": [
      {"name": "Tomato", "quantity": 2, "unit": "pcs", "isKeyIngredient": true}
    ]
  }'
```

### Get recommendations
```bash
curl http://localhost:3000/api/recommendations
```

### Reset database
```bash
rm prisma/dev.db
npx prisma migrate dev --name init
npm run seed
```

### Debug an issue
1. Check browser console (F12)
2. Check terminal output
3. Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

## 📚 Reading Order (by role)

### Product Manager
1. [../README.md](../README.md) - Project overview
2. [GETTING_STARTED.md](./GETTING_STARTED.md) - Key concepts
3. [API.md](./API.md) - What's possible

### Frontend Developer
1. [GETTING_STARTED.md](./GETTING_STARTED.md) - Setup & overview
2. [DEVELOPMENT.md](./DEVELOPMENT.md) - Code patterns
3. [API.md](./API.md) - What endpoints to call
4. [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - When stuck

### Backend Developer
1. [GETTING_STARTED.md](./GETTING_STARTED.md) - Setup & overview
2. [DATABASE.md](./DATABASE.md) - Data model
3. [DEVELOPMENT.md](./DEVELOPMENT.md) - Code patterns
4. [API.md](./API.md) - Endpoint conventions
5. [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - When stuck

### DevOps/Operations
1. [GETTING_STARTED.md](./GETTING_STARTED.md) - Installation
2. [DEVELOPMENT.md](./DEVELOPMENT.md) - Build & deploy
3. [DATABASE.md](./DATABASE.md) - Backup & reset
4. [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues

### QA/Tester
1. [GETTING_STARTED.md](./GETTING_STARTED.md) - Setup
2. [../README.md](../README.md) - Features to test
3. [API.md](./API.md) - Endpoints to test
4. [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues

---

## 🤔 FAQ

**Q: Where's the code?**
A: Main app code is in `src/`, database schema in `prisma/schema.prisma`

**Q: How do I add a feature?**
A: Follow the examples in [DEVELOPMENT.md](./DEVELOPMENT.md)

**Q: How do I report a bug?**
A: Create an issue or check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

**Q: Can I modify the database schema?**
A: Yes, see [DATABASE.md](./DATABASE.md) for how to add/modify tables

**Q: Is there a database admin tool?**
A: Yes, run `npx prisma studio` to open a GUI

**Q: How do I test the API?**
A: Use `curl` or Postman - examples in [API.md](./API.md)

**Q: What's the recommendation algorithm?**
A: Explained in [DATABASE.md](./DATABASE.md) - rule-based scoring system

**Q: Can I add users/authentication?**
A: Not currently - see Future Enhancements in [../README.md](../README.md)

---

## 🚨 When Things Go Wrong

1. **Check this first**: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. **Read the error carefully** - it usually says what's wrong
3. **Check the terminal** where `npm run dev` runs
4. **Check browser console** (F12)
5. **Search the docs** - most answers are here
6. **Google the error** - Stack Overflow usually has answers

---

## 📖 External Resources

- **Next.js Docs**: https://nextjs.org/docs
- **React Docs**: https://react.dev
- **Prisma Docs**: https://www.prisma.io/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **SQLite**: https://sqlite.org/docs.html
- **TypeScript**: https://www.typescriptlang.org/docs

---

## 💬 Contributing

Improvements to documentation:
1. Read the file you want to improve
2. Make your changes
3. Commit with clear message
4. Submit for review

Contributions welcome!

---

## 📝 Notes

- This documentation is for **developers and new contributors**
- For **user guide**, see [../README.md](../README.md)
- All code examples are tested and working
- Keep docs updated when you make code changes

---

## 🎉 You're Ready!

Pick a document above and start exploring. The codebase is well-structured and should be easy to understand.

**Questions?** Start with [GETTING_STARTED.md](./GETTING_STARTED.md) or [TROUBLESHOOTING.md](./TROUBLESHOOTING.md).

Happy coding! 🥘
