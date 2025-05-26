# Mars Mission Control - Centre de Contrôle

Cette application implémente le centre de contrôle au sol pour le rover martien. Elle fonctionne comme un client WebSocket qui se connecte au rover et fournit une interface interactive pour les opérateurs.

## Fonctionnalités

### Interface Utilisateur

- **Contrôle clavier** : Commandes de déplacement intuitives
- **Affichage temps réel** : État du rover et carte des découvertes
- **Interface interactive** : Menu de commandes et feedback utilisateur
- **Visualisation de carte** : Affichage graphique des zones explorées

### Communication Réseau

- **Client WebSocket** : Connexion au rover sur le port 8080
- **Envoi de commandes** : Transmission des ordres de déplacement
- **Réception de données** : Traitement des rapports de statut et découvertes
- **Reconnexion automatique** : Gestion robuste des déconnexions

### Cartographie

- **Construction de carte** : Cartographie automatique basée sur les découvertes
- **Suivi d'exploration** : Historique des positions visitées
- **Détection d'obstacles** : Affichage des obstacles découverts
- **Visualisation ASCII** : Représentation textuelle de la carte

## Architecture du Code

### Modules Principaux

#### `index.ts`

Point d'entrée de l'application qui :

- Initialise la connexion WebSocket
- Lance l'interface utilisateur
- Gère la boucle principale d'interaction

#### `mars-mission-control.ts`

Classe principale `MarsMissionControl` qui :

- Gère la connexion WebSocket au rover
- Traite les entrées utilisateur
- Maintient la carte des découvertes
- Affiche l'interface utilisateur

#### `network-protocol.ts`

Définitions du protocole de communication :

- Types de messages réseau
- Structures de données partagées
- Interface de communication standardisée

## Interface Utilisateur

### Menu Principal

```
=== CONTRÔLE DE MISSION MARS ROVER ===

Commandes de déplacement:
  W - Avancer
  S - Reculer
  A - Tourner à gauche
  D - Tourner à droite

Commandes d'information:
  P - Position actuelle
  M - Afficher la carte
  B - Niveau de batterie
  Q - Quitter

Entrez votre commande:
```

### Affichage de Statut

```
État du rover:
- Position: (2, 1)
- Direction: Nord
- Batterie: 94%
- En mouvement: Non
```

### Carte des Découvertes

```
Carte des découvertes (22 positions explorées, 1 obstacle):

    0   1   2   3   4
0   .   .   .   #   .
1   .   ●   ●   .   .
2   .   ●   R   ●   .
3   .   .   ●   X   .
4   .   .   .   .   .

Légende:
R = Position actuelle du rover
● = Zone explorée
X = Obstacle détecté
# = Zone inconnue avec obstacle potentiel
. = Zone non explorée
```

## Configuration

### Paramètres de Connexion

- **Adresse du rover** : ws://localhost:8080
- **Timeout de connexion** : 5 secondes
- **Reconnexion automatique** : Activée

### Paramètres d'Affichage

- **Taille de carte** : 10x10 par défaut
- **Symboles de carte** : ASCII configurables
- **Refresh automatique** : Temps réel

## Commandes Supportées

### Commandes de Déplacement

- **W** : Envoie commande "w" (avancer)
- **S** : Envoie commande "s" (reculer)
- **A** : Envoie commande "a" (tourner gauche)
- **D** : Envoie commande "d" (tourner droite)

### Commandes d'Information

- **P** : Demande et affiche la position actuelle
- **M** : Affiche la carte complète des découvertes
- **B** : Affiche le niveau de batterie du rover
- **Q** : Ferme proprement la connexion et quitte

## Gestion des Données

### Cartographie Automatique

Le centre de contrôle construit automatiquement une carte basée sur :

- Les positions visitées par le rover
- Les obstacles découverts
- Les rapports de statut reçus

### Persistance

- **Carte en mémoire** : Maintenue pendant la session
- **Historique des commandes** : Traçabilité des actions
- **État de connexion** : Monitoring continu

## Messages Traités

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

## Déploiement

### Prérequis

- Node.js 18+
- Rover vehicle déjà en fonctionnement

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

- **Validation des entrées** : Vérification des commandes utilisateur
- **Gestion d'erreurs** : Traitement des erreurs de réseau
- **Reconnexion automatique** : Reprise automatique de la connexion
- **Arrêt propre** : Fermeture gracieuse des connexions

## Monitoring et Debugging

L'application fournit des informations détaillées :

- État de la connexion WebSocket
- Commandes envoyées et réponses reçues
- Mise à jour de la carte en temps réel
- Messages d'erreur et d'information

## Utilisation Opérationnelle

1. **Démarrage** : Lancer après le rover vehicle
2. **Connexion** : Connexion automatique au rover
3. **Contrôle** : Utiliser les commandes clavier
4. **Monitoring** : Surveiller la carte et le statut
5. **Arrêt** : Utiliser 'Q' pour quitter proprement

Cette application représente l'interface opérateur du système distribué et permet le contrôle complet du rover martien à distance.
