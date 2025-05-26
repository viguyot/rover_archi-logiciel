#!/usr/bin/env node

import { MarsRoverVehicle, VehicleConfig } from './mars-rover-vehicle.js';
import { Position, Direction } from './network-protocol.js';

/**
 * Configuration par défaut du rover
 */
const DEFAULT_CONFIG: VehicleConfig = {
    port: 8080,
    roverId: 'curiosity-rover',
    initialPosition: { x: 2, y: 2 },
    initialDirection: 'NORTH',
    planetConfig: {
        width: 10,
        height: 10,
        obstacles: [
            { x: 3, y: 3 },
            { x: 5, y: 5 },
            { x: 7, y: 1 },
            { x: 1, y: 7 },
            { x: 8, y: 8 }
        ]
    }
};

/**
 * Parse les arguments de ligne de commande
 */
function parseArguments(): VehicleConfig {
    const args = process.argv.slice(2);
    const config = { ...DEFAULT_CONFIG };

    for (let i = 0; i < args.length; i += 2) {
        const key = args[i];
        const value = args[i + 1];

        if (!value) continue;

        switch (key) {
            case '--port':
                config.port = parseInt(value);
                break;
            case '--rover-id':
                config.roverId = value;
                break;
            case '--x':
                config.initialPosition.x = parseInt(value);
                break;
            case '--y':
                config.initialPosition.y = parseInt(value);
                break;
            case '--direction':
                config.initialDirection = value as Direction;
                break;
            case '--planet-width':
                config.planetConfig.width = parseInt(value);
                break;
            case '--planet-height':
                config.planetConfig.height = parseInt(value);
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
🚀 Mars Rover Vehicle - Système embarqué du rover

Usage: node dist/index.js [options]

Options:
  --port <number>          Port d'écoute WebSocket (défaut: 8080)
  --rover-id <string>      Identifiant du rover (défaut: curiosity-rover)
  --x <number>             Position X initiale (défaut: 2)
  --y <number>             Position Y initiale (défaut: 2)
  --direction <direction>  Direction initiale: NORTH|SOUTH|EAST|WEST (défaut: NORTH)
  --planet-width <number>  Largeur de la planète (défaut: 10)
  --planet-height <number> Hauteur de la planète (défaut: 10)
  --help                   Affiche cette aide

Exemples:
  node dist/index.js
  node dist/index.js --port 8081 --rover-id perseverance
  node dist/index.js --x 5 --y 5 --direction SOUTH
`);
}

/**
 * Validation de la configuration
 */
function validateConfig(config: VehicleConfig): boolean {
    if (config.port < 1 || config.port > 65535) {
        console.error('❌ Port invalide: doit être entre 1 et 65535');
        return false;
    }

    if (config.initialPosition.x < 0 || config.initialPosition.x >= config.planetConfig.width ||
        config.initialPosition.y < 0 || config.initialPosition.y >= config.planetConfig.height) {
        console.error('❌ Position initiale en dehors des limites de la planète');
        return false;
    }

    const obstacle = config.planetConfig.obstacles.find(
        obs => obs.x === config.initialPosition.x && obs.y === config.initialPosition.y
    );
    if (obstacle) {
        console.error('❌ Position initiale sur un obstacle');
        return false;
    }

    return true;
}

/**
 * Point d'entrée principal
 */
function main(): void {
    console.log('🌌 Démarrage Mars Rover Vehicle...');

    try {
        const config = parseArguments();

        if (!validateConfig(config)) {
            process.exit(1);
        }

        console.log('📋 Configuration:');
        console.log(`   🚀 Rover ID: ${config.roverId}`);
        console.log(`   📡 Port: ${config.port}`);
        console.log(`   📍 Position: (${config.initialPosition.x}, ${config.initialPosition.y})`);
        console.log(`   🧭 Direction: ${config.initialDirection}`);
        console.log(`   🌍 Planète: ${config.planetConfig.width}x${config.planetConfig.height}`);
        console.log(`   🚧 Obstacles: ${config.planetConfig.obstacles.length}`);

        const vehicle = new MarsRoverVehicle(config);        // Gestion des signaux d'arrêt
        process.on('SIGINT', () => {
            console.log('\\n⚡ Signal d\'arrêt reçu...');
            vehicle.stop();
            process.exit(0);
        });

        process.on('SIGTERM', () => {
            console.log('\\n⚡ Signal de terminaison reçu...');
            vehicle.stop();
            process.exit(0);
        });

        console.log('✅ Mars Rover Vehicle prêt - En attente de connexions Mission Control');
        console.log('💡 Appuyez sur Ctrl+C pour arrêter');

    } catch (error) {
        console.error('❌ Erreur au démarrage:', error);
        process.exit(1);
    }
}

// Démarrage de l'application
main();
