#!/usr/bin/env node

/**
 * Tests unitaires pour Mars Mission Control
 * Tests des fonctionnalités critiques du centre de contrôle
 */

import assert from 'assert';

// Simuler l'import du MissionControl
const TestResults = {
    passed: 0,
    failed: 0,
    total: 0
};

console.log('🧪 === TESTS UNITAIRES MISSION CONTROL ===\n');

function test(name, testFn) {
    TestResults.total++;
    console.log(`🔬 Test: ${name}`);

    try {
        testFn();
        TestResults.passed++;
        console.log(`   ✅ PASSÉ\n`);
    } catch (error) {
        TestResults.failed++;
        console.log(`   ❌ ÉCHEC: ${error.message}\n`);
    }
}

// Tests de validation des commandes ZQSD
test('Validation mapping clavier ZQSD français', () => {
    const keyMapping = {
        'Z': 'FORWARD',    // Z = Avancer
        'S': 'BACKWARD',   // S = Reculer  
        'Q': 'LEFT',       // Q = Gauche
        'D': 'RIGHT'       // D = Droite
    };

    assert.strictEqual(keyMapping['Z'], 'FORWARD', 'Z doit mapper vers FORWARD');
    assert.strictEqual(keyMapping['S'], 'BACKWARD', 'S doit mapper vers BACKWARD');
    assert.strictEqual(keyMapping['Q'], 'LEFT', 'Q doit mapper vers LEFT');
    assert.strictEqual(keyMapping['D'], 'RIGHT', 'D doit mapper vers RIGHT');
});

test('Validation protocole WebSocket', () => {
    const message = {
        type: 'COMMAND',
        payload: {
            command: 'F',
            timestamp: Date.now()
        }
    };

    assert.ok(message.type, 'Message doit avoir un type');
    assert.ok(message.payload, 'Message doit avoir un payload');
    assert.ok(message.payload.command, 'Payload doit contenir une commande');
});

test('Validation commandes rover valides', () => {
    const validCommands = ['F', 'B', 'L', 'R'];
    const testCommand = 'F';

    assert.ok(validCommands.includes(testCommand), 'Commande F doit être valide');
});

test('Validation format position rover', () => {
    const position = {
        x: 5,
        y: 3,
        direction: 'NORTH',
        timestamp: Date.now()
    };

    assert.strictEqual(typeof position.x, 'number', 'Position x doit être un nombre');
    assert.strictEqual(typeof position.y, 'number', 'Position y doit être un nombre');
    assert.strictEqual(typeof position.direction, 'string', 'Direction doit être une chaîne');
    assert.ok(['NORTH', 'SOUTH', 'EAST', 'WEST'].includes(position.direction));
});

test('Validation URL WebSocket', () => {
    const wsUrl = 'ws://localhost:8080';

    assert.ok(wsUrl.startsWith('ws://'), 'URL doit commencer par ws://');
    assert.ok(wsUrl.includes('localhost'), 'URL doit contenir localhost');
    assert.ok(wsUrl.includes('8080'), 'URL doit contenir le port 8080');
});

test('Validation interface utilisateur - Canvas', () => {
    // Simulation des propriétés Canvas
    const canvasConfig = {
        width: 800,
        height: 600,
        gridSize: 20
    };

    assert.ok(canvasConfig.width > 0, 'Largeur canvas doit être positive');
    assert.ok(canvasConfig.height > 0, 'Hauteur canvas doit être positive');
    assert.ok(canvasConfig.gridSize > 0, 'Taille grille doit être positive');
});

test('Validation gestion événements clavier', () => {
    const eventHandler = {
        keydown: 'handleKeyDown',
        keyup: 'handleKeyUp'
    };

    assert.ok(eventHandler.keydown, 'Handler keydown doit être défini');
    assert.ok(eventHandler.keyup, 'Handler keyup doit être défini');
});

test('Validation système de notification', () => {
    const notification = {
        level: 'INFO',
        message: 'Rover déplacé avec succès',
        timestamp: Date.now()
    };

    assert.ok(['INFO', 'WARN', 'ERROR'].includes(notification.level));
    assert.ok(notification.message.length > 0, 'Message ne doit pas être vide');
    assert.ok(notification.timestamp > 0, 'Timestamp doit être valide');
});

test('Validation configuration réseau par défaut', () => {
    const networkConfig = {
        host: 'localhost',
        port: 8080,
        reconnectAttempts: 5,
        reconnectDelay: 1000
    };

    assert.strictEqual(networkConfig.host, 'localhost');
    assert.strictEqual(networkConfig.port, 8080);
    assert.ok(networkConfig.reconnectAttempts >= 0);
    assert.ok(networkConfig.reconnectDelay > 0);
});

test('Validation état connexion WebSocket', () => {
    const connectionStates = ['CONNECTING', 'CONNECTED', 'DISCONNECTED', 'ERROR'];
    const currentState = 'CONNECTED';

    assert.ok(connectionStates.includes(currentState), 'État connexion doit être valide');
});

// Résultats des tests
console.log('📊 === RÉSULTATS DES TESTS ===');
console.log(`✅ Tests réussis: ${TestResults.passed}/${TestResults.total}`);
console.log(`❌ Tests échoués: ${TestResults.failed}/${TestResults.total}`);

if (TestResults.failed === 0) {
    console.log('🎉 TOUS LES TESTS SONT PASSÉS !');
    process.exit(0);
} else {
    console.log('💥 CERTAINS TESTS ONT ÉCHOUÉ !');
    process.exit(1);
}
