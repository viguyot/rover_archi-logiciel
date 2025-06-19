/**
 * Point d'entrée du serveur Rover
 * 
 * Cette application est le serveur TCP qui reçoit les commandes
 * du Mission Control et simule les mouvements du rover.
 */

import { IRoverServer } from './rover-server.interface';

// Déclaration pour les APIs Node.js
declare const console: {
    log: (message?: any, ...optionalParams: any[]) => void;
    error: (message?: any, ...optionalParams: any[]) => void;
};
declare const require: any;
declare const module: any;

// TODO: Implémenter la classe RoverServerApp
// qui implémente IRoverServer

async function main() {
    console.log('🤖 Mars Rover Server');
    console.log('====================');
    console.log('Initialisation du rover...');

    // TODO: Charger la configuration
    // TODO: Initialiser le rover engine
    // TODO: Démarrer le serveur TCP

    console.log('❌ Implémentation en cours...');
}

if (require.main === module) {
    main().catch(console.error);
}
