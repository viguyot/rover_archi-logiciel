/**
 * Interface pour la gestion des logs
 */
export interface ILogger {
    /**
     * Log de niveau debug
     */
    debug(message: string, meta?: any): void;

    /**
     * Log de niveau info
     */
    info(message: string, meta?: any): void;

    /**
     * Log de niveau warning
     */
    warn(message: string, meta?: any): void;

    /**
     * Log de niveau error
     */
    error(message: string, error?: Error, meta?: any): void;

    /**
     * Configure le niveau de log
     */
    setLevel(level: 'debug' | 'info' | 'warn' | 'error'): void;

    /**
     * Active/désactive la sortie console
     */
    enableConsole(enabled: boolean): void;

    /**
     * Configure la sortie fichier
     */
    configureFile(filePath: string, enabled: boolean): void;
}

/**
 * Interface pour les métriques et monitoring
 */
export interface IMetricsCollector {
    /**
     * Incrémente un compteur
     */
    incrementCounter(name: string, value?: number, tags?: Record<string, string>): void;

    /**
     * Enregistre une métrique de timing
     */
    recordTiming(name: string, value: number, tags?: Record<string, string>): void;

    /**
     * Enregistre une gauge (valeur instantanée)
     */
    recordGauge(name: string, value: number, tags?: Record<string, string>): void;

    /**
     * Démarre un timer pour mesurer la durée d'une opération
     */
    startTimer(name: string): () => void;

    /**
     * Retourne les métriques collectées
     */
    getMetrics(): Record<string, any>;

    /**
     * Remet à zéro les métriques
     */
    reset(): void;
}
