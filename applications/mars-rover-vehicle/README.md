# Mars Rover Vehicle - Système Embarqué

Cette application simule le système embarqué d'un rover martien. Elle fonctionne comme un serveur WebSocket qui reçoit des commandes du centre de contrôle et exécute les mouvements physiques.

## Fonctionnalités

### Simulation Physique

- **Moteur de déplacement** : Simulation des mouvements en 2D
- **Consommation d'énergie** : Chaque mouvement consomme de la batterie
- **Détection d'obstacles** : Identification automatique des obstacles
- **Limites physiques** : Contraintes de mouvement réalistes

### Communication Réseau

- **Serveur WebSocket** : Écoute sur le port 8080
- **Réception de commandes** : Traite les commandes de déplacement
- **Rapport de statut** : Envoie l'état du rover au centre de contrôle
- **Signalement de découvertes** : Informe des obstacles détectés

## Architecture du Code

### Modules Principaux

#### `index.ts`

Point d'entrée de l'application qui :

- Initialise le serveur WebSocket
- Configure la communication réseau
- Lance le système embarqué

#### `mars-rover-vehicle.ts`

Classe principale `MarsRoverVehicle` qui :

- Gère la connexion WebSocket
- Traite les messages entrants
- Coordonne avec le moteur du rover
- Envoie les réponses au centre de contrôle

#### `rover-engine.ts`

Moteur de simulation physique `RoverEngine` qui :

- Simule les déplacements en 2D
- Gère la consommation de batterie
- Détecte les collisions avec les obstacles
- Maintient l'état physique du rover

#### `network-protocol.ts`

Définitions du protocole de communication :

- Types de messages réseau
- Structures de données partagées
- Interface de communication standardisée

## Configuration

### Variables d'Environnement

- `PORT` : Port d'écoute du serveur WebSocket (défaut: 8080)

### Paramètres de Simulation

- **Batterie initiale** : 100%
- **Consommation par mouvement** : 2%
- **Position de départ** : (0, 0)
- **Direction initiale** : Nord

## Commandes Supportées

Le rover répond aux commandes suivantes :

- `z` : Avancer d'une case
- `s` : Reculer d'une case
- `q` : Tourner à gauche (90°)
- `d` : Tourner à droite (90°)

## Messages de Sortie

### Message de Statut

```json
{
  "type": "status",
  "data": {
    "position": { "x": 0, "y": 0 },
    "direction": "north",
    "battery": 98,
    "isMoving": false
  }
}
```

### Message de Découverte

```json
{
  "type": "discovery",
  "data": {
    "position": { "x": 3, "y": 3 },
    "obstacleDetected": true,
    "message": "Obstacle détecté à la position (3, 3)"
  }
}
```

## Simulation des Obstacles

Le rover dispose d'un système de détection d'obstacles prédéfini :

- Position (3, 3) : Obstacle rocheux
- Les obstacles bloquent le mouvement
- Détection automatique lors des tentatives de déplacement

## Déploiement

### Installation

```bash
npm install
```

### Compilation

```bash
npm run build
```

### Exécution

```bash
npm start
```

### Mode Développement

```bash
npm run dev
```

## Sécurité et Robustesse

- **Validation des commandes** : Vérification de la validité des commandes
- **Gestion des erreurs** : Traitement robuste des erreurs de communication
- **Limites de batterie** : Arrêt automatique en cas de batterie faible
- **Déconnexion gracieuse** : Gestion propre des déconnexions réseau

## Monitoring

L'application fournit des logs détaillés :

- Démarrage du serveur
- Connexions/déconnexions des clients
- Commandes reçues et exécutées
- Découvertes d'obstacles
- État de la batterie

Cette application représente le côté "embarqué" du système distribué et fonctionne de manière autonome une fois lancée.
