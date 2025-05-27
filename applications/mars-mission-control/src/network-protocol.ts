/**
 * Protocol de communication Mars Rover
 * Types partagés pour la communication réseau uniquement
 */

// ============= TYPES DE BASE =============
export interface Position {
    x: number;
    y: number;
}

export type Direction = 'NORTH' | 'SOUTH' | 'EAST' | 'WEST';
export type Command = 'Z' | 'S' | 'Q' | 'D';

// ============= MESSAGES RÉSEAU =============
export interface NetworkMessage {
    id: string;
    type: string;
    payload: any;
    timestamp: number;
    source: string;
}

export interface CommandMessage extends NetworkMessage {
    type: 'COMMAND';
    payload: {
        commands: Command[];
    };
}

export interface StatusMessage extends NetworkMessage {
    type: 'STATUS';
    payload: {
        roverId: string;
        position: Position;
        direction: Direction;
        battery: number;
        state: 'ACTIVE' | 'INACTIVE' | 'ERROR';
    };
}

export interface ObstacleDiscoveryMessage extends NetworkMessage {
    type: 'OBSTACLE_DISCOVERED';
    payload: {
        position: Position;
        discoveredAt: number;
    };
}

export interface CommandResponseMessage extends NetworkMessage {
    type: 'COMMAND_RESPONSE';
    payload: {
        success: boolean;
        message: string;
        finalPosition: Position;
        finalDirection: Direction;
        obstacleDetected?: Position;
        pathTaken?: Position[]; // Chemin réel pris par le rover
    };
}

export interface PingMessage extends NetworkMessage {
    type: 'PING';
    payload: {};
}

export interface PongMessage extends NetworkMessage {
    type: 'PONG';
    payload: {
        status: 'alive';
    };
}

export interface ErrorMessage extends NetworkMessage {
    type: 'ERROR';
    payload: {
        error: string;
    };
}

// Union de tous les types de messages
export type MarsRoverMessage =
    | CommandMessage
    | StatusMessage
    | ObstacleDiscoveryMessage
    | CommandResponseMessage
    | PingMessage
    | PongMessage
    | ErrorMessage;

// ============= UTILITAIRES =============
export class MessageIdGenerator {
    private static counter = 0;

    static generate(): string {
        return `msg-${Date.now()}-${++this.counter}`;
    }
}
