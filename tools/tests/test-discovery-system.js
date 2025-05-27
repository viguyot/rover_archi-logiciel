const WebSocket = require('ws');

/**
 * Script de test pour valider le système de découverte d'obstacles
 */
async function testDiscoverySystem() {
    console.log('🧪 ===== TEST SYSTÈME DE DÉCOUVERTE =====\n');

    const ws = new WebSocket('ws://localhost:8081');

    return new Promise((resolve, reject) => {
        let obstaclesDiscovered = [];
        let commandCount = 0;

        ws.on('open', () => {
            console.log('✅ Connexion établie avec le rover');

            // Test: Faire avancer le rover pour découvrir des obstacles
            console.log('📤 Envoi de commandes pour découvrir des obstacles...\n');

            // Séquence de commandes pour explorer et découvrir des obstacles
            const commands = [
                ['F', 'F', 'F', 'F', 'F'], // Avancer pour potentiellement découvrir des obstacles
                ['R', 'F', 'F', 'F'],      // Tourner à droite et avancer
                ['R', 'F', 'F', 'F'],      // Tourner à droite et avancer
                ['R', 'F', 'F', 'F']       // Tourner à droite et avancer
            ];

            function sendNextCommand() {
                if (commandCount < commands.length) {
                    const command = {
                        id: `test-${Date.now()}-${commandCount}`,
                        type: 'COMMAND',
                        payload: { commands: commands[commandCount] },
                        timestamp: Date.now(),
                        source: 'TEST_SCRIPT'
                    };

                    console.log(`📤 Envoi commande ${commandCount + 1}/${commands.length}: ${commands[commandCount].join('')}`);
                    ws.send(JSON.stringify(command));
                    commandCount++;
                } else {
                    // Test terminé
                    setTimeout(() => {
                        console.log('\n🏁 Test terminé');
                        console.log(`📊 Obstacles découverts: ${obstaclesDiscovered.length}`);
                        if (obstaclesDiscovered.length > 0) {
                            console.log('🗿 Liste des obstacles découverts:');
                            obstaclesDiscovered.forEach((obs, index) => {
                                console.log(`   ${index + 1}. Position (${obs.x}, ${obs.y})`);
                            });
                        }
                        ws.close();
                        resolve(obstaclesDiscovered);
                    }, 2000);
                }
            }

            // Commencer le test
            sendNextCommand();
        });

        ws.on('message', (data) => {
            try {
                const message = JSON.parse(data.toString());

                if (message.type === 'RESPONSE') {
                    const result = message.payload;
                    console.log(`📨 Réponse: ${result.success ? '✅ Succès' : '❌ Échec'} - ${result.message || 'Pas de message'}`);

                    // Vérifier les obstacles découverts
                    if (result.discoveredObstacles && result.discoveredObstacles.length > 0) {
                        console.log(`🚧 Obstacles découverts par le rover: ${result.discoveredObstacles.length}`);
                        obstaclesDiscovered = result.discoveredObstacles;
                    }

                    if (result.obstacleDetected) {
                        console.log(`🎯 NOUVEL OBSTACLE découvert en (${result.obstacleDetected.x}, ${result.obstacleDetected.y})`);
                    }

                    // Envoyer la commande suivante après un délai
                    setTimeout(sendNextCommand, 1000);
                }

                if (message.type === 'STATUS') {
                    const payload = message.payload;
                    if (payload.type === 'OBSTACLE_DISCOVERED') {
                        console.log(`🚨 ALERTE: Obstacle découvert en (${payload.obstacle.x}, ${payload.obstacle.y})`);
                    }
                }
            } catch (error) {
                console.error('❌ Erreur parsing message:', error);
            }
        });

        ws.on('error', (error) => {
            console.error('❌ Erreur WebSocket:', error);
            reject(error);
        });

        ws.on('close', () => {
            console.log('📡 Connexion fermée');
        });
    });
}

// Lancer le test
testDiscoverySystem()
    .then((obstacles) => {
        console.log('\n🎉 Test réussi !');
        console.log(`✅ Système de découverte validé avec ${obstacles.length} obstacles`);
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Test échoué:', error);
        process.exit(1);
    });
