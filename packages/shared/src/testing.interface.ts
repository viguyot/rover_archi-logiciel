import { RoverState, Command, Position } from '@mars-rover/shared';

/**
 * Interface pour les scénarios de test
 */
export interface ITestScenario {
    /**
     * Nom du scénario
     */
    readonly name: string;

    /**
     * Description du test
     */
    readonly description: string;

    /**
     * État initial du rover
     */
    readonly initialState: RoverState;

    /**
     * Commandes à exécuter
     */
    readonly commands: readonly Command[];

    /**
     * État final attendu
     */
    readonly expectedFinalState: RoverState;

    /**
     * Obstacles présents pour ce test
     */
    readonly obstacles?: readonly Position[];

    /**
     * Indique si le rover doit être bloqué
     */
    readonly shouldBeBlocked?: boolean;
}

/**
 * Interface pour l'exécuteur de tests
 */
export interface ITestRunner {
    /**
     * Exécute un scénario de test
     */
    runScenario(scenario: ITestScenario): Promise<ITestResult>;

    /**
     * Exécute une suite de tests
     */
    runTestSuite(scenarios: readonly ITestScenario[]): Promise<ITestSuiteResult>;

    /**
     * Génère des tests aléatoires
     */
    generateRandomTests(count: number): readonly ITestScenario[];
}

/**
 * Résultat d'un test individuel
 */
export interface ITestResult {
    readonly scenario: ITestScenario;
    readonly success: boolean;
    readonly actualFinalState: RoverState;
    readonly executionTime: number;
    readonly error?: string;
}

/**
 * Résultat d'une suite de tests
 */
export interface ITestSuiteResult {
    readonly results: readonly ITestResult[];
    readonly totalTests: number;
    readonly passedTests: number;
    readonly failedTests: number;
    readonly totalTime: number;
}
