import { RoverState, Position, Command } from '@mars-rover/shared';

/**
 * Types d'événements dans le système
 */
export enum EventType {
    ROVER_MOVED = 'rover.moved',
    OBSTACLE_DETECTED = 'obstacle.detected',
    COMMAND_RECEIVED = 'command.received',
    COMMAND_EXECUTED = 'command.executed',
    CONNECTION_ESTABLISHED = 'connection.established',
    CONNECTION_LOST = 'connection.lost',
    ERROR_OCCURRED = 'error.occurred'
}

/**
 * Interface de base pour tous les événements
 */
export interface IBaseEvent {
    readonly type: EventType;
    readonly timestamp: number;
    readonly source: string;
    readonly metadata?: Record<string, any>;
}

/**
 * Événement de mouvement du rover
 */
export interface IRoverMovedEvent extends IBaseEvent {
    readonly type: EventType.ROVER_MOVED;
    readonly previousState: RoverState;
    readonly newState: RoverState;
    readonly command: Command;
}

/**
 * Événement de détection d'obstacle
 */
export interface IObstacleDetectedEvent extends IBaseEvent {
    readonly type: EventType.OBSTACLE_DETECTED;
    readonly roverState: RoverState;
    readonly obstaclePosition: Position;
    readonly attemptedCommand: Command;
}

/**
 * Événement de réception de commande
 */
export interface ICommandReceivedEvent extends IBaseEvent {
    readonly type: EventType.COMMAND_RECEIVED;
    readonly commands: readonly Command[];
    readonly sequenceId: string;
}

/**
 * Union de tous les types d'événements
 */
export type SystemEvent = IRoverMovedEvent | IObstacleDetectedEvent | ICommandReceivedEvent;

/**
 * Interface pour le gestionnaire d'événements
 */
export interface IEventBus {
    /**
     * Émet un événement
     */
    emit<T extends SystemEvent>(event: T): void;

    /**
     * S'abonne à un type d'événement
     */
    subscribe<T extends SystemEvent>(
        eventType: EventType,
        handler: (event: T) => void | Promise<void>
    ): string;

    /**
     * Se désabonne d'un événement
     */
    unsubscribe(subscriptionId: string): void;

    /**
     * Se désabonne de tous les événements d'un type
     */
    unsubscribeAll(eventType: EventType): void;

    /**
     * Retourne l'historique des événements
     */
    getEventHistory(limit?: number): readonly SystemEvent[];

    /**
     * Vide l'historique des événements
     */
    clearHistory(): void;
}
