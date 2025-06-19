import { Command, TcpMessage, RoverState } from '@mars-rover/shared';

/**
 * Interface pour le dispatcheur de commandes du Rover
 */
export interface ICommandDispatcher {
    /**
     * Traite un message reçu via TCP
     * @param message Message TCP reçu
     * @returns Réponse à envoyer au client
     */
    dispatch(message: TcpMessage): Promise<TcpMessage>;

    /**
     * Vérifie si une commande est valide
     */
    isValidCommand(command: Command): boolean;

    /**
     * Traite une séquence de commandes
     */
    processCommandSequence(commands: readonly Command[], sequenceId: string): Promise<TcpMessage>;
}
