import { RoverState } from '@mars-rover/shared';

/**
 * Interface principale pour le contrôle de mission
 */
export interface IMissionControl {
    /**
     * Initialise la connexion avec le rover
     */
    initialize(roverHost: string, roverPort: number): Promise<void>;

    /**
     * Démarre la boucle principale de contrôle
     */
    start(): Promise<void>;

    /**
     * Arrête le contrôle de mission
     */
    stop(): Promise<void>;

    /**
     * Envoie une séquence de commandes au rover
     */
    sendCommands(commands: string): Promise<RoverState>;

    /**
     * Affiche l'état actuel de la mission
     */
    displayCurrentState(): void;

    /**
     * Vérifie l'état de la connexion
     */
    isConnected(): boolean;
}

/**
 * Interface pour l'orchestrateur de mission
 */
export interface IMissionOrchestrator {
    /**
     * Traite une commande utilisateur
     */
    processUserInput(input: string): Promise<void>;

    /**
     * Met à jour l'affichage après réception d'un état
     */
    updateDisplay(roverState: RoverState): void;

    /**
     * Gère les erreurs de communication
     */
    handleError(error: Error): void;

    /**
     * Gère la découverte d'obstacles
     */
    handleObstacleDetected(roverState: RoverState): void;
}
