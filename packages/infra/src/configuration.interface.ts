/**
 * Interface pour la gestion de la configuration
 */
export interface IConfigurationManager {
    /**
     * Charge la configuration depuis un fichier
     */
    loadConfiguration(configPath?: string): Promise<IRoverConfiguration>;

    /**
     * Valide une configuration
     */
    validateConfiguration(config: IRoverConfiguration): boolean;

    /**
     * Sauvegarde la configuration actuelle
     */
    saveConfiguration(config: IRoverConfiguration, configPath?: string): Promise<void>;

    /**
     * Retourne la configuration par défaut
     */
    getDefaultConfiguration(): IRoverConfiguration;
}

/**
 * Interface détaillée pour la configuration complète
 */
export interface IRoverConfiguration {
    // Configuration serveur
    server: {
        port: number;
        host?: string;
        timeout: number;
        maxConnections?: number;
    };

    // Configuration planète
    planet: {
        width: number;
        height: number;
        topology: 'toroidal' | 'bounded';
    };

    // Position initiale du rover
    initialState: {
        position: { x: number; y: number };
        direction: 'N' | 'E' | 'S' | 'W';
    };

    // Configuration sécurité
    security: {
        hmacKey: string;
        algorithm: 'sha256' | 'sha512';
        enableAuthentication: boolean;
    };

    // Configuration obstacles
    obstacles: {
        predefined: Array<{ x: number; y: number; type: string }>;
        randomCount?: number;
        allowDynamic?: boolean;
    };

    // Configuration logging
    logging: {
        level: 'debug' | 'info' | 'warn' | 'error';
        enableConsole: boolean;
        enableFile?: boolean;
        filePath?: string;
    };
}
