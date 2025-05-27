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
 * Types d'événements du rover
 */
export type RoverEvent =
    | { type: 'WRAP_HORIZONTAL'; from: 'WEST' | 'EAST'; to: 'EAST' | 'WEST'; position: Position }
    | { type: 'WRAP_VERTICAL'; from: 'NORTH' | 'SOUTH'; to: 'SOUTH' | 'NORTH'; position: Position }
    | { type: 'MOVE_SUCCESS'; action: string; position: Position }
    | { type: 'OBSTACLE_DETECTED'; position: Position; action: string }
    | { type: 'COMMAND_EXECUTED'; command: Command; success: boolean };

/**
 * Configuration du logging du rover
 */
export interface RoverLoggingConfig {
    enableWrappingLogs: boolean;
    enableMovementLogs: boolean;
    enableCommandLogs: boolean;
    enableObstacleLogs: boolean;
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
    private loggingConfig: RoverLoggingConfig;
    private eventListeners: ((event: RoverEvent) => void)[] = [];

    constructor(
        initialPosition: Position,
        initialDirection: Direction,
        planetConfig: PlanetConfig,
        loggingConfig: RoverLoggingConfig = {
            enableWrappingLogs: true,
            enableMovementLogs: true,
            enableCommandLogs: true,
            enableObstacleLogs: true
        }
    ) {
        this.position = { ...initialPosition };
        this.direction = initialDirection;
        this.planetConfig = planetConfig;
        this.loggingConfig = loggingConfig;

        // Ajouter un écouteur par défaut pour les logs console si activé
        this.addEventListener((event) => this.handleDefaultLogging(event));

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
        pathTaken: Position[];
    } {
        const initialPosition = { ...this.position };
        const initialDirection = this.direction;
        let commandsExecuted = 0;
        const pathTaken: Position[] = [{ ...this.position }]; // Commencer par la position initiale

        console.log(`🎮 Exécution de ${commands.length} commandes: ${commands.join('')}`);

        for (const command of commands) {
            const result = this.executeCommand(command);
            commandsExecuted++;

            // Ajouter la nouvelle position au chemin si déplacement
            if (result.success && (command === 'F' || command === 'B')) {
                pathTaken.push({ ...this.position });
            }

            if (!result.success) {
                // Obstacle rencontré, arrêt immédiat
                console.log(`❌ Arrêt à la commande ${commandsExecuted}: ${result.message}`);
                return {
                    success: false,
                    message: `Arrêt après ${commandsExecuted}/${commands.length} commandes: ${result.message}`,
                    finalPosition: this.position,
                    finalDirection: this.direction,
                    obstacleDetected: result.obstacleDetected,
                    commandsExecuted,
                    pathTaken
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
        console.log(`🛤️  Chemin parcouru: ${pathTaken.map(p => `(${p.x},${p.y})`).join(' → ')}`);

        return {
            success: true,
            message,
            finalPosition: this.position,
            finalDirection: this.direction,
            commandsExecuted,
            pathTaken
        };
    }    /**
     * Exécute une commande individuelle
     */
    private executeCommand(command: Command): {
        success: boolean;
        message: string;
        obstacleDetected?: Position;
    } {
        this.emitEvent({
            type: 'COMMAND_EXECUTED',
            command,
            success: true
        });

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
    }    /**
     * Calcule la nouvelle position selon la direction (carte toroïdale)
     */
    private calculateNewPosition(direction: Direction): Position {
        const newPosition = { ...this.position };

        switch (direction) {
            case 'NORTH':
                if (newPosition.y === 0) {
                    this.emitEvent({
                        type: 'WRAP_VERTICAL',
                        from: 'NORTH',
                        to: 'SOUTH',
                        position: { ...newPosition }
                    });
                }
                newPosition.y = (newPosition.y - 1 + this.planetConfig.height) % this.planetConfig.height;
                break;
            case 'SOUTH':
                if (newPosition.y === this.planetConfig.height - 1) {
                    this.emitEvent({
                        type: 'WRAP_VERTICAL',
                        from: 'SOUTH',
                        to: 'NORTH',
                        position: { ...newPosition }
                    });
                }
                newPosition.y = (newPosition.y + 1) % this.planetConfig.height;
                break;
            case 'EAST':
                if (newPosition.x === this.planetConfig.width - 1) {
                    this.emitEvent({
                        type: 'WRAP_HORIZONTAL',
                        from: 'EAST',
                        to: 'WEST',
                        position: { ...newPosition }
                    });
                }
                newPosition.x = (newPosition.x + 1) % this.planetConfig.width;
                break;
            case 'WEST':
                if (newPosition.x === 0) {
                    this.emitEvent({
                        type: 'WRAP_HORIZONTAL',
                        from: 'WEST',
                        to: 'EAST',
                        position: { ...newPosition }
                    });
                }
                newPosition.x = (newPosition.x - 1 + this.planetConfig.width) % this.planetConfig.width;
                break;
        }

        return newPosition;
    }    /**
     * Tente un déplacement
     */
    private attemptMove(newPosition: Position, action: string): {
        success: boolean;
        message: string;
        obstacleDetected?: Position;
    } {
        // Note: Plus de vérification des limites car la carte est toroïdale

        // Vérification des obstacles
        const obstacle = this.planetConfig.obstacles.find(
            obs => obs.x === newPosition.x && obs.y === newPosition.y
        );

        if (obstacle) {
            this.emitEvent({
                type: 'OBSTACLE_DETECTED',
                position: obstacle,
                action
            });
            return {
                success: false,
                message: `${action}: Obstacle détecté`,
                obstacleDetected: obstacle
            };
        }

        // Déplacement réussi
        this.position = newPosition;
        this.emitEvent({
            type: 'MOVE_SUCCESS',
            action,
            position: { ...this.position }
        });
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

    /**
     * Ajoute un écouteur d'événements
     */
    addEventListener(listener: (event: RoverEvent) => void): void {
        this.eventListeners.push(listener);
    }

    /**
     * Supprime un écouteur d'événements
     */
    removeEventListener(listener: (event: RoverEvent) => void): void {
        const index = this.eventListeners.indexOf(listener);
        if (index !== -1) {
            this.eventListeners.splice(index, 1);
        }
    }

    /**
     * Émet un événement vers tous les écouteurs
     */
    private emitEvent(event: RoverEvent): void {
        this.eventListeners.forEach(listener => listener(event));
    }

    /**
     * Gestion par défaut des logs console
     */
    private handleDefaultLogging(event: RoverEvent): void {
        switch (event.type) {
            case 'WRAP_HORIZONTAL':
                if (this.loggingConfig.enableWrappingLogs) {
                    const direction = event.from === 'WEST' ? 'bord ouest → bord est' : 'bord est → bord ouest';
                    console.log(`🌍 Wrap horizontal: ${direction}`);
                }
                break;
            case 'WRAP_VERTICAL':
                if (this.loggingConfig.enableWrappingLogs) {
                    const direction = event.from === 'NORTH' ? 'bord nord → bord sud' : 'bord sud → bord nord';
                    console.log(`🌍 Wrap vertical: ${direction}`);
                }
                break;
            case 'MOVE_SUCCESS':
                if (this.loggingConfig.enableMovementLogs) {
                    console.log(`✅ ${event.action}: (${event.position.x}, ${event.position.y})`);
                }
                break;
            case 'OBSTACLE_DETECTED':
                if (this.loggingConfig.enableObstacleLogs) {
                    console.log(`🚧 ${event.action}: Obstacle détecté en (${event.position.x}, ${event.position.y})`);
                }
                break;
            case 'COMMAND_EXECUTED':
                if (this.loggingConfig.enableCommandLogs) {
                    console.log(`🔧 Exécution commande: ${event.command}`);
                }
                break;
        }
    }

    /**
     * Met à jour la configuration de logging
     */
    setLoggingConfig(config: Partial<RoverLoggingConfig>): void {
        this.loggingConfig = { ...this.loggingConfig, ...config };
    }
}
