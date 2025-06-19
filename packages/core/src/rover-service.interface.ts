import { TcpMessage, RoverState } from '@mars-rover/shared';

/**
 * Interface pour le service de communication TCP avec le Rover
 */
export interface IRoverService {
    /**
     * Se connecte au rover distant
     */
    connect(host: string, port: number): Promise<void>;

    /**
     * Se déconnecte du rover
     */
    disconnect(): Promise<void>;

    /**
     * Envoie un message au rover et attend la réponse
     */
    sendMessage(message: TcpMessage): Promise<TcpMessage>;

    /**
     * Vérifie si la connexion est active
     */
    isConnected(): boolean;

    /**
     * Configure le timeout pour les requêtes
     */
    setTimeout(timeoutMs: number): void;

    /**
     * Envoie une séquence de commandes au rover
     */
    sendCommands(commands: string): Promise<RoverState>;
}

/**
 * Interface pour le serveur TCP du Rover
 */
export interface IRoverTcpServer {
    /**
     * Démarre le serveur TCP
     */
    start(port: number): Promise<void>;

    /**
     * Arrête le serveur TCP
     */
    stop(): Promise<void>;

    /**
     * Vérifie si le serveur est en cours d'exécution
     */
    isRunning(): boolean;

    /**
     * Configure le gestionnaire de messages
     */
    setMessageHandler(handler: (message: TcpMessage) => Promise<TcpMessage>): void;
}
