import { RoverState } from '@mars-rover/shared';

/**
 * Interface pour l'affichage console
 */
export interface IConsoleDisplay {
    /**
     * Affiche la carte avec l'état actuel du rover
     */
    displayMap(map: string, roverState: RoverState): void;

    /**
     * Affiche les informations du rover
     */
    displayRoverInfo(roverState: RoverState): void;

    /**
     * Affiche un message d'erreur
     */
    displayError(error: string): void;

    /**
     * Affiche un message d'information
     */
    displayInfo(message: string): void;

    /**
     * Affiche un message de succès
     */
    displaySuccess(message: string): void;

    /**
     * Efface l'écran console
     */
    clear(): void;

    /**
     * Affiche l'aide des commandes
     */
    displayHelp(): void;

    /**
     * Affiche le titre/banner de l'application
     */
    displayBanner(): void;
}

/**
 * Interface pour la capture des commandes clavier
 */
export interface IInputCapture {
    /**
     * Lit une ligne de commande depuis l'entrée utilisateur
     */
    readLine(prompt?: string): Promise<string>;

    /**
     * Lit un caractère unique depuis l'entrée utilisateur
     */
    readKey(): Promise<string>;

    /**
     * Configure le mode de capture (ligne vs caractère)
     */
    setMode(mode: 'line' | 'key'): void;

    /**
     * Ferme le système de capture d'entrée
     */
    close(): void;
}
