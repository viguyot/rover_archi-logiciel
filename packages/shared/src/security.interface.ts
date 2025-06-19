import { TcpMessage } from './types';

/**
 * Interface pour la sécurité HMAC
 */
export interface ISecurityService {
    /**
     * Génère un HMAC pour un message
     */
    generateHmac(message: string): string;

    /**
     * Vérifie un HMAC pour un message
     */
    verifyHmac(message: string, hmac: string): boolean;

    /**
     * Signe un message TCP avec HMAC
     */
    signMessage(message: Omit<TcpMessage, 'hmac'>): TcpMessage;

    /**
     * Vérifie la signature d'un message TCP
     */
    verifyMessage(message: TcpMessage): boolean;
}
