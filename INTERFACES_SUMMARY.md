# 📋 Interfaces Mars Rover - Inventaire Complet

## 🎯 Vue d'ensemble

Ce document présente **l'inventaire complet** de toutes les interfaces TypeScript définies pour le projet Mars Rover Distribué selon l'architecture DDD.

---

## 📦 Package `@mars-rover/shared` (Types communs)

### 🔸 `types.ts` - Types de base

- **Enums :**

  - `Direction` : N, E, S, W
  - `Command` : F, B, L, R
  - `MessageType` : COMMAND, STATE_UPDATE, ERROR, STOP

- **Types de base :**

  - `Position` : { x: number, y: number }
  - `Dimensions` : { width: number, height: number }
  - `RoverState` : position + direction + état de blocage
  - `Obstacle` : position + type

- **Messages TCP :**
  - `CommandMessage` : séquence de commandes
  - `StateUpdateMessage` : mise à jour d'état
  - `ErrorMessage` : gestion d'erreurs
  - `StopMessage` : arrêt avec raison

### 🔸 `security.interface.ts`

- **`ISecurityService`** : HMAC SHA256, signature/vérification des messages TCP

### 🔸 `testing.interface.ts`

- **`ITestScenario`** : Définition des cas de test
- **`ITestRunner`** : Exécution de tests et suites
- **`ITestResult`** / **`ITestSuiteResult`** : Résultats des tests

### 🔸 `validation.interface.ts`

- **`IValidator<T>`** : Validation générique avec règles
- **`IValidationResult`** : Résultat de validation avec erreurs/warnings
- **`IValidationRule`** : Règles configurables (required, range, pattern, custom)

### 🔸 `events.interface.ts`

- **`EventType`** : Enum des événements système
- **`IBaseEvent`** : Structure de base des événements
- **`IRoverMovedEvent`** / **`IObstacleDetectedEvent`** : Événements spécifiques
- **`IEventBus`** : Pub/Sub avec historique

### 🔸 `error-handling.interface.ts`

- **`ErrorType`** / **`ErrorSeverity`** : Classification des erreurs
- **`ISystemError`** : Erreurs structurées avec contexte
- **`IErrorHandler`** : Gestion et récupération d'erreurs
- **`IRetryStrategy`** : Stratégies de retry configurables
- **`ICircuitBreaker`** : Protection contre les défaillances

---

## 🧠 Package `@mars-rover/core` (Domaine métier)

### 🔸 `rover-engine.interface.ts`

- **`IRoverEngine`** :
  - Moteur principal du rover avec logique toroïdale
  - Exécution de commandes individuelles et séquences
  - Gestion des obstacles et positions

### 🔸 `command-dispatcher.interface.ts`

- **`ICommandDispatcher`** :
  - Traitement des messages TCP entrants
  - Validation et aiguillage des commandes
  - Orchestration des réponses

### 🔸 `rover-service.interface.ts`

- **`IRoverService`** :

  - Client TCP pour Mission Control
  - Gestion des connexions et timeouts
  - Envoi de commandes et réception d'états

- **`IRoverTcpServer`** :
  - Serveur TCP pour le Rover
  - Gestion des connexions entrantes
  - Configuration des handlers de messages

### 🔸 `navigation.interface.ts`

- **`INavigationCalculator`** :
  - Calculs de navigation toroïdale
  - Gestion des rotations et mouvements
  - Calculs de distance et adjacence

### 🔸 `state-management.interface.ts`

- **`IStateManager<T>`** : Gestion d'état réactive avec historique
- **`IStatePersistence<T>`** : Persistance d'état async

---

## 🔧 Package `@mars-rover/infra` (Infrastructure)

### 🔸 `command-parser.interface.ts`

- **`ICommandParser`** :
  - Parsing des chaînes de commandes
  - Validation et normalisation
  - Support des commandes étendues

### 🔸 `map-state-manager.interface.ts`

- **`IMapStateManager`** :
  - Gestion locale de l'état de la carte
  - Tracking des obstacles découverts
  - Rendu textuel de la carte
  - Historique des positions visitées

### 🔸 `obstacle-manager.interface.ts`

- **`IObstacleManager`** :
  - CRUD des obstacles
  - Génération aléatoire
  - Détection de collisions
  - Chargement depuis configuration

### 🔸 `console.interface.ts`

- **`IConsoleDisplay`** :

  - Affichage formaté de la carte
  - Messages d'information, erreurs, succès
  - Interface utilisateur console

- **`IInputCapture`** :
  - Capture de commandes clavier
  - Modes ligne/caractère
  - Gestion des entrées utilisateur

### 🔸 `configuration.interface.ts`

- **`IConfigurationManager`** : Chargement/sauvegarde de configuration
- **`IRoverConfiguration`** : Configuration complète structurée :
  - Serveur (port, host, timeout)
  - Planète (dimensions, topologie)
  - État initial du rover
  - Sécurité (HMAC, authentication)
  - Obstacles (prédéfinis, aléatoires)
  - Logging (niveau, fichiers)

### 🔸 `monitoring.interface.ts`

- **`ILogger`** : Logging multi-niveaux avec sortie console/fichier
- **`IMetricsCollector`** : Collecte de métriques (compteurs, timers, gauges)

---

## 🎮 Application `mission-control`

### 🔸 `mission-control.interface.ts`

- **`IMissionControl`** : Interface principale du contrôle de mission
- **`IMissionOrchestrator`** : Orchestration des interactions utilisateur

---

## 🤖 Application `rover`

### 🔸 `rover-server.interface.ts`

- **`IRoverServer`** : Interface principale du serveur rover
- **`IRoverConfiguration`** : Configuration spécifique au rover

---

## 📊 Statistiques

### **Total des interfaces : 25+**

### **Répartition par couche :**

- **Shared (types communs)** : 8 interfaces principales
- **Core (domaine)** : 7 interfaces métier
- **Infra (infrastructure)** : 8 interfaces techniques
- **Applications** : 4 interfaces applicatives

### **Concepts couverts :**

✅ **Communication TCP sécurisée** (HMAC)  
✅ **Navigation toroïdale**  
✅ **Gestion d'obstacles**  
✅ **Gestion d'état réactive**  
✅ **Logging et métriques**  
✅ **Validation et tests**  
✅ **Gestion d'erreurs robuste**  
✅ **Configuration flexible**  
✅ **Interface console**  
✅ **Événements système**

---

## 🚀 Prêt pour l'implémentation

**Toutes les interfaces sont définies et typées strictement.**  
L'architecture respecte les principes DDD avec séparation claire des responsabilités.  
Le projet est prêt pour la phase d'implémentation des classes concrètes.

**Prochaine étape recommandée :** Implémentation progressive en commençant par les types de base (`@mars-rover/shared`) puis le domaine métier (`@mars-rover/core`).
