/**
 * Point d'entrée du Mission Control
 * 
 * Cette application est le client console qui se connecte au rover
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
    console.log('🎮 Mars Rover Mission Control');
    console.log('=============================');
    console.log('Connexion au rover...');

    // TODO: Charger la configuration
    // TODO: Se connecter au rover TCP
    // TODO: Démarrer la boucle de commandes

    console.log('❌ Implémentation en cours...');
}

if (require.main === module) {
    main().catch(console.error);
}
