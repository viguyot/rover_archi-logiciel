#!/usr/bin/env node

/**
 * Test du nouveau système de traçage de chemin avec wrapping toroïdal
 */

import WebSocket from 'ws';

const ROVER_URL = 'ws://localhost:8080';

class PathWrappingTester {
    constructor() {
        this.ws = null;
        this.testResults = [];
    }

    async runTests() {
        console.log('🌍 === TEST DU TRAÇAGE DE CHEMIN TOROÏDAL ===\n');

        try {
            await this.connectToRover();
            await this.waitForInitialStatus();

            console.log('📍 Position initiale du rover: (2, 2) NORTH\n');

            // Test 1: Déplacement vers l'ouest pour provoquer le wrapping
            console.log('🧪 Test 1: Déplacement vers l\'ouest avec wrapping');
            await this.sendCommand(['L', 'L']); // Tourner vers l'ouest (2 fois à gauche)
            await this.sendCommand(['F', 'F', 'F']); // Avancer 3 fois pour dépasser la bordure ouest

            // Test 2: Vérifier le retour vers l'est
            console.log('\n🧪 Test 2: Retour vers l\'est');
            await this.sendCommand(['R', 'R']); // Tourner vers l'est
            await this.sendCommand(['F']); // Avancer une fois

            console.log('\n✅ Tests terminés');
            this.ws.close();

        } catch (error) {
            console.error('❌ Erreur pendant les tests:', error);
        }
    }

    connectToRover() {
        return new Promise((resolve, reject) => {
            console.log('🔗 Connexion au rover...');
            this.ws = new WebSocket(ROVER_URL);

            this.ws.on('open', () => {
                console.log('✅ Connecté au rover\n');
                resolve();
            });

            this.ws.on('message', (data) => {
                const message = JSON.parse(data.toString());
                this.handleRoverMessage(message);
            });

            this.ws.on('error', (error) => {
                console.error('❌ Erreur connexion:', error);
                reject(error);
            });

            this.ws.on('close', () => {
                console.log('🔌 Connexion fermée');
            });
        });
    }

    handleRoverMessage(message) {
        switch (message.type) {
            case 'STATUS':
                console.log(`📊 Statut: Position (${message.payload.position.x}, ${message.payload.position.y}) ${message.payload.direction}`);
                break;
            case 'COMMAND_RESPONSE':
                const response = message.payload;
                if (response.success) {
                    console.log(`✅ Commande réussie: ${response.message}`);
                    console.log(`📍 Position finale: (${response.finalPosition.x}, ${response.finalPosition.y}) ${response.finalDirection}`);

                    if (response.pathTaken) {
                        console.log(`🛤️  Chemin réel parcouru: ${response.pathTaken.map(p => `(${p.x},${p.y})`).join(' → ')}`);
                        console.log(`📏 Nombre de positions: ${response.pathTaken.length}`);
                    } else {
                        console.log('⚠️  Pas de chemin reçu dans la réponse');
                    }
                } else {
                    console.log(`❌ Commande échouée: ${response.message}`);
                    if (response.obstacleDetected) {
                        console.log(`🚧 Obstacle en (${response.obstacleDetected.x}, ${response.obstacleDetected.y})`);
                    }
                }
                break;
        }
    }

    waitForInitialStatus() {
        return new Promise((resolve) => {
            setTimeout(resolve, 1000);
        });
    }

    sendCommand(commands) {
        return new Promise((resolve) => {
            const commandMessage = {
                id: `test-${Date.now()}`,
                type: 'COMMAND',
                payload: { commands },
                timestamp: Date.now(),
                source: 'path-tester'
            };

            console.log(`📤 Envoi commande: ${commands.join('')}`);
            this.ws.send(JSON.stringify(commandMessage));

            setTimeout(resolve, 2000);
        });
    }
}

// Lancement du test
const tester = new PathWrappingTester();
tester.runTests().catch(console.error);
