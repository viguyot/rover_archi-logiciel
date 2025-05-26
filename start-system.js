#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const applicationsDir = join(__dirname, 'applications');
const roverVehicleDir = join(applicationsDir, 'mars-rover-vehicle');
const missionControlDir = join(applicationsDir, 'mars-mission-control');

console.log('🚀 Démarrage du système distribué Mars Rover...\n');

// Fonction pour exécuter une commande dans un répertoire spécifique
function runCommand(command, args, cwd, label) {
    return new Promise((resolve, reject) => {
        console.log(`📦 ${label}: ${command} ${args.join(' ')}`);

        const process = spawn(command, args, {
            cwd,
            stdio: 'inherit',
            shell: true
        });

        process.on('close', (code) => {
            if (code === 0) {
                console.log(`✅ ${label}: Terminé avec succès`);
                resolve();
            } else {
                console.log(`❌ ${label}: Échec (code ${code})`);
                reject(new Error(`${label} failed with code ${code}`));
            }
        });

        process.on('error', (error) => {
            console.log(`❌ ${label}: Erreur - ${error.message}`);
            reject(error);
        });
    });
}

// Fonction pour vérifier si les dépendances sont installées
async function checkAndInstallDependencies() {
    console.log('🔍 Vérification des dépendances...\n');

    try {
        // Vérifier et installer les dépendances du rover vehicle
        await runCommand('npm', ['install'], roverVehicleDir, 'Installation Rover Vehicle');

        // Vérifier et installer les dépendances du mission control
        await runCommand('npm', ['install'], missionControlDir, 'Installation Mission Control');

        console.log('\n✅ Toutes les dépendances sont installées\n');
    } catch (error) {
        console.error('❌ Erreur lors de l\'installation des dépendances:', error.message);
        process.exit(1);
    }
}

// Fonction pour compiler les applications
async function buildApplications() {
    console.log('🔨 Compilation des applications...\n');

    try {
        // Compiler le rover vehicle
        await runCommand('npm', ['run', 'build'], roverVehicleDir, 'Compilation Rover Vehicle');

        // Compiler le mission control
        await runCommand('npm', ['run', 'build'], missionControlDir, 'Compilation Mission Control');

        console.log('\n✅ Toutes les applications sont compilées\n');
    } catch (error) {
        console.error('❌ Erreur lors de la compilation:', error.message);
        process.exit(1);
    }
}

// Fonction pour lancer les applications
function startApplications() {
    console.log('🎯 Lancement des applications...\n');

    // Lancer le rover vehicle en arrière-plan
    console.log('🔧 Démarrage du Rover Vehicle (Système Embarqué)...');
    const roverProcess = spawn('npm', ['start'], {
        cwd: roverVehicleDir,
        stdio: 'pipe',
        shell: true
    });

    // Capturer les logs du rover
    roverProcess.stdout.on('data', (data) => {
        console.log(`[ROVER] ${data.toString().trim()}`);
    });

    roverProcess.stderr.on('data', (data) => {
        console.log(`[ROVER ERROR] ${data.toString().trim()}`);
    });

    // Attendre quelques secondes puis lancer le mission control
    setTimeout(() => {
        console.log('\n🎮 Démarrage du Mission Control (Centre de Contrôle)...');

        const missionControlProcess = spawn('npm', ['start'], {
            cwd: missionControlDir,
            stdio: 'inherit',
            shell: true
        });

        missionControlProcess.on('close', (code) => {
            console.log('\n🛑 Mission Control fermé, arrêt du système...');
            roverProcess.kill();
            process.exit(code);
        });

        missionControlProcess.on('error', (error) => {
            console.error('❌ Erreur Mission Control:', error.message);
            roverProcess.kill();
            process.exit(1);
        });

    }, 3000); // Attendre 3 secondes pour que le rover démarre

    roverProcess.on('error', (error) => {
        console.error('❌ Erreur Rover Vehicle:', error.message);
        process.exit(1);
    });
}

// Fonction pour afficher l'aide
function showHelp() {
    console.log(`
Usage: node start-system.js [options]

Options:
  --help, -h          Afficher cette aide
  --install-only      Installer uniquement les dépendances
  --build-only        Compiler uniquement les applications
  --dev               Lancer en mode développement (avec ts-node)

Exemples:
  node start-system.js                 # Installation, compilation et lancement
  node start-system.js --install-only  # Installation des dépendances seulement
  node start-system.js --build-only    # Compilation seulement
  node start-system.js --dev           # Mode développement

Description:
Ce script automatise le démarrage complet du système distribué Mars Rover.
Il installe les dépendances, compile les applications TypeScript et lance
les deux composants du système dans l'ordre approprié.
`);
}

// Fonction principale
async function main() {
    const args = process.argv.slice(2);

    if (args.includes('--help') || args.includes('-h')) {
        showHelp();
        return;
    }

    try {
        if (args.includes('--install-only')) {
            await checkAndInstallDependencies();
            return;
        }

        if (args.includes('--build-only')) {
            await checkAndInstallDependencies();
            await buildApplications();
            return;
        }

        if (args.includes('--dev')) {
            console.log('🚀 Mode développement activé\n');

            // En mode dev, on lance directement avec ts-node
            console.log('🔧 Démarrage du Rover Vehicle (mode dev)...');
            const roverProcess = spawn('npm', ['run', 'dev'], {
                cwd: roverVehicleDir,
                stdio: 'pipe',
                shell: true
            });

            roverProcess.stdout.on('data', (data) => {
                console.log(`[ROVER] ${data.toString().trim()}`);
            });

            roverProcess.stderr.on('data', (data) => {
                console.log(`[ROVER ERROR] ${data.toString().trim()}`);
            });

            setTimeout(() => {
                console.log('\n🎮 Démarrage du Mission Control (mode dev)...');

                const missionControlProcess = spawn('npm', ['run', 'dev'], {
                    cwd: missionControlDir,
                    stdio: 'inherit',
                    shell: true
                });

                missionControlProcess.on('close', (code) => {
                    console.log('\n🛑 Mission Control fermé, arrêt du système...');
                    roverProcess.kill();
                    process.exit(code);
                });

            }, 3000);

            return;
        }

        // Mode normal : installation, compilation et lancement
        await checkAndInstallDependencies();
        await buildApplications();
        startApplications();

    } catch (error) {
        console.error('❌ Erreur fatale:', error.message);
        process.exit(1);
    }
}

// Gestion des signaux pour un arrêt propre
process.on('SIGINT', () => {
    console.log('\n🛑 Arrêt du système demandé...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Arrêt du système...');
    process.exit(0);
});

main().catch(error => {
    console.error('❌ Erreur non gérée:', error);
    process.exit(1);
});
