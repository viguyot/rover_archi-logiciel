/**
 * Point d'entrée de l'application Mission Control
 * 
 * Cette application est le client console qui se connecte au Rover
 * et permet de contrôler ses mouvements via des commandes clavier.
 */

import { IMissionControl } from './mission-control.interface';

// Déclaration pour les APIs Node.js
declare const console: {
    log: (message?: any, ...optionalParams: any[]) => void;
    error: (message?: any, ...optionalParams: any[]) => void;
};
declare const require: any;
declare const module: any;

// TODO: Implémenter la classe MissionControlApp
// qui implémente IMissionControl

async function main() {
    console.log('🚀 Mars Rover Mission Control');
    console.log('================================');
    console.log('Démarrage en cours...');

    // TODO: Initialiser MissionControl
    // TODO: Se connecter au rover
    // TODO: Démarrer la boucle de contrôle

    console.log('❌ Implémentation en cours...');
}

if (require.main === module) {
    main().catch(console.error);
}
