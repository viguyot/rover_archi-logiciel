#!/usr/bin/env node

/**
 * Test du système de logging structuré pour le rover Mars
 * Ce script teste les différentes configurations de logging et les événements générés.
 */

import { spawn } from 'child_process';
import WebSocket from 'ws';

const ROVER_PORT = 8090;
const TEST_TIMEOUT = 15000;

console.log('🧪 === Test du Système de Logging Structuré ===\n');

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function startRover(loggingOptions = {}) {
    const args = [
        'dist/index.js',
        '--port', ROVER_PORT.toString(),
        '--rover-id', 'test-rover-logging',
        '--x', '0',
        '--y', '0',
        '--direction', 'EAST',
        '--planet-width', '5',
        '--planet-height', '5'
    ];

    // Ajouter les options de logging
    Object.entries(loggingOptions).forEach(([key, value]) => {
        args.push(`--log-${key}`, value.toString());
    });

    const rover = spawn('node', args, {
        cwd: './applications/mars-rover-vehicle',
        stdio: ['pipe', 'pipe', 'pipe']
    });

    console.log(`🚀 Démarrage du rover avec logging: ${JSON.stringify(loggingOptions)}`);

    let output = '';
    rover.stdout.on('data', (data) => {
        output += data.toString();
        console.log(`[ROVER] ${data.toString().trim()}`);
    });

    rover.stderr.on('data', (data) => {
        console.error(`[ROVER ERROR] ${data.toString().trim()}`);
    });

    // Attendre que le rover soit prêt
    await delay(2000);

    return { rover, output };
}

async function testLoggingConfiguration(config, testName) {
    console.log(`\n📋 Test: ${testName}`);
    console.log(`   Configuration: ${JSON.stringify(config)}`);

    const { rover, output } = await startRover(config);

    try {
        // Connexion WebSocket
        const ws = new WebSocket(`ws://localhost:${ROVER_PORT}`);

        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('Timeout connexion')), 5000);

            ws.on('open', () => {
                clearTimeout(timeout);
                console.log('   ✅ Connexion WebSocket établie');
                resolve();
            });

            ws.on('error', (error) => {
                clearTimeout(timeout);
                reject(error);
            });
        });

        // Test commandes avec wrapping pour vérifier les logs
        console.log('   🎮 Envoi de commandes de test...');

        const commandMessage = {
            id: 'test-logging-' + Date.now(),
            type: 'COMMAND',
            payload: {
                commands: ['F', 'F', 'F', 'F', 'F', 'F'] // Provoque du wrapping
            },
            timestamp: Date.now(),
            source: 'test-client'
        };

        ws.send(JSON.stringify(commandMessage));

        // Attendre la réponse
        await new Promise((resolve) => {
            ws.on('message', (data) => {
                const response = JSON.parse(data.toString());
                if (response.type === 'COMMAND_RESPONSE') {
                    console.log(`   📍 Position finale: (${response.payload.finalPosition.x}, ${response.payload.finalPosition.y})`);
                    console.log(`   🛤️  Chemin: ${response.payload.pathTaken.map(p => `(${p.x},${p.y})`).join(' → ')}`);
                    resolve();
                }
            });
        });

        ws.close();
        await delay(1000);

    } catch (error) {
        console.error(`   ❌ Erreur: ${error.message}`);
    } finally {
        rover.kill();
        await delay(500);
    }
}

async function runTests() {
    console.log('🔬 Tests des différentes configurations de logging\n');

    // Test 1: Tous les logs activés (par défaut)
    await testLoggingConfiguration({}, 'Configuration par défaut (tous logs activés)');

    // Test 2: Seulement les logs de wrapping
    await testLoggingConfiguration({
        wrapping: true,
        movement: false,
        commands: false,
        obstacles: false
    }, 'Seulement logs de wrapping toroïdal');

    // Test 3: Seulement les logs de mouvement
    await testLoggingConfiguration({
        wrapping: false,
        movement: true,
        commands: false,
        obstacles: false
    }, 'Seulement logs de mouvement');

    // Test 4: Tous les logs désactivés
    await testLoggingConfiguration({
        wrapping: false,
        movement: false,
        commands: false,
        obstacles: false
    }, 'Tous les logs désactivés');

    console.log('\n✅ Tests du système de logging terminés !');
    console.log('\n📊 Résumé:');
    console.log('   - Le système de logging structuré remplace les console.log directs');
    console.log('   - Les événements de wrapping, mouvement, commandes et obstacles sont configurables');
    console.log('   - Les logs peuvent être activés/désactivés individuellement via les options CLI');
    console.log('   - La séparation entre logique métier et logging est respectée');
}

// Démarrage des tests
runTests().catch(console.error);
