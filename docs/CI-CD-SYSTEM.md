# 🚀 Mars Rover CI/CD System

Ce document décrit le système CI/CD complet mis en place pour le projet Mars Rover, incluant les pipelines locaux et GitHub Actions.

## 📋 Vue d'ensemble

Le système CI/CD valide que les deux applications se compilent correctement, que les tests passent, et effectue diverses vérifications de qualité.

### 🏗️ Architecture du Pipeline

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Dependencies   │───▶│     Build       │───▶│     Tests       │
│   Installation  │    │   TypeScript    │    │   Unit Tests    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    Deploy       │◀───│    Quality      │◀───│  Integration    │
│   (Production)  │    │    Checks       │    │     Tests       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Composants du Système

### 1. Pipeline Local (`ci-cd-pipeline.js`)

Pipeline complet avec toutes les étapes de validation :

- ✅ Installation des dépendances (root + applications)
- ✅ Compilation TypeScript des deux applications
- ✅ Exécution des tests unitaires
- ✅ Vérifications de qualité (TypeScript type checking, lint)
- ✅ Tests d'intégration
- ✅ Génération de rapport détaillé

**Usage:**

```bash
npm run ci:pipeline
# ou directement
node tools/ci-cd/ci-cd-pipeline.js
```

### Structure des Fichiers CI/CD

```
tools/
├── ci-cd/
│   ├── ci-cd-pipeline.js      # Pipeline principal
│   ├── ci-cd-local.js         # Pipeline alternatif local
│   └── ci-cd-report.json      # Rapport d'exécution
├── tests/
│   ├── test-new-architecture.js
│   ├── test-simple-validation.js
│   └── test-structured-logging.js
└── .githooks/
    └── pre-commit             # Hook de validation
```

### 2. GitHub Actions (`.github/workflows/ci-cd.yml`)

Workflow automatisé pour les pushes et PRs avec 7 jobs :

1. **Architecture Validation** - Validation structure workspace
2. **Rover Vehicle Build** - Build + tests application rover
3. **Mission Control Build** - Build + tests application contrôle
4. **Integration Tests** - Tests système complets
5. **Performance Tests** - Tests performance (main branch uniquement)
6. **Quality Report** - Génération rapport qualité
7. **Deploy** - Déploiement simulé (main branch uniquement)

### 3. Scripts Package.json

Scripts CI/CD disponibles dans le package.json principal :

```json
{
  "ci:pipeline": "node ci-cd-pipeline.js",
  "ci:install": "Installation de toutes les dépendances",
  "ci:build": "Compilation des deux applications",
  "ci:test": "Exécution des tests unitaires",
  "ci:quality": "Vérifications qualité TypeScript",
  "ci:integration": "Tests d'intégration système",
  "ci:full": "Pipeline complet local"
}
```

### 4. Tests Unitaires

#### Mars Rover Vehicle (`test/rover-engine.test.js`)

- ✅ 10 tests de logique rover
- ✅ Validation calculs position toroïdale
- ✅ Tests détection obstacles
- ✅ Validation commandes et rotations

#### Mars Mission Control (`test/mission-control.test.js`)

- ✅ 10 tests interface contrôle
- ✅ Validation clavier ZQSD français
- ✅ Tests protocole WebSocket
- ✅ Validation interface utilisateur

### 5. Hooks Git (`.githooks/pre-commit`)

Hook pre-commit pour validation automatique :

- 🔨 Compilation des applications
- 🧪 Exécution des tests
- 🔍 Vérification TypeScript
- 📏 Analyse taille des fichiers
- 🚫 Détection console.log

**Installation:**

```bash
git config core.hooksPath .githooks
chmod +x .githooks/pre-commit
```

## ⚡ Utilisation Rapide

### Validation Complète Locale

```bash
# Pipeline complet
npm run ci:full

# Ou étape par étape
npm run ci:install
npm run ci:build
npm run ci:test
npm run ci:quality
npm run ci:integration
```

### Tests Individuels

```bash
# Tests rover
cd applications/mars-rover-vehicle && npm test

# Tests mission control
cd applications/mars-mission-control && npm test

# Tests intégration
npm test
npm run test:discovery
```

### Build Applications

```bash
# Build toutes les applications
npm run ci:build

# Build individuel
npm run build:rover
npm run build:control
```

## 📊 Rapports et Métriques

### Rapport Pipeline Local

Le pipeline génère automatiquement `ci-cd-report.json` avec :

- Durée d'exécution de chaque étape
- Détails des succès/échecs
- Sorties des commandes
- Résumé global du pipeline

### Métriques GitHub Actions

Disponibles dans l'interface GitHub :

- Temps d'exécution par job
- Artefacts de build
- Rapports de qualité
- Logs détaillés

## 🎯 Fonctionnalités Validées

Le système CI/CD valide automatiquement :

### ✅ Architecture

- Structure workspace correcte
- Présence des fichiers critiques
- Configuration package.json valide

### ✅ Build

- Compilation TypeScript sans erreurs
- Génération des artefacts dist/
- Validation fichiers de sortie

### ✅ Tests

- Tests unitaires rover (10 tests)
- Tests unitaires mission control (10 tests)
- Tests intégration système

### ✅ Qualité

- Type checking TypeScript
- Validation structure code
- Vérification dépendances

### ✅ Intégration

- Communication WebSocket
- Système logging structuré
- Architecture distribuée
- Découverte d'obstacles

## 🔧 Configuration

### Variables d'Environnement

```bash
NODE_VERSION=18  # Version Node.js
CI_TIMEOUT=300000  # Timeout 5 minutes
```

### Dépendances Requises

- Node.js >= 18.0.0
- npm >= 8.0.0
- TypeScript >= 5.0.0

## 🚀 Déploiement

### Déploiement Local

```bash
# Préparation artefacts
npm run ci:build

# Validation
npm run ci:quality
npm run ci:integration

# Les artefacts sont dans:
# applications/mars-rover-vehicle/dist/
# applications/mars-mission-control/dist/
```

### Déploiement GitHub Actions

- Déclenchement automatique sur push `main`
- Validation complète avant déploiement
- Génération notes de version
- Artefacts disponibles 7 jours

## 📈 Métriques de Performance

### Temps d'Exécution Typiques

- Pipeline local complet: ~20-30 secondes
- GitHub Actions workflow: ~5-8 minutes
- Build application: ~2 secondes
- Tests unitaires: ~1 seconde

### Optimisations

- Cache npm dans GitHub Actions
- Build parallèle des applications
- Tests d'intégration avec timeout
- Compilation incrémentale disponible

## 🔍 Dépannage

### Erreurs Communes

**"Command timeout"**

```bash
# Augmenter le timeout dans CONFIG
timeout: 600000  // 10 minutes
```

**"Build artifacts missing"**

```bash
# Vérifier compilation
npm run build:rover
npm run build:control
ls -la applications/*/dist/
```

**"Tests failed"**

```bash
# Exécuter tests individuellement
cd applications/mars-rover-vehicle && npm test
cd applications/mars-mission-control && npm test
```

## 📚 Documentation Associée

- [Architecture Système](../README.md)
- [Guide Développement](../docs/development.md)
- [Tests](../docs/testing.md)
- [Déploiement](../docs/deployment.md)

---

**🎯 Objectif:** Garantir la qualité et la fiabilité du système Mars Rover à travers une validation automatisée complète.

**🔄 Maintenance:** Ce système CI/CD est maintenu automatiquement et s'améliore avec chaque commit.
