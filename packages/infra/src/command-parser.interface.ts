import { Command } from '@mars-rover/shared';

/**
 * Interface pour le parser de commandes
 */
export interface ICommandParser {
    /**
     * Parse une chaîne de commandes en tableau de Command
     * @param input Chaîne d'entrée (ex: "FFLR")
     * @returns Tableau de commandes valides
     */
    parse(input: string): readonly Command[];

    /**
     * Valide qu'une chaîne ne contient que des commandes valides
     */
    validate(input: string): boolean;

    /**
     * Nettoie et normalise une chaîne de commandes
     */
    normalize(input: string): string;

    /**
     * Retourne la liste des commandes supportées
     */
    getSupportedCommands(): readonly Command[];
}
