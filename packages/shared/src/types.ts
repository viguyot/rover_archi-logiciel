/**
 * Types et enums partagés pour le système Mars Rover
 */

// === ENUMS ===

export enum Direction {
    NORTH = 'N',
    EAST = 'E',
    SOUTH = 'S',
    WEST = 'W'
}

export enum Command {
    FORWARD = 'F',
    BACKWARD = 'B',
    LEFT = 'L',
    RIGHT = 'R'
}

export enum MessageType {
    COMMAND = 'COMMAND',
    STATE_UPDATE = 'STATE_UPDATE',
    ERROR = 'ERROR',
    STOP = 'STOP'
}

// === TYPES DE BASE ===

export interface Position {
    readonly x: number;
    readonly y: number;
}

export interface Dimensions {
    readonly width: number;
    readonly height: number;
}

export interface RoverState {
    readonly position: Position;
    readonly direction: Direction;
    readonly isBlocked: boolean;
    readonly lastCommand?: Command;
}

export interface Obstacle {
    readonly position: Position;
    readonly type: string;
}

// === MESSAGES TCP ===

export interface BaseMessage {
    readonly type: MessageType;
    readonly timestamp: number;
    readonly hmac?: string;
}

export interface CommandMessage extends BaseMessage {
    readonly type: MessageType.COMMAND;
    readonly commands: readonly Command[];
    readonly sequenceId: string;
}

export interface StateUpdateMessage extends BaseMessage {
    readonly type: MessageType.STATE_UPDATE;
    readonly roverState: RoverState;
    readonly sequenceId: string;
    readonly obstacleDetected?: Obstacle;
}

export interface ErrorMessage extends BaseMessage {
    readonly type: MessageType.ERROR;
    readonly error: string;
    readonly sequenceId?: string;
}

export interface StopMessage extends BaseMessage {
    readonly type: MessageType.STOP;
    readonly reason: string;
    readonly sequenceId: string;
    readonly finalState: RoverState;
}

export type TcpMessage = CommandMessage | StateUpdateMessage | ErrorMessage | StopMessage;
