import { Position, Direction, Command } from './network-protocol.js';

/**
 * Configuration de la planète Mars
 */
export interface PlanetConfig {
    width: number;
    height: number;
    obstacles: Position[];
}

/**
 * Moteur de simulation du rover Mars
 * Cette classe simule le comportement physique du rover
 */
export class RoverEngine {
    private position: Position;
    private direction: Direction;
    private planetConfig: PlanetConfig;
    private battery: number = 100;

    constructor(
        initialPosition: Position,
        initialDirection: Direction,
        planetConfig: PlanetConfig
    ) {
        this.position = { ...initialPosition };
        this.direction = initialDirection;
        this.planetConfig = planetConfig;

        console.log(`🚀 Rover Engine initialisé:`);
        console.log(`   Position: (${this.position.x}, ${this.position.y})`);
        console.log(`   Direction: ${this.direction}`);
        console.log(`   Planète: ${planetConfig.width}x${planetConfig.height}`);
        console.log(`   Obstacles: ${planetConfig.obstacles.length}`);
    }

    /**
     * Exécute une série de commandes
     */
    executeCommands(commands: Command[]): {
        success: boolean;
        message: string;
        finalPosition: Position;
        finalDirection: Direction;
        obstacleDetected?: Position;
        commandsExecuted: number;
    } {
        const initialPosition = { ...this.position };
        const initialDirection = this.direction;
        let commandsExecuted = 0;

        console.log(`🎮 Exécution de ${commands.length} commandes: ${commands.join('')}`);

        for (const command of commands) {
            const result = this.executeCommand(command);
            commandsExecuted++;

            if (!result.success) {
                // Obstacle rencontré, arrêt immédiat
                console.log(`❌ Arrêt à la commande ${commandsExecuted}: ${result.message}`);
                return {
                    success: false,
                    message: `Arrêt après ${commandsExecuted}/${commands.length} commandes: ${result.message}`,
                    finalPosition: this.position,
                    finalDirection: this.direction,
                    obstacleDetected: result.obstacleDetected,
                    commandsExecuted
                };
            }

            // Consommation de batterie
            this.battery = Math.max(0, this.battery - 0.5);
        }

        const moved = this.position.x !== initialPosition.x || this.position.y !== initialPosition.y;
        const turned = this.direction !== initialDirection;

        let message = `✅ ${commands.length} commandes exécutées avec succès`;
        if (moved && turned) {
            message += ` - Déplacement et rotation effectués`;
        } else if (moved) {
            message += ` - Déplacement effectué`;
        } else if (turned) {
            message += ` - Rotation effectuée`;
        }

        console.log(message);
        console.log(`📍 Position finale: (${this.position.x}, ${this.position.y}) ${this.direction}`);

        return {
            success: true,
            message,
            finalPosition: this.position,
            finalDirection: this.direction,
            commandsExecuted
        };
    }

    /**
     * Exécute une commande individuelle
     */
    private executeCommand(command: Command): {
        success: boolean;
        message: string;
        obstacleDetected?: Position;
    } {
        console.log(`🔧 Exécution commande: ${command}`);

        switch (command) {
            case 'F':
                return this.moveForward();
            case 'B':
                return this.moveBackward();
            case 'L':
                return this.turnLeft();
            case 'R':
                return this.turnRight();
            default:
                return {
                    success: false,
                    message: `Commande inconnue: ${command}`
                };
        }
    }

    /**
     * Avancer
     */
    private moveForward(): { success: boolean; message: string; obstacleDetected?: Position } {
        const newPosition = this.calculateNewPosition(this.direction);
        return this.attemptMove(newPosition, 'Avance');
    }

    /**
     * Reculer
     */
    private moveBackward(): { success: boolean; message: string; obstacleDetected?: Position } {
        const oppositeDirection = this.getOppositeDirection(this.direction);
        const newPosition = this.calculateNewPosition(oppositeDirection);
        return this.attemptMove(newPosition, 'Recule');
    }

    /**
     * Tourner à gauche
     */
    private turnLeft(): { success: boolean; message: string } {
        const directions: Direction[] = ['NORTH', 'WEST', 'SOUTH', 'EAST'];
        const currentIndex = directions.indexOf(this.direction);
        this.direction = directions[(currentIndex + 1) % 4];
        console.log(`↺ Rotation gauche vers ${this.direction}`);
        return {
            success: true,
            message: `Rotation gauche vers ${this.direction}`
        };
    }

    /**
     * Tourner à droite
     */
    private turnRight(): { success: boolean; message: string } {
        const directions: Direction[] = ['NORTH', 'EAST', 'SOUTH', 'WEST'];
        const currentIndex = directions.indexOf(this.direction);
        this.direction = directions[(currentIndex + 1) % 4];
        console.log(`↻ Rotation droite vers ${this.direction}`);
        return {
            success: true,
            message: `Rotation droite vers ${this.direction}`
        };
    }

    /**
     * Calcule la nouvelle position selon la direction
     */
    private calculateNewPosition(direction: Direction): Position {
        const newPosition = { ...this.position };

        switch (direction) {
            case 'NORTH':
                newPosition.y = Math.max(0, newPosition.y - 1);
                break;
            case 'SOUTH':
                newPosition.y = Math.min(this.planetConfig.height - 1, newPosition.y + 1);
                break;
            case 'EAST':
                newPosition.x = Math.min(this.planetConfig.width - 1, newPosition.x + 1);
                break;
            case 'WEST':
                newPosition.x = Math.max(0, newPosition.x - 1);
                break;
        }

        return newPosition;
    }

    /**
     * Tente un déplacement
     */
    private attemptMove(newPosition: Position, action: string): {
        success: boolean;
        message: string;
        obstacleDetected?: Position;
    } {
        // Vérification des limites de la planète
        if (newPosition.x < 0 || newPosition.x >= this.planetConfig.width ||
            newPosition.y < 0 || newPosition.y >= this.planetConfig.height) {
            console.log(`🚫 ${action}: Limite de planète atteinte`);
            return {
                success: false,
                message: `${action}: Limite de planète atteinte`
            };
        }

        // Vérification des obstacles
        const obstacle = this.planetConfig.obstacles.find(
            obs => obs.x === newPosition.x && obs.y === newPosition.y
        );

        if (obstacle) {
            console.log(`🚧 ${action}: Obstacle détecté en (${obstacle.x}, ${obstacle.y})`);
            return {
                success: false,
                message: `${action}: Obstacle détecté`,
                obstacleDetected: obstacle
            };
        }

        // Déplacement réussi
        this.position = newPosition;
        console.log(`✅ ${action}: (${this.position.x}, ${this.position.y})`);
        return {
            success: true,
            message: `${action} vers (${this.position.x}, ${this.position.y})`
        };
    }

    /**
     * Obtient la direction opposée
     */
    private getOppositeDirection(direction: Direction): Direction {
        switch (direction) {
            case 'NORTH': return 'SOUTH';
            case 'SOUTH': return 'NORTH';
            case 'EAST': return 'WEST';
            case 'WEST': return 'EAST';
        }
    }

    /**
     * Obtient l'état actuel du rover
     */    getState(): {
        position: Position;
        direction: Direction;
        battery: number;
        state: 'ACTIVE' | 'INACTIVE' | 'ERROR';
    } {
        return {
            position: { ...this.position },
            direction: this.direction,
            battery: this.battery,
            state: this.battery > 0 ? 'ACTIVE' as const : 'INACTIVE' as const
        };
    }

    /**
     * Obtient la configuration de la planète
     */
    getPlanetConfig(): PlanetConfig {
        return {
            width: this.planetConfig.width,
            height: this.planetConfig.height,
            obstacles: [...this.planetConfig.obstacles]
        };
    }
}
