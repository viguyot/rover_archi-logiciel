import { Position, Dimensions, Direction } from '@mars-rover/shared';

/**
 * Interface pour les calculs de navigation toroïdale
 */
export interface INavigationCalculator {
    /**
     * Calcule la nouvelle position après un mouvement, en tenant compte
     * de la topologie toroïdale de la planète
     */
    calculateNewPosition(
        currentPosition: Position,
        direction: Direction,
        movement: 'forward' | 'backward',
        planetDimensions: Dimensions
    ): Position;

    /**
     * Calcule la nouvelle direction après une rotation
     */
    calculateNewDirection(
        currentDirection: Direction,
        rotation: 'left' | 'right'
    ): Direction;

    /**
     * Vérifie si deux positions sont adjacentes en topologie toroïdale
     */
    areAdjacent(pos1: Position, pos2: Position, planetDimensions: Dimensions): boolean;

    /**
     * Calcule la distance toroïdale entre deux positions
     */
    calculateDistance(pos1: Position, pos2: Position, planetDimensions: Dimensions): number;
}
