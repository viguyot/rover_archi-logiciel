# Système Distribué Mars Rover

Ce projet implémente un système distribué pour le contrôle d'un rover martien, composé de deux applications complètement séparées qui communiquent uniquement via le réseau.

## Architecture

Le système est structuré en deux applications indépendantes :

```
applications/
├── mars-rover-vehicle/     # Système embarqué du rover
└── mars-mission-control/   # Centre de contrôle au sol
```

### Séparation des Responsabilités

- **mars-rover-vehicle** : Système embarqué qui simule le rover physique
- **mars-mission-control** : Interface de contrôle pour les opérateurs au sol
- **Communication** : Uniquement via WebSocket (aucune dépendance partagée)

## Démarrage Rapide

### 1. Lancer le Véhicule Rover (Système Embarqué)

```bash
cd applications/mars-rover-vehicle
npm install
npm run build
npm start
```

Le rover écoute sur le port 8080.

### 2. Lancer le Contrôle de Mission (Centre de Contrôle)

```bash
cd applications/mars-mission-control
npm install
npm run build
npm start
```

Le centre de contrôle se connecte automatiquement au rover.

## Utilisation

Une fois les deux applications lancées :

### Commandes de Déplacement

- **Z** : Avancer
- **S** : Reculer
- **Q** : Tourner à gauche
- **D** : Tourner à droite

### Commandes de Statut

- **M/map** : Afficher la carte des découvertes
- **S/status** : Afficher le statut de la mission
- **C/clear** : Nettoyer l'affichage
- **H/help** : Afficher l'aide
- **L/leave** : Quitter le programme

### Fonctionnalités

- **Exploration automatique** : Le rover construit une carte de la zone explorée
- **Détection d'obstacles** : Les obstacles sont détectés et signalés au centre de contrôle
- **Simulation physique** : Consommation de batterie, limites de mouvement
- **Interface temps réel** : Communication bidirectionnelle via WebSocket

## Développement

### Mode Développement avec Rechargement Automatique

Pour chaque application :

```bash
npm run build:watch  # Terminal 1 - Compilation automatique
npm run dev         # Terminal 2 - Exécution avec rechargement
```

### Scripts Disponibles

- `npm run build` : Compilation TypeScript
- `npm run build:watch` : Compilation avec surveillance des changements
- `npm start` : Lancement de l'application compilée
- `npm run dev` : Lancement direct avec ts-node
- `npm run clean` : Nettoyage des fichiers compilés

## Tests

Deux scripts de test sont disponibles :

```bash
node test-new-architecture.js    # Test de l'architecture séparée
node test-discovery-system.js    # Test du système de découverte
```

## Protocole de Communication

La communication utilise des messages JSON via WebSocket :

```typescript
interface NetworkMessage {
  type: "command" | "status" | "discovery";
  data: any;
}
```

### Types de Messages

- **command** : Commandes de déplacement (z/q/s/d)
- **status** : Informations sur l'état du rover
- **discovery** : Rapports de découverte d'obstacles ou de points d'intérêt

## Architecture Technique

### Principe de Séparation

- Aucune dépendance partagée entre les applications
- Communication uniquement via réseau (WebSocket)
- Chaque application peut être déployée indépendamment
- Protocole de communication standardisé

### Technologies Utilisées

- **TypeScript** : Langage principal
- **Node.js** : Runtime d'exécution
- **WebSocket (ws)** : Communication réseau
- **ES Modules** : Système de modules moderne

## Structure du Code

Chaque application contient :

- `src/index.ts` : Point d'entrée de l'application
- `src/network-protocol.ts` : Définitions du protocole de communication
- `src/*.ts` : Modules spécifiques à l'application
- `package.json` : Configuration et dépendances
- `tsconfig.json` : Configuration TypeScript

Cette architecture garantit une séparation complète et une communication robuste entre les composants du système distribué.
