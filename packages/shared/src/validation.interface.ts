/**
 * Interface pour la validation des données
 */
export interface IValidator<T> {
    /**
     * Valide un objet selon les règles définies
     */
    validate(data: T): IValidationResult;

    /**
     * Valide et lance une exception si invalide
     */
    validateOrThrow(data: T): void;

    /**
     * Retourne les règles de validation
     */
    getRules(): readonly IValidationRule[];
}

/**
 * Résultat d'une validation
 */
export interface IValidationResult {
    readonly isValid: boolean;
    readonly errors: readonly IValidationError[];
    readonly warnings?: readonly IValidationWarning[];
}

/**
 * Erreur de validation
 */
export interface IValidationError {
    readonly field: string;
    readonly message: string;
    readonly code: string;
    readonly value?: any;
}

/**
 * Avertissement de validation
 */
export interface IValidationWarning {
    readonly field: string;
    readonly message: string;
    readonly value?: any;
}

/**
 * Règle de validation
 */
export interface IValidationRule {
    readonly field: string;
    readonly type: 'required' | 'range' | 'pattern' | 'custom';
    readonly params?: any;
    readonly message?: string;
}
