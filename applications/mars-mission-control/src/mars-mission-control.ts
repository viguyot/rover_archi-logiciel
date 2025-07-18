import WebSocket from 'ws';
import {
    Position,
    Direction,
    MarsRoverMessage,
    CommandMessage,
    StatusMessage,
    CommandResponseMessage,
    ObstacleDiscoveryMessage,
    PingMessage,
    MessageIdGenerator
} from './network-protocol.js';

/**
 * État du rover connu par Mission Control
 */
interface RoverState {
    roverId: string;
    position: Position;
    direction: Direction;
    battery: number;
    state: 'ACTIVE' | 'INACTIVE' | 'ERROR';
    lastContact: number;
    connected: boolean;
}

/**
 * Carte de Mars construite par Mission Control
 */
interface MarsMap {
    width: number;
    height: number;
    exploredTerrain: Set<string>;
    knownObstacles: Position[];
}

/**
 * Configuration Mission Control
 */
export interface MissionControlConfig {
    roverUrl: string;
    reconnectInterval: number;
    pingInterval: number;
    mapWidth: number;
    mapHeight: number;
}

/**
 * Centre de contrôle de mission Mars
 * Application complètement séparée qui ne peut communiquer qu'via réseau
 */
export class MarsMissionControl {
    private ws: WebSocket | null = null;
    private config: MissionControlConfig;
    private roverState: RoverState | null = null;
    private marsMap: MarsMap;
    private reconnectTimer: NodeJS.Timeout | null = null;
    private pingTimer: NodeJS.Timeout | null = null;
    private connectionAttempts = 0;
    private isFirstConnection = true; // Nouveau: pour détecter la première connexion

    constructor(config: MissionControlConfig) {
        this.config = config;
        this.marsMap = {
            width: config.mapWidth,
            height: config.mapHeight,
            exploredTerrain: new Set(),
            knownObstacles: []
        };

        console.log('🚀 Mars Mission Control initialisé');
        console.log(`📡 URL Rover: ${config.roverUrl}`);
        console.log(`🗺️  Carte Mars: ${config.mapWidth}x${config.mapHeight}`);

        this.connectToRover();
    }

    /**
     * Connexion au rover
     */
    private connectToRover(): void {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            return;
        }

        this.connectionAttempts++;
        console.log(`🔗 Tentative de connexion ${this.connectionAttempts} vers ${this.config.roverUrl}`);

        try {
            this.ws = new WebSocket(this.config.roverUrl);

            this.ws.on('open', () => {
                console.log('✅ CONNEXION ÉTABLIE avec le rover');
                this.connectionAttempts = 0;
                this.setupPingTimer();
                this.clearReconnectTimer();

                // Réinitialiser la carte si c'est la première connexion
                if (this.isFirstConnection) {
                    this.resetMarsMap();
                    this.isFirstConnection = false;
                }
            });

            this.ws.on('message', (data: Buffer) => {
                try {
                    const message: MarsRoverMessage = JSON.parse(data.toString());
                    this.handleRoverMessage(message);
                } catch (error) {
                    console.error('❌ Erreur parsing message rover:', error);
                }
            });            this.ws.on('close', () => {
                console.log('🔌 Connexion rover fermée');
                this.roverState = null;
                this.clearPingTimer();
                this.scheduleReconnect();
                // Marquer qu'il faut réinitialiser la map à la prochaine connexion
                this.isFirstConnection = true;
            });

            this.ws.on('error', (error) => {
                console.error('❌ Erreur connexion rover:', error.message);
                this.roverState = null;
                this.scheduleReconnect();
                // Marquer qu'il faut réinitialiser la map à la prochaine connexion
                this.isFirstConnection = true;
            });

        } catch (error) {
            console.error('❌ Impossible de se connecter:', error);
            this.scheduleReconnect();
        }
    }

    /**
     * Traite les messages du rover
     */
    private handleRoverMessage(message: MarsRoverMessage): void {
        switch (message.type) {
            case 'STATUS':
                this.handleStatusUpdate(message as StatusMessage);
                break;
            case 'COMMAND_RESPONSE':
                this.handleCommandResponse(message as CommandResponseMessage);
                break;
            case 'OBSTACLE_DISCOVERED':
                this.handleObstacleDiscovery(message as ObstacleDiscoveryMessage);
                break;
            case 'PONG':
                // Rover toujours vivant
                break;
            default:
                console.log(`📨 Message rover reçu: ${message.type}`);
        }
    }    /**
     * Traite les mises à jour de statut
     */    private handleStatusUpdate(status: StatusMessage): void {
        // Afficher info du rover si c'est la première status update
        if (!this.roverState) {
            console.log(`🚀 Rover connecté: ${status.payload.roverId}`);
        }

        // Sauvegarder l'ancienne position pour tracer le chemin
        const oldPosition = this.roverState?.position;

        this.roverState = {
            roverId: status.payload.roverId,
            position: status.payload.position,
            direction: status.payload.direction,
            battery: status.payload.battery,
            state: status.payload.state,
            lastContact: Date.now(),
            connected: true
        };

        // Si on avait une ancienne position et qu'elle est différente, tracer le chemin
        if (oldPosition &&
            (oldPosition.x !== status.payload.position.x || oldPosition.y !== status.payload.position.y)) {
            this.traceRoverPath(oldPosition, status.payload.position);
        }

        // Marquer la position comme explorée
        const posKey = `${status.payload.position.x},${status.payload.position.y}`;
        this.marsMap.exploredTerrain.add(posKey);

        console.log(`📊 Statut rover mis à jour: (${status.payload.position.x}, ${status.payload.position.y}) ${status.payload.direction} - ${status.payload.battery}%`);
    }/**
     * Traite les réponses de commandes
     */
    private handleCommandResponse(response: CommandResponseMessage): void {
        console.log(`🎮 Réponse commande: ${response.payload.success ? '✅' : '❌'} ${response.payload.message}`);

        // Note: Le traçage du chemin est maintenant géré dans handleStatusUpdate()
        // qui reçoit les mises à jour de position en temps réel
    }    /**
     * Trace le chemin du rover entre deux positions en utilisant l'algorithme de Bresenham
     */
    private traceRoverPath(startPos: Position, endPos: Position): void {
        const path = this.getLinePath(startPos, endPos);

        for (const pos of path) {
            const posKey = `${pos.x},${pos.y}`;
            this.marsMap.exploredTerrain.add(posKey);
        }

        console.log(`🗺️ Chemin tracé de (${startPos.x},${startPos.y}) à (${endPos.x},${endPos.y}) - ${path.length} cases explorées`);
    }

    /**
     * Calcule le chemin en ligne droite entre deux positions (algorithme de Bresenham)
     */
    private getLinePath(start: Position, end: Position): Position[] {
        const path: Position[] = [];

        let x0 = start.x;
        let y0 = start.y;
        const x1 = end.x;
        const y1 = end.y;

        const dx = Math.abs(x1 - x0);
        const dy = Math.abs(y1 - y0);
        const sx = x0 < x1 ? 1 : -1;
        const sy = y0 < y1 ? 1 : -1;
        let err = dx - dy;

        while (true) {
            path.push({ x: x0, y: y0 });

            if (x0 === x1 && y0 === y1) break;

            const e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x0 += sx;
            }
            if (e2 < dx) {
                err += dx;
                y0 += sy;
            }
        }

        return path;
    }

    /**
     * Traite les découvertes d'obstacles
     */
    private handleObstacleDiscovery(discovery: ObstacleDiscoveryMessage): void {
        const obstacle = discovery.payload.position;

        // Vérifier si l'obstacle n'est pas déjà connu
        const exists = this.marsMap.knownObstacles.some(
            obs => obs.x === obstacle.x && obs.y === obstacle.y
        );

        if (!exists) {
            this.marsMap.knownObstacles.push(obstacle);
            console.log(`🚧 NOUVEL OBSTACLE découvert en (${obstacle.x}, ${obstacle.y})`);
            console.log(`📈 Total obstacles connus: ${this.marsMap.knownObstacles.length}`);
        }
    }

    /**
     * Envoie une commande au rover
     */
    sendCommand(commands: string[]): boolean {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            console.error('❌ Pas de connexion avec le rover');
            return false;
        }

        const commandMessage: CommandMessage = {
            id: MessageIdGenerator.generate(),
            type: 'COMMAND',
            payload: {
                commands: commands as any[]
            },
            timestamp: Date.now(),
            source: 'mission-control'
        };

        this.ws.send(JSON.stringify(commandMessage));
        console.log(`📤 Commande envoyée: ${commands.join('')}`);
        return true;
    }

    /**
     * Ping du rover
     */
    private pingRover(): void {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            return;
        }

        const ping: PingMessage = {
            id: MessageIdGenerator.generate(),
            type: 'PING',
            payload: {},
            timestamp: Date.now(),
            source: 'mission-control'
        };

        this.ws.send(JSON.stringify(ping));
    }

    /**
     * Configuration timer de ping
     */
    private setupPingTimer(): void {
        this.clearPingTimer();
        this.pingTimer = setInterval(() => {
            this.pingRover();
        }, this.config.pingInterval);
    }

    /**
     * Nettoyage timer de ping
     */
    private clearPingTimer(): void {
        if (this.pingTimer) {
            clearInterval(this.pingTimer);
            this.pingTimer = null;
        }
    }

    /**
     * Programme une reconnexion
     */
    private scheduleReconnect(): void {
        this.clearReconnectTimer();
        this.reconnectTimer = setTimeout(() => {
            this.connectToRover();
        }, this.config.reconnectInterval);
    }

    /**
     * Nettoyage timer de reconnexion
     */
    private clearReconnectTimer(): void {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
    }

    /**
     * Réinitialise la carte de Mars
     */
    private resetMarsMap(): void {
        this.marsMap.exploredTerrain.clear();
        this.marsMap.knownObstacles = [];
        console.log('🗺️ Carte Mars réinitialisée - Nouveau rover détecté');
    }

    /**
     * Affiche la carte de Mars
     */    displayMarsMap(): void {
        console.log('\\n🗺️  === CARTE DE MARS ===');
        console.log(`Taille: ${this.marsMap.width}x${this.marsMap.height}`);
        console.log(`Terrain exploré: ${this.marsMap.exploredTerrain.size} cases`);
        console.log(`Obstacles connus: ${this.marsMap.knownObstacles.length}`);

        // En-tête des colonnes
        let header = '   ';
        for (let x = 0; x < this.marsMap.width; x++) {
            header += `${x}`.padStart(2);
        }
        console.log(header);

        // Lignes de la carte
        for (let y = 0; y < this.marsMap.height; y++) {
            let line = `${y}`.padStart(2) + ' ';

            for (let x = 0; x < this.marsMap.width; x++) {
                const posKey = `${x},${y}`;
                let symbol = '?'; // Inexploré

                // Rover actuel
                if (this.roverState && this.roverState.position.x === x && this.roverState.position.y === y) {
                    symbol = this.getDirectionSymbol(this.roverState.direction);
                }
                // Obstacle connu
                else if (this.marsMap.knownObstacles.some(obs => obs.x === x && obs.y === y)) {
                    symbol = '#';
                }
                // Terrain exploré
                else if (this.marsMap.exploredTerrain.has(posKey)) {
                    symbol = '.';
                }

                line += `${symbol} `;
            }
            console.log(line);
        }
        console.log();
    }

    /**
     * Symbole de direction
     */
    private getDirectionSymbol(direction: Direction): string {
        switch (direction) {
            case 'NORTH': return '^';
            case 'SOUTH': return 'v';
            case 'EAST': return '>';
            case 'WEST': return '<';
        }
    }

    /**
     * Obtient le statut de la mission
     */
    getMissionStatus(): {
        connected: boolean;
        rover: RoverState | null;
        map: {
            exploredArea: number;
            totalArea: number;
            explorationPercentage: number;
            obstaclesFound: number;
        };
    } {
        const totalArea = this.marsMap.width * this.marsMap.height;
        const exploredArea = this.marsMap.exploredTerrain.size;

        return {
            connected: this.ws?.readyState === WebSocket.OPEN || false,
            rover: this.roverState,
            map: {
                exploredArea,
                totalArea,
                explorationPercentage: Math.round((exploredArea / totalArea) * 100),
                obstaclesFound: this.marsMap.knownObstacles.length
            }
        };
    }

    /**
     * Arrêt de Mission Control
     */
    stop(): void {
        console.log('🛑 Arrêt de Mission Control');
        this.clearPingTimer();
        this.clearReconnectTimer();

        if (this.ws) {
            this.ws.close();
        }
    }
}
