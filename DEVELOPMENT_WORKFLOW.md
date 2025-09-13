# SmartConnect Server - Development Workflow

## Overview / Vue d'ensemble

This document describes the development workflow for SmartConnect Server using Git branches for environment separation.

Ce document décrit le workflow de développement pour SmartConnect Server en utilisant les branches Git pour séparer les environnements.

## Branch Strategy / Stratégie de branches

### Branches principales / Main Branches

- **`main`** : Production branch - Stable, tested code ready for deployment
- **`dev`** : Development branch - Active development, features, and bug fixes

### Workflow / Flux de travail

```
main (production) ← dev (development)
```

## Development Process / Processus de développement

### 1. Working on Development / Travailler en développement

```bash
# Switch to development branch / Passer à la branche de développement
git checkout dev

# Pull latest changes / Récupérer les dernières modifications
git pull origin dev

# Create feature branch / Créer une branche de fonctionnalité
git checkout -b feature/your-feature-name

# Make your changes / Faire vos modifications
# ... code changes ...

# Commit your changes / Commiter vos modifications
git add .
git commit -m "feat: add new feature description"

# Push feature branch / Pousser la branche de fonctionnalité
git push origin feature/your-feature-name
```

### 2. Merging to Development / Fusionner vers le développement

```bash
# Switch to dev branch / Passer à la branche dev
git checkout dev

# Merge feature branch / Fusionner la branche de fonctionnalité
git merge feature/your-feature-name

# Push to dev / Pousser vers dev
git push origin dev

# Delete feature branch / Supprimer la branche de fonctionnalité
git branch -d feature/your-feature-name
git push origin --delete feature/your-feature-name
```

### 3. Deploying to Production / Déployer en production

```bash
# Switch to main branch / Passer à la branche main
git checkout main

# Pull latest changes / Récupérer les dernières modifications
git pull origin main

# Merge dev branch / Fusionner la branche dev
git merge dev

# Push to main / Pousser vers main
git push origin main

# Tag the release / Tagger la release
git tag -a v0.0.18 -m "Release version 0.0.18"
git push origin v0.0.18
```

## Environment Configuration / Configuration des environnements

### Development Environment / Environnement de développement

- **Branch**: `dev`
- **Database**: Development database
- **Log Level**: `debug`
- **Hot Reload**: Enabled
- **CORS**: Local development origins

### Production Environment / Environnement de production

- **Branch**: `main`
- **Database**: Production database
- **Log Level**: `info` or `warn`
- **Hot Reload**: Disabled
- **CORS**: Production origins only

## Scripts Available / Scripts disponibles

### Development Scripts / Scripts de développement

```bash
# Start development server / Démarrer le serveur de développement
npm run dev

# Start with hot module replacement / Démarrer avec remplacement de module à chaud
npm run dev:hmr

# Start with file watching / Démarrer avec surveillance de fichiers
npm run dev:watch

# Run tests in development / Exécuter les tests en développement
npm run test:dev

# Run migrations in development / Exécuter les migrations en développement
npm run migrate:dev

# Seed database in development / Peupler la base de données en développement
npm run seed:dev

# Fresh migration with seed in development / Migration fraîche avec données en développement
npm run fresh:dev
```

### Production Scripts / Scripts de production

```bash
# Build for production / Construire pour la production
npm run build:prod

# Start production server / Démarrer le serveur de production
npm run start:prod

# Run migrations in production / Exécuter les migrations en production
npm run migrate:prod
```

## Best Practices / Bonnes pratiques

### Git Commit Messages / Messages de commit Git

Use conventional commit format / Utiliser le format de commit conventionnel :

```
feat: add new feature
fix: fix bug description
docs: update documentation
style: formatting changes
refactor: code refactoring
test: add or update tests
chore: maintenance tasks
```

### Code Quality / Qualité du code

```bash
# Run linting / Exécuter le linting
npm run lint

# Format code / Formater le code
npm run format

# Type checking / Vérification de types
npm run typecheck
```

### Testing / Tests

```bash
# Run all tests / Exécuter tous les tests
npm run test

# Run tests in development mode / Exécuter les tests en mode développement
npm run test:dev
```

## Deployment Checklist / Liste de vérification de déploiement

Before merging `dev` to `main` / Avant de fusionner `dev` vers `main` :

- [ ] All tests pass / Tous les tests passent
- [ ] Code is linted and formatted / Le code est linté et formaté
- [ ] TypeScript compilation successful / Compilation TypeScript réussie
- [ ] Manual testing completed / Tests manuels terminés
- [ ] Database migrations tested / Migrations de base de données testées
- [ ] Environment variables configured / Variables d'environnement configurées
- [ ] Documentation updated / Documentation mise à jour
- [ ] Version number incremented / Numéro de version incrémenté

## Emergency Procedures / Procédures d'urgence

### Hotfix in Production / Correction urgente en production

```bash
# Create hotfix branch from main / Créer une branche de correction depuis main
git checkout main
git checkout -b hotfix/urgent-fix

# Make minimal fix / Faire une correction minimale
# ... minimal changes ...

# Commit and push / Commiter et pousser
git add .
git commit -m "hotfix: urgent fix description"
git push origin hotfix/urgent-fix

# Merge to main / Fusionner vers main
git checkout main
git merge hotfix/urgent-fix
git push origin main

# Merge back to dev / Fusionner vers dev
git checkout dev
git merge main
git push origin dev

# Delete hotfix branch / Supprimer la branche de correction
git branch -d hotfix/urgent-fix
git push origin --delete hotfix/urgent-fix
```

## Environment Variables / Variables d'environnement

### Development / Développement

Create `.env.development` file / Créer le fichier `.env.development` :

```env
NODE_ENV=development
PORT=3333
HOST=localhost
APP_KEY=your-development-app-key
LOG_LEVEL=debug
DB_HOST=localhost
DB_PORT=5432
DB_USER=smartconnect_dev
DB_PASSWORD=dev_password
DB_DATABASE=smartconnect_dev
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Production / Production

Create `.env.production` file / Créer le fichier `.env.production` :

```env
NODE_ENV=production
PORT=3333
HOST=0.0.0.0
APP_KEY=your-production-app-key
LOG_LEVEL=info
DB_HOST=your-production-db-host
DB_PORT=5432
DB_USER=smartconnect_prod
DB_PASSWORD=your-secure-password
DB_DATABASE=smartconnect_prod
CORS_ORIGINS=https://your-frontend-domain.com
```

## Support / Support

For questions about this workflow, please refer to:
- AdonisJS Documentation: https://docs.adonisjs.com/
- Git Documentation: https://git-scm.com/doc

Pour des questions sur ce workflow, veuillez consulter :
- Documentation AdonisJS : https://docs.adonisjs.com/
- Documentation Git : https://git-scm.com/doc
