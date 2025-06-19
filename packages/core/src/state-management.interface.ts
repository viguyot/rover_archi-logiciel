/**
 * Interface pour la gestion d'état globale du système
 */
export interface IStateManager<T> {
    /**
     * Obtient l'état actuel
     */
    getState(): T;

    /**
     * Met à jour l'état
     */
    setState(newState: Partial<T>): void;

    /**
     * S'abonne aux changements d'état
     */
    subscribe(callback: (state: T, previousState: T) => void): string;

    /**
     * Se désabonne des changements d'état
     */
    unsubscribe(subscriptionId: string): void;

    /**
     * Réinitialise l'état à sa valeur par défaut
     */
    reset(): void;

    /**
     * Retourne l'historique des états
     */
    getHistory(limit?: number): readonly T[];
}

/**
 * Interface pour la persistance d'état
 */
export interface IStatePersistence<T> {
    /**
     * Sauvegarde l'état
     */
    save(state: T): Promise<void>;

    /**
     * Charge l'état
     */
    load(): Promise<T | null>;

    /**
     * Supprime l'état sauvegardé
     */
    clear(): Promise<void>;

    /**
     * Vérifie si un état sauvegardé existe
     */
    exists(): Promise<boolean>;
}
