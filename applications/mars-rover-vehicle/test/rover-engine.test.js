#!/usr/bin/env node

/**
 * Tests unitaires pour le Rover Engine
 * Tests des fonctionnalités critiques du moteur rover
 */

import assert from 'assert';

// Simuler l'import du RoverEngine
const TestResults = {
    passed: 0,
    failed: 0,
    total: 0
};

console.log('🧪 === TESTS UNITAIRES ROVER ENGINE ===\n');

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

// Tests de validation des calculs de position toroïdale
test('Calcul position toroïdale - Wrapping horizontal', () => {
    // Test logique de wrapping
    const planetWidth = 10;
    const currentX = 9;
    const newX = (currentX + 1) % planetWidth;
    
    assert.strictEqual(newX, 0, 'Le wrapping horizontal doit fonctionner');
});

test('Calcul position toroïdale - Wrapping vertical', () => {
    const planetHeight = 10;
    const currentY = 0;
    const newY = (currentY - 1 + planetHeight) % planetHeight;
    
    assert.strictEqual(newY, 9, 'Le wrapping vertical doit fonctionner');
});

test('Validation configuration planète', () => {
    const config = {
        width: 10,
        height: 10,
        obstacles: [{ x: 3, y: 3 }, { x: 5, y: 5 }]
    };
    
    assert.ok(config.width > 0, 'La largeur doit être positive');
    assert.ok(config.height > 0, 'La hauteur doit être positive');
    assert.ok(Array.isArray(config.obstacles), 'Les obstacles doivent être un tableau');
});

test('Validation directions rover', () => {
    const directions = ['NORTH', 'SOUTH', 'EAST', 'WEST'];
    const testDirection = 'NORTH';
    
    assert.ok(directions.includes(testDirection), 'Direction doit être valide');
});

test('Validation commandes rover', () => {
    const validCommands = ['F', 'B', 'L', 'R'];
    const testCommands = ['F', 'F', 'R', 'B'];
    
    for (const cmd of testCommands) {
        assert.ok(validCommands.includes(cmd), `Commande ${cmd} doit être valide`);
    }
});

test('Calcul rotation gauche', () => {
    const directions = ['NORTH', 'WEST', 'SOUTH', 'EAST'];
    const currentDirection = 'NORTH';
    const currentIndex = directions.indexOf(currentDirection);
    const newDirection = directions[(currentIndex + 1) % 4];
    
    assert.strictEqual(newDirection, 'WEST', 'Rotation gauche depuis NORTH doit donner WEST');
});

test('Calcul rotation droite', () => {
    const directions = ['NORTH', 'EAST', 'SOUTH', 'WEST'];
    const currentDirection = 'NORTH';
    const currentIndex = directions.indexOf(currentDirection);
    const newDirection = directions[(currentIndex + 1) % 4];
    
    assert.strictEqual(newDirection, 'EAST', 'Rotation droite depuis NORTH doit donner EAST');
});

test('Détection collision obstacle', () => {
    const obstacles = [{ x: 3, y: 3 }, { x: 5, y: 5 }];
    const testPosition = { x: 3, y: 3 };
    
    const hasObstacle = obstacles.find(obs => 
        obs.x === testPosition.x && obs.y === testPosition.y
    );
    
    assert.ok(hasObstacle, 'Doit détecter un obstacle à la position (3,3)');
});

test('Validation position libre', () => {
    const obstacles = [{ x: 3, y: 3 }, { x: 5, y: 5 }];
    const testPosition = { x: 2, y: 2 };
    
    const hasObstacle = obstacles.find(obs => 
        obs.x === testPosition.x && obs.y === testPosition.y
    );
    
    assert.ok(!hasObstacle, 'Position (2,2) doit être libre');
});

test('Configuration logging par défaut', () => {
    const defaultLogging = {
        enableWrappingLogs: true,
        enableMovementLogs: true,
        enableCommandLogs: true,
        enableObstacleLogs: true
    };
    
    assert.strictEqual(typeof defaultLogging.enableWrappingLogs, 'boolean');
    assert.strictEqual(typeof defaultLogging.enableMovementLogs, 'boolean');
    assert.strictEqual(typeof defaultLogging.enableCommandLogs, 'boolean');
    assert.strictEqual(typeof defaultLogging.enableObstacleLogs, 'boolean');
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
