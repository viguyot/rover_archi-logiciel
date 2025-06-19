# Mars Rover Distribué 🚀

Projet de simulation d'un **Rover spatial** explorant une planète de topologie **toroïdale**, contrôlé à distance via un **réseau TCP**.

## 🏗️ Architecture

Le projet suit une architecture **DDD (Domain-Driven Design)** modérée avec séparation claire des responsabilités :

### 📦 Structure des packages

```
mars-rover/
├── packages/
│   ├── shared/          # Types, enums et interfaces communes
│   ├── core/           # Interfaces du domaine métier
│   └── infra/          # Interfaces d'infrastructure
└── apps/
    ├── rover/          # Serveur TCP du Rover (distant)
    └── mission-control/ # Client console de contrôle
```

### 🧠 Composants principaux

#### **Rover Server** (Serveur TCP distant)

- **IRoverTcpServer** : Écoute TCP sur port configuré
- **ICommandDispatcher** : Aiguillage et traitement des commandes
- **IRoverEngine** : Moteur de simulation avec règles toroïdales
- **IObstacleManager** : Gestion des collisions et obstacles

#### **Mission Control** (Client console local)

- **IMissionControl** : Orchestration principale
- **IRoverService** : Communication TCP avec le rover
- **IMapStateManager** : État local de la carte
- **ICommandParser** : Transformation des commandes clavier

#### **Sécurité**

- **ISecurityService** : Authentification HMAC SHA256 sur tous les messages TCP

## 🔧 Interfaces définies

### **Types partagés** (`@mars-rover/shared`)

- `Command` : Énumération des commandes (F, B, L, R)
- `Direction` : Orientations cardinales (N, E, S, W)
- `Position` : Coordonnées (x, y)
- `RoverState` : État complet du rover
- `TcpMessage` : Messages de communication TCP

### **Domaine métier** (`@mars-rover/core`)

- `IRoverEngine` : Logique de mouvement et simulation
- `ICommandDispatcher` : Traitement des commandes
- `IRoverService` : Communication TCP

### **Infrastructure** (`@mars-rover/infra`)

- `ICommandParser` : Analyse des commandes
- `IMapStateManager` : Gestion de l'état de carte
- `IObstacleManager` : Gestion des obstacles
- `IConsoleDisplay` : Affichage console
- `IInputCapture` : Capture des entrées clavier

## 🚀 Installation et démarrage

### Prérequis

- Node.js 20+
- pnpm

### Installation

```bash
pnpm install:all
```

### Construction

```bash
pnpm build
```

### Démarrage

1. **Démarrer le Rover** (serveur TCP) :

```bash
pnpm dev:rover
```

2. **Démarrer Mission Control** (client console) :

```bash
pnpm dev:mission
```

## 🎮 Utilisation

### Commandes disponibles

- `F` : Avancer
- `B` : Reculer
- `L` : Tourner à gauche
- `R` : Tourner à droite

### Exemple d'utilisation

```
> FFLR
Rover moved: (2, 1) facing East
```

## 🔒 Sécurité

- Toute communication TCP est sécurisée par **HMAC SHA256**
- Clé partagée entre Rover et Mission Control
- Vérification d'intégrité sur chaque message

## 🧪 Tests

Les tests couvriront :

- **Tests unitaires** pour le domaine métier
- **Tests d'intégration** pour la communication TCP
- **Tests de sécurité** pour la validation HMAC

## 📋 Règles métier

1. **Topologie toroïdale** : Les bords de la carte se rejoignent
2. **Arrêt sur obstacle** : Le rover s'arrête sans exécuter les commandes suivantes
3. **Pas de modification post-déploiement** : Le rover est immutable après démarrage
4. **Communication sécurisée** : Tous les échanges TCP sont authentifiés

## 🎯 État actuel

✅ **Interfaces TypeScript complètes**

- Tous les contrats sont définis
- Architecture DDD respectée
- Types strongly typed

🔄 **Prochaines étapes :**

- Implémentation des classes concrètes
- Tests unitaires et d'intégration
- Interface console interactive
- Configuration et déploiement
