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
            });

            this.ws.on('message', (data: Buffer) => {
                try {
                    const message: MarsRoverMessage = JSON.parse(data.toString());
                    this.handleRoverMessage(message);
                } catch (error) {
                    console.error('❌ Erreur parsing message rover:', error);
                }
            });

            this.ws.on('close', () => {
                console.log('🔌 Connexion rover fermée');
                this.roverState = null;
                this.clearPingTimer();
                this.scheduleReconnect();
            });

            this.ws.on('error', (error) => {
                console.error('❌ Erreur connexion rover:', error.message);
                this.roverState = null;
                this.scheduleReconnect();
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
        this.roverState = {
            roverId: status.payload.roverId,
            position: status.payload.position,
            direction: status.payload.direction,
            battery: status.payload.battery,
            state: status.payload.state,
            lastContact: Date.now(),
            connected: true
        };

        // Marquer la position actuelle comme explorée
        const posKey = `${status.payload.position.x},${status.payload.position.y}`;
        this.marsMap.exploredTerrain.add(posKey);

        console.log(`📊 Statut rover mis à jour: (${status.payload.position.x}, ${status.payload.position.y}) ${status.payload.direction} - ${status.payload.battery}%`);
    }/**
     * Traite les réponses de commandes
     */
    private handleCommandResponse(response: CommandResponseMessage): void {
        console.log(`🎮 Réponse commande: ${response.payload.success ? '✅' : '❌'} ${response.payload.message}`);

        // Si le rover a envoyé le chemin réel parcouru, utilisons-le pour mettre à jour la carte
        if (response.payload.pathTaken && response.payload.pathTaken.length > 0) {
            console.log(`🗺️ Mise à jour carte avec chemin réel: ${response.payload.pathTaken.length} positions`);

            for (const pos of response.payload.pathTaken) {
                const posKey = `${pos.x},${pos.y}`;
                this.marsMap.exploredTerrain.add(posKey);
            }

            console.log(`🛤️ Chemin exploré: ${response.payload.pathTaken.map(p => `(${p.x},${p.y})`).join(' → ')}`);
        }
    }/**
     * Trace le chemin du rover entre deux positions en utilisant l'algorithme de Bresenham
     */
    private traceRoverPath(startPos: Position, endPos: Position): void {
        const path = this.getLinePath(startPos, endPos);

        for (const pos of path) {
            const posKey = `${pos.x},${pos.y}`;
            this.marsMap.exploredTerrain.add(posKey);
        }

        console.log(`🗺️ Chemin tracé de (${startPos.x},${startPos.y}) à (${endPos.x},${endPos.y}) - ${path.length} cases explorées`);
    }    /**
     * Calcule le chemin en ligne droite entre deux positions sur une carte toroïdale
     */
    private getLinePath(start: Position, end: Position): Position[] {
        const path: Position[] = [];

        // Calculer les distances directe et "wrappée" pour chaque axe
        const directDx = end.x - start.x;
        const directDy = end.y - start.y;

        // Distance avec wrapping
        const wrapDx = directDx > 0 ? directDx - this.marsMap.width : directDx + this.marsMap.width;
        const wrapDy = directDy > 0 ? directDy - this.marsMap.height : directDy + this.marsMap.height;

        // Choisir le chemin le plus court pour chaque axe
        const dx = Math.abs(directDx) <= Math.abs(wrapDx) ? directDx : wrapDx;
        const dy = Math.abs(directDy) <= Math.abs(wrapDy) ? directDy : wrapDy;

        // Tracer le chemin avec l'algorithme de Bresenham modifié pour le toroïdale
        let x0 = start.x;
        let y0 = start.y;
        const steps = Math.max(Math.abs(dx), Math.abs(dy));

        if (steps === 0) {
            path.push({ x: x0, y: y0 });
            return path;
        }

        const stepX = dx === 0 ? 0 : dx / Math.abs(dx);
        const stepY = dy === 0 ? 0 : dy / Math.abs(dy);

        for (let i = 0; i <= steps; i++) {
            path.push({ x: x0, y: y0 });

            if (i < steps) {
                if (Math.abs(dx) > Math.abs(dy)) {
                    x0 = (x0 + stepX + this.marsMap.width) % this.marsMap.width;
                    if (i * Math.abs(dy) >= (i + 1) * Math.abs(dx) / 2) {
                        y0 = (y0 + stepY + this.marsMap.height) % this.marsMap.height;
                    }
                } else {
                    y0 = (y0 + stepY + this.marsMap.height) % this.marsMap.height;
                    if (i * Math.abs(dx) >= (i + 1) * Math.abs(dy) / 2) {
                        x0 = (x0 + stepX + this.marsMap.width) % this.marsMap.width;
                    }
                }
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
