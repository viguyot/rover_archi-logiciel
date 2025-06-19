import { Position, RoverState, Obstacle, Dimensions } from '@mars-rover/shared';

/**
 * Interface pour la gestion de l'état de la carte
 */
export interface IMapStateManager {
    /**
     * Dimensions de la planète
     */
    readonly planetDimensions: Dimensions;

    /**
     * Position actuelle du rover
     */
    readonly currentRoverState: RoverState | null;

    /**
     * Liste des obstacles découverts
     */
    readonly discoveredObstacles: readonly Obstacle[];

    /**
     * Met à jour l'état du rover
     */
    updateRoverState(state: RoverState): void;

    /**
     * Ajoute un obstacle découvert
     */
    addObstacle(obstacle: Obstacle): void;

    /**
     * Vérifie si une position contient un obstacle connu
     */
    hasObstacleAt(position: Position): boolean;

    /**
     * Retourne l'obstacle à une position donnée
     */
    getObstacleAt(position: Position): Obstacle | null;

    /**
     * Génère une représentation textuelle de la carte
     */
    renderMap(): string;

    /**
     * Remet à zéro l'état de la carte
     */
    reset(): void;

    /**
     * Retourne l'historique des positions visitées
     */
    getVisitedPositions(): readonly Position[];
}
