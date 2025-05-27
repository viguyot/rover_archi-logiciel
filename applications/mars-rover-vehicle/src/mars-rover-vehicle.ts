import WebSocket, { WebSocketServer } from 'ws';
import { RoverEngine, PlanetConfig, RoverLoggingConfig } from './rover-engine.js';
import {
    Position,
    Direction,
    MarsRoverMessage,
    CommandMessage,
    StatusMessage,
    CommandResponseMessage,
    ObstacleDiscoveryMessage,
    PingMessage,
    PongMessage,
    ErrorMessage,
    MessageIdGenerator
} from './network-protocol.js';

/**
 * Configuration du véhicule rover
 */
export interface VehicleConfig {
    port: number;
    roverId: string;
    initialPosition: Position;
    initialDirection: Direction;
    planetConfig: PlanetConfig;
    loggingConfig?: RoverLoggingConfig;
}

/**
 * Application véhicule Mars Rover
 * Simule le système embarqué du rover physique sur Mars
 */
export class MarsRoverVehicle {
    private wss: WebSocketServer;
    private rover: RoverEngine;
    private config: VehicleConfig;
    private connections: Set<WebSocket> = new Set(); constructor(config: VehicleConfig) {
        this.config = config;
        this.rover = new RoverEngine(
            config.initialPosition,
            config.initialDirection,
            config.planetConfig,
            config.loggingConfig
        );

        this.wss = new WebSocketServer({ port: config.port });
        this.setupWebSocketServer();

        console.log(`🚀 Mars Rover Vehicle "${config.roverId}" démarré`);
        console.log(`📡 Écoute sur le port ${config.port}`);
        console.log(`📍 Position: (${config.initialPosition.x}, ${config.initialPosition.y}) ${config.initialDirection}`);
        console.log(`🌍 Planète: ${config.planetConfig.width}x${config.planetConfig.height}`);
    }

    /**
     * Configuration du serveur WebSocket
     */
    private setupWebSocketServer(): void {
        this.wss.on('connection', (ws: WebSocket) => {
            console.log('🔗 Nouvelle connexion Mission Control établie');
            this.connections.add(ws);

            // Envoi immédiat du statut
            this.sendStatusUpdate(ws);

            ws.on('message', (data: Buffer) => {
                try {
                    const message: MarsRoverMessage = JSON.parse(data.toString());
                    this.handleMessage(ws, message);
                } catch (error) {
                    console.error('❌ Erreur parsing message:', error);
                    this.sendError(ws, 'Format de message invalide');
                }
            });

            ws.on('close', () => {
                console.log('🔌 Connexion Mission Control fermée');
                this.connections.delete(ws);
            });

            ws.on('error', (error) => {
                console.error('❌ Erreur WebSocket:', error);
                this.connections.delete(ws);
            });
        });
    }

    /**
     * Traite les messages entrants
     */
    private handleMessage(ws: WebSocket, message: MarsRoverMessage): void {
        console.log(`📨 Message reçu: ${message.type} (ID: ${message.id})`);

        switch (message.type) {
            case 'COMMAND':
                this.handleCommand(ws, message as CommandMessage);
                break;
            case 'PING':
                this.handlePing(ws, message as PingMessage);
                break;
            default:
                console.log(`⚠️  Type de message non supporté: ${message.type}`);
                this.sendError(ws, `Type de message non supporté: ${message.type}`);
        }
    }

    /**
     * Traite les commandes de mouvement
     */
    private handleCommand(ws: WebSocket, command: CommandMessage): void {
        console.log(`🎮 Commandes reçues: ${command.payload.commands.join('')}`);

        const result = this.rover.executeCommands(command.payload.commands);
        const currentState = this.rover.getState();

        // Envoi de la réponse de commande
        const response: CommandResponseMessage = {
            id: MessageIdGenerator.generate(),
            type: 'COMMAND_RESPONSE',
            payload: {
                success: result.success,
                message: result.message,
                finalPosition: result.finalPosition,
                finalDirection: result.finalDirection,
                obstacleDetected: result.obstacleDetected
            },
            timestamp: Date.now(),
            source: this.config.roverId
        };

        this.sendMessage(ws, response);

        // Si obstacle découvert, envoi de notification séparée
        if (result.obstacleDetected) {
            console.log(`🚧 Signalement obstacle découvert: (${result.obstacleDetected.x}, ${result.obstacleDetected.y})`);

            const obstacleMessage: ObstacleDiscoveryMessage = {
                id: MessageIdGenerator.generate(),
                type: 'OBSTACLE_DISCOVERED',
                payload: {
                    position: result.obstacleDetected,
                    discoveredAt: Date.now()
                },
                timestamp: Date.now(),
                source: this.config.roverId
            };

            this.sendMessage(ws, obstacleMessage);
        }

        // Mise à jour du statut pour toutes les connexions
        this.broadcastStatusUpdate();
    }

    /**
     * Traite les pings
     */
    private handlePing(ws: WebSocket, ping: PingMessage): void {
        const pong: PongMessage = {
            id: MessageIdGenerator.generate(),
            type: 'PONG',
            payload: {
                status: 'alive'
            },
            timestamp: Date.now(),
            source: this.config.roverId
        };

        this.sendMessage(ws, pong);
    }

    /**
     * Envoi d'un message d'erreur
     */
    private sendError(ws: WebSocket, errorMessage: string): void {
        const errorResponse: ErrorMessage = {
            id: MessageIdGenerator.generate(),
            type: 'ERROR',
            payload: {
                error: errorMessage
            },
            timestamp: Date.now(),
            source: this.config.roverId
        };

        this.sendMessage(ws, errorResponse);
    }

    /**
     * Envoi d'une mise à jour de statut
     */
    private sendStatusUpdate(ws: WebSocket): void {
        const state = this.rover.getState();

        const statusMessage: StatusMessage = {
            id: MessageIdGenerator.generate(),
            type: 'STATUS',
            payload: {
                roverId: this.config.roverId,
                position: state.position,
                direction: state.direction,
                battery: state.battery,
                state: state.state
            },
            timestamp: Date.now(),
            source: this.config.roverId
        };

        this.sendMessage(ws, statusMessage);
    }

    /**
     * Diffuse une mise à jour de statut
     */
    private broadcastStatusUpdate(): void {
        this.connections.forEach(ws => {
            if (ws.readyState === WebSocket.OPEN) {
                this.sendStatusUpdate(ws);
            }
        });
    }

    /**
     * Envoi d'un message
     */
    private sendMessage(ws: WebSocket, message: MarsRoverMessage): void {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
        }
    }

    /**
     * Arrêt du véhicule
     */
    stop(): void {
        console.log(`🛑 Arrêt du véhicule ${this.config.roverId}`);
        this.wss.close();
    }

    /**
     * Obtient l'état actuel
     */
    getCurrentState() {
        return {
            roverId: this.config.roverId,
            state: this.rover.getState(),
            planetConfig: this.rover.getPlanetConfig()
        };
    }
}
