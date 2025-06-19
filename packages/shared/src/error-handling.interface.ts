/**
 * Types d'erreurs dans le système
 */
export enum ErrorType {
    VALIDATION_ERROR = 'validation',
    NETWORK_ERROR = 'network',
    AUTHENTICATION_ERROR = 'authentication',
    ROVER_ERROR = 'rover',
    CONFIGURATION_ERROR = 'configuration',
    SYSTEM_ERROR = 'system'
}

/**
 * Sévérité des erreurs
 */
export enum ErrorSeverity {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical'
}

/**
 * Interface pour les erreurs structurées du système
 */
export interface ISystemError extends Error {
    readonly type: ErrorType;
    readonly severity: ErrorSeverity;
    readonly code: string;
    readonly timestamp: number;
    readonly context?: Record<string, any>;
    readonly retryable: boolean;
}

/**
 * Interface pour la gestion des erreurs
 */
export interface IErrorHandler {
    /**
     * Traite une erreur
     */
    handle(error: ISystemError): Promise<void>;

    /**
     * Détermine si une erreur est récupérable
     */
    isRecoverable(error: ISystemError): boolean;

    /**
     * Tente de récupérer d'une erreur
     */
    recover(error: ISystemError): Promise<boolean>;

    /**
     * Enregistre une erreur pour analyse
     */
    logError(error: ISystemError): void;
}

/**
 * Interface pour la stratégie de retry
 */
export interface IRetryStrategy {
    /**
     * Détermine si on doit réessayer
     */
    shouldRetry(error: ISystemError, attemptNumber: number): boolean;

    /**
     * Calcule le délai avant le prochain essai
     */
    getRetryDelay(attemptNumber: number): number;

    /**
     * Nombre maximum de tentatives
     */
    readonly maxAttempts: number;
}

/**
 * Interface pour le circuit breaker
 */
export interface ICircuitBreaker {
    /**
     * Exécute une fonction avec protection circuit breaker
     */
    execute<T>(fn: () => Promise<T>): Promise<T>;

    /**
     * État actuel du circuit breaker
     */
    readonly state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';

    /**
     * Réinitialise le circuit breaker
     */
    reset(): void;

    /**
     * Force l'ouverture du circuit
     */
    forceOpen(): void;
}
