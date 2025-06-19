/**
 * Interface principale pour le serveur Rover
 */
export interface IRoverServer {
    /**
     * Démarre le serveur rover
     */
    start(port: number): Promise<void>;

    /**
     * Arrête le serveur rover
     */
    stop(): Promise<void>;

    /**
     * Vérifie si le serveur est en cours d'exécution
     */
    isRunning(): boolean;

    /**
     * Configure les paramètres de la planète
     */
    configurePlanet(width: number, height: number): void;

    /**
     * Charge la configuration des obstacles
     */
    loadObstacles(obstacleConfig: string): Promise<void>;
}

/**
 * Interface pour la configuration du rover
 */
export interface IRoverConfiguration {
    /**
     * Port d'écoute TCP
     */
    readonly port: number;

    /**
     * Dimensions de la planète
     */
    readonly planetDimensions: { width: number; height: number };

    /**
     * Position initiale du rover
     */
    readonly initialPosition: { x: number; y: number; direction: string };

    /**
     * Clé HMAC pour la sécurité
     */
    readonly hmacKey: string;

    /**
     * Timeout pour les connexions TCP
     */
    readonly tcpTimeout: number;

    /**
     * Configuration des obstacles
     */
    readonly obstacles: readonly { x: number; y: number; type: string }[];
}
