import { Command, RoverState, Position, Direction, Obstacle } from '@mars-rover/shared';

/**
 * Interface pour le moteur du Rover (logique métier principale)
 */
export interface IRoverEngine {
    /**
     * État actuel du rover
     */
    readonly currentState: RoverState;

    /**
     * Dimensions de la planète
     */
    readonly planetDimensions: { width: number; height: number };

    /**
     * Exécute une commande et retourne le nouvel état
     * @param command Commande à exécuter
     * @returns Nouvel état du rover ou null si bloqué par obstacle
     */
    executeCommand(command: Command): RoverState | null;

    /**
     * Exécute une séquence de commandes
     * S'arrête à la première commande bloquée
     * @param commands Séquence de commandes
     * @returns État final et éventuel obstacle détecté
     */
    executeSequence(commands: readonly Command[]): {
        finalState: RoverState;
        obstacleDetected?: Obstacle;
        executedCommands: number;
    };

    /**
     * Réinitialise le rover à une position donnée
     */
    reset(position: Position, direction: Direction): void;

    /**
     * Vérifie si une position est accessible (pas d'obstacle)
     */
    isPositionAccessible(position: Position): boolean;
}
