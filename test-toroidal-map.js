/**
 * Script de test pour valider la carte toroïdale
 * Ce script teste que le rover peut "wrapper" d'un bord à l'autre
 */

import WebSocket from 'ws';

const ROVER_URL = 'ws://localhost:8080';
const GRID_SIZE = 10; // Taille de la grille 10x10

class ToroidalMapTester {
    constructor() {
        this.ws = null;
        this.roverPosition = { x: 2, y: 2 }; // Position initiale du rover
        this.testResults = [];
    }

    async runTests() {
        console.log('🧪 === TEST CARTE TOROÏDALE ===');
        console.log('🔗 Connexion au rover...');

        try {
            await this.connectToRover();
            await this.waitForInitialStatus();

            // Tests de wrapping
            await this.testHorizontalWrap();
            await this.testVerticalWrap();
            await this.testCornerWrap();

            this.displayResults();

        } catch (error) {
            console.error('❌ Erreur pendant les tests:', error);
        } finally {
            if (this.ws) {
                this.ws.close();
            }
        }
    }

    connectToRover() {
        return new Promise((resolve, reject) => {
            this.ws = new WebSocket(ROVER_URL);

            this.ws.on('open', () => {
                console.log('✅ Connexion établie avec le rover');
                resolve();
            });

            this.ws.on('message', (data) => {
                const message = JSON.parse(data.toString());
                this.handleMessage(message);
            });

            this.ws.on('error', reject);
        });
    }

    handleMessage(message) {
        if (message.type === 'STATUS') {
            this.roverPosition = message.payload.position;
            console.log(`📍 Position rover: (${this.roverPosition.x}, ${this.roverPosition.y}) ${message.payload.direction}`);
        }
    }

    waitForInitialStatus() {
        return new Promise((resolve) => {
            setTimeout(resolve, 500); // Attendre le statut initial
        });
    }

    async testHorizontalWrap() {
        console.log('\n🔄 Test de wrap horizontal (Est → Ouest)...');

        // Déplacer le rover vers le bord est
        await this.moveRoverTo(9, this.roverPosition.y);

        // Faire face à l'est
        await this.turnRoverTo('EAST');

        // Avancer (devrait wrapper vers x=0)
        const beforeX = this.roverPosition.x;
        await this.sendCommand(['F']);
        await this.sleep(1000);

        const wrapped = beforeX === 9 && this.roverPosition.x === 0;
        this.testResults.push({
            test: 'Wrap horizontal Est → Ouest',
            passed: wrapped,
            details: `Position avant: (${beforeX}, ${this.roverPosition.y}) → Position après: (${this.roverPosition.x}, ${this.roverPosition.y})`
        });

        console.log(`${wrapped ? '✅' : '❌'} Wrap horizontal: ${wrapped ? 'RÉUSSI' : 'ÉCHOUÉ'}`);
    }

    async testVerticalWrap() {
        console.log('\n🔄 Test de wrap vertical (Nord → Sud)...');

        // Déplacer le rover vers le bord nord
        await this.moveRoverTo(this.roverPosition.x, 0);

        // Faire face au nord
        await this.turnRoverTo('NORTH');

        // Avancer (devrait wrapper vers y=9)
        const beforeY = this.roverPosition.y;
        await this.sendCommand(['F']);
        await this.sleep(1000);

        const wrapped = beforeY === 0 && this.roverPosition.y === 9;
        this.testResults.push({
            test: 'Wrap vertical Nord → Sud',
            passed: wrapped,
            details: `Position avant: (${this.roverPosition.x}, ${beforeY}) → Position après: (${this.roverPosition.x}, ${this.roverPosition.y})`
        });

        console.log(`${wrapped ? '✅' : '❌'} Wrap vertical: ${wrapped ? 'RÉUSSI' : 'ÉCHOUÉ'}`);
    }

    async testCornerWrap() {
        console.log('\n🔄 Test de wrap en coin...');

        // Déplacer vers le coin sud-ouest (0,9)
        await this.moveRoverTo(0, 9);

        // Faire face à l'ouest
        await this.turnRoverTo('WEST');

        // Avancer (devrait wrapper vers x=9)
        const beforePos = { ...this.roverPosition };
        await this.sendCommand(['F']);
        await this.sleep(1000);

        const wrapped = beforePos.x === 0 && this.roverPosition.x === 9 && this.roverPosition.y === 9;
        this.testResults.push({
            test: 'Wrap en coin Ouest',
            passed: wrapped,
            details: `Position avant: (${beforePos.x}, ${beforePos.y}) → Position après: (${this.roverPosition.x}, ${this.roverPosition.y})`
        });

        console.log(`${wrapped ? '✅' : '❌'} Wrap en coin: ${wrapped ? 'RÉUSSI' : 'ÉCHOUÉ'}`);
    }

    async moveRoverTo(targetX, targetY) {
        console.log(`🎯 Déplacement vers (${targetX}, ${targetY})...`);

        // Cette fonction ne fait que des mouvements simples pour tester
        // Dans un vrai cas, on utiliserait un algorithme de pathfinding
        const commands = [];

        // Mouvement basique vers la cible (pas optimal mais suffisant pour le test)
        while (this.roverPosition.x !== targetX || this.roverPosition.y !== targetY) {
            if (this.roverPosition.x < targetX) {
                await this.turnRoverTo('EAST');
                commands.push('F');
            } else if (this.roverPosition.x > targetX) {
                await this.turnRoverTo('WEST');
                commands.push('F');
            } else if (this.roverPosition.y < targetY) {
                await this.turnRoverTo('SOUTH');
                commands.push('F');
            } else if (this.roverPosition.y > targetY) {
                await this.turnRoverTo('NORTH');
                commands.push('F');
            }

            if (commands.length > 0) {
                await this.sendCommand(commands.slice(-1));
                await this.sleep(500);
                commands.length = 0;
            }
        }
    }

    async turnRoverTo(targetDirection) {
        const directions = ['NORTH', 'EAST', 'SOUTH', 'WEST'];
        const currentIndex = directions.indexOf(this.roverDirection);
        const targetIndex = directions.indexOf(targetDirection);

        if (currentIndex === -1 || targetIndex === -1) {
            throw new Error(`Invalid direction: ${this.roverDirection} or ${targetDirection}`);
        }

        let steps = (targetIndex - currentIndex + 4) % 4; // Clockwise steps
        if (steps > 2) steps -= 4; // Convert to minimal steps (-3 to +3)

        const commands = [];
        if (steps > 0) {
            commands.push(...Array(steps).fill('R'));
        } else if (steps < 0) {
            commands.push(...Array(-steps).fill('L'));
        }

        for (const command of commands) {
            await this.sendCommand([command]);
            await this.sleep(300);
        }

        this.roverDirection = targetDirection; // Update current direction
    }

    sendCommand(commands) {
        return new Promise((resolve) => {
            const commandMessage = {
                id: `test-${Date.now()}`,
                type: 'COMMAND',
                payload: { commands },
                timestamp: Date.now(),
                source: 'toroidal-test'
            };

            this.ws.send(JSON.stringify(commandMessage));
            console.log(`📤 Commande envoyée: ${commands.join('')}`);

            setTimeout(resolve, 100);
        });
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    displayResults() {
        console.log('\n📊 === RÉSULTATS DES TESTS ===');
        let passed = 0;
        let total = this.testResults.length;

        this.testResults.forEach(result => {
            const status = result.passed ? '✅ RÉUSSI' : '❌ ÉCHOUÉ';
            console.log(`${status}: ${result.test}`);
            console.log(`   ${result.details}`);
            if (result.passed) passed++;
        });

        console.log(`\n🎯 Score: ${passed}/${total} tests réussis`);

        if (passed === total) {
            console.log('🎉 TOUS LES TESTS DE CARTE TOROÏDALE SONT RÉUSSIS !');
        } else {
            console.log('⚠️  Certains tests ont échoué - vérifier l\'implémentation');
        }
    }
}

// Exécution des tests
const tester = new ToroidalMapTester();
tester.runTests().then(() => {
    console.log('🏁 Tests terminés');
    process.exit(0);
}).catch(error => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
});
