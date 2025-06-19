import { Position, Obstacle } from '@mars-rover/shared';

/**
 * Interface pour la gestion des obstacles
 */
export interface IObstacleManager {
    /**
     * Liste de tous les obstacles
     */
    readonly obstacles: readonly Obstacle[];

    /**
     * Ajoute un obstacle à la position donnée
     */
    addObstacle(position: Position, type?: string): void;

    /**
     * Supprime un obstacle à la position donnée
     */
    removeObstacle(position: Position): boolean;

    /**
     * Vérifie si une position contient un obstacle
     */
    hasObstacle(position: Position): boolean;

    /**
     * Retourne l'obstacle à une position donnée
     */
    getObstacle(position: Position): Obstacle | null;

    /**
     * Charge une configuration d'obstacles depuis un fichier/config
     */
    loadObstacles(obstacleData: readonly Obstacle[]): void;

    /**
     * Génère des obstacles aléatoires sur la carte
     */
    generateRandomObstacles(count: number, planetWidth: number, planetHeight: number): void;

    /**
     * Vide tous les obstacles
     */
    clear(): void;
}
