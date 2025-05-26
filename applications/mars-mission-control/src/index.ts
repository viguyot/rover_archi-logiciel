#!/usr/bin/env node

import * as readline from 'readline';
import { MarsMissionControl, MissionControlConfig } from './mars-mission-control.js';

/**
 * Configuration par défaut Mission Control
 */
const DEFAULT_CONFIG: MissionControlConfig = {
    roverUrl: 'ws://localhost:8080',
    reconnectInterval: 5000,
    pingInterval: 10000,
    mapWidth: 10,
    mapHeight: 10
};

/**
 * Interface utilisateur Mission Control
 */
class MissionControlUI {
    private missionControl: MarsMissionControl;
    private rl: readline.Interface;

    constructor(config: MissionControlConfig) {
        this.missionControl = new MarsMissionControl(config);
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        this.setupInterface();
    }

    /**
     * Configuration de l'interface
     */
    private setupInterface(): void {
        console.clear();
        this.showHeader();
        this.showHelp();
        this.startCommandLoop();
    }

    /**
     * En-tête Mission Control
     */
    private showHeader(): void {
        console.log('🌌 ===== MARS MISSION CONTROL =====');
        console.log('🚀 Centre de contrôle de mission Mars');
        console.log('📡 Communication rover via réseau uniquement');
        console.log('=====================================\\n');
    }    /**
     * Aide
     */
    private showHelp(): void {
        console.log('🎮 COMMANDES DISPONIBLES:');
        console.log('  z/f     - Avancer');
        console.log('  s/b     - Reculer');
        console.log('  q/l     - Tourner gauche');
        console.log('  d/r     - Tourner droite');
        console.log('  map/m   - Afficher carte Mars');
        console.log('  status/s- Statut mission');
        console.log('  clear/c - Effacer écran');
        console.log('  help/h  - Afficher aide');
        console.log('  quit/q  - Quitter');
        console.log('');
        console.log('💡 Vous pouvez enchaîner les commandes: zqsd, fffl, etc.');
        console.log('');
    }

    /**
     * Boucle de commandes
     */
    private startCommandLoop(): void {
        this.rl.setPrompt('🎮 Mission Control > ');
        this.rl.prompt();

        this.rl.on('line', (input: string) => {
            this.handleCommand(input.trim().toLowerCase());
            this.rl.prompt();
        });

        this.rl.on('close', () => {
            this.shutdown();
        });
    }

    /**
     * Traitement des commandes
     */
    private handleCommand(input: string): void {
        if (!input) {
            return;
        }

        switch (input) {
            case 'map':
            case 'm':
                this.showMap();
                break;
            case 'status':
            case 's':
                this.showStatus();
                break;
            case 'clear':
            case 'c':
                console.clear();
                this.showHeader();
                break;
            case 'help':
            case 'h':
                this.showHelp();
                break;
            case 'quit':
            case 'q':
                this.shutdown();
                break;
            default:
                this.handleMovementCommands(input);
        }
    }    /**
     * Traitement des commandes de mouvement
     */
    private handleMovementCommands(input: string): void {
        const commands: string[] = [];

        for (const char of input) {
            switch (char) {
                case 'z':
                case 'f':
                    commands.push('F');
                    break;
                case 's':
                case 'b':
                    commands.push('B');
                    break;
                case 'q':
                case 'l':
                    commands.push('L');
                    break;
                case 'd':
                case 'r':
                    commands.push('R');
                    break;
                default:
                    console.log(`❌ Commande inconnue: '${char}'. Tapez 'help' pour l'aide.`);
                    return;
            }
        }

        if (commands.length > 0) {
            const success = this.missionControl.sendCommand(commands);
            if (!success) {
                console.log('❌ Impossible d\'envoyer la commande - Rover non connecté');
            }
        }
    }

    /**
     * Affichage de la carte
     */
    private showMap(): void {
        this.missionControl.displayMarsMap();
    }

    /**
     * Affichage du statut
     */
    private showStatus(): void {
        const status = this.missionControl.getMissionStatus();

        console.log('\\n📊 === STATUT MISSION ===');
        console.log(`📡 Connexion rover: ${status.connected ? '✅ CONNECTÉ' : '❌ DÉCONNECTÉ'}`);

        if (status.rover) {
            const rover = status.rover;
            const timeSinceContact = Math.floor((Date.now() - rover.lastContact) / 1000);

            console.log(`🚀 Rover: ${rover.roverId}`);
            console.log(`📍 Position: (${rover.position.x}, ${rover.position.y})`);
            console.log(`🧭 Direction: ${rover.direction}`);
            console.log(`🔋 Batterie: ${rover.battery}%`);
            console.log(`⚡ État: ${rover.state}`);
            console.log(`⏱️  Dernier contact: ${timeSinceContact}s`);
        } else {
            console.log('🚀 Rover: AUCUNE DONNÉE');
        }

        console.log(`\\n🗺️  Exploration Mars:`);
        console.log(`   📏 Taille carte: ${status.map.totalArea} cases`);
        console.log(`   ✅ Exploré: ${status.map.exploredArea} cases (${status.map.explorationPercentage}%)`);
        console.log(`   🚧 Obstacles trouvés: ${status.map.obstaclesFound}`);
        console.log();
    }

    /**
     * Arrêt de l'application
     */
    private shutdown(): void {
        console.log('\\n🛑 Arrêt de Mission Control...');
        this.missionControl.stop();
        this.rl.close();
        process.exit(0);
    }
}

/**
 * Parse les arguments de ligne de commande
 */
function parseArguments(): MissionControlConfig {
    const args = process.argv.slice(2);
    const config = { ...DEFAULT_CONFIG };

    for (let i = 0; i < args.length; i += 2) {
        const key = args[i];
        const value = args[i + 1];

        if (!value) continue;

        switch (key) {
            case '--rover-url':
                config.roverUrl = value;
                break;
            case '--reconnect-interval':
                config.reconnectInterval = parseInt(value);
                break;
            case '--ping-interval':
                config.pingInterval = parseInt(value);
                break;
            case '--map-width':
                config.mapWidth = parseInt(value);
                break;
            case '--map-height':
                config.mapHeight = parseInt(value);
                break;
            case '--help':
                showHelp();
                process.exit(0);
        }
    }

    return config;
}

/**
 * Affiche l'aide
 */
function showHelp(): void {
    console.log(`
🌌 Mars Mission Control - Centre de contrôle de mission

Usage: node dist/index.js [options]

Options:
  --rover-url <url>           URL WebSocket du rover (défaut: ws://localhost:8080)
  --reconnect-interval <ms>   Intervalle de reconnexion (défaut: 5000)
  --ping-interval <ms>        Intervalle de ping (défaut: 10000)
  --map-width <number>        Largeur de la carte (défaut: 10)
  --map-height <number>       Hauteur de la carte (défaut: 10)
  --help                      Affiche cette aide

Exemples:
  node dist/index.js
  node dist/index.js --rover-url ws://192.168.1.100:8080
  node dist/index.js --map-width 15 --map-height 15
`);
}

/**
 * Point d'entrée principal
 */
function main(): void {
    try {
        const config = parseArguments();

        console.log('🌌 Démarrage Mars Mission Control...');
        console.log(`📡 Connexion vers: ${config.roverUrl}`);

        const ui = new MissionControlUI(config);

        // Gestion des signaux d'arrêt
        process.on('SIGINT', () => {
            ui['shutdown']();
        });

        process.on('SIGTERM', () => {
            ui['shutdown']();
        });

    } catch (error) {
        console.error('❌ Erreur au démarrage:', error);
        process.exit(1);
    }
}

// Démarrage de l'application
main();
