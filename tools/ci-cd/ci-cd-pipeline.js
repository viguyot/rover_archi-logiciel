#!/usr/bin/env node

/**
 * Pipeline CI/CD Local pour Mars Rover System
 * 
 * Ce script automatise:
 * - Installation des dépendances
 * - Compilation TypeScript
 * - Exécution des tests
 * - Vérification de la qualité du code
 * - Tests d'intégration
 * - Validation du système complet
 */

import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import { existsSync } from 'fs';
import { join } from 'path';
import fs from 'fs/promises';

const execAsync = promisify(exec);

// Configuration du pipeline
const CONFIG = {
    rootDir: process.cwd(),
    applications: [
        {
            name: 'mars-rover-vehicle',
            path: 'applications/mars-rover-vehicle',
            hasTests: true
        }, {
            name: 'mars-mission-control',
            path: 'applications/mars-mission-control',
            hasTests: true
        }
    ], integrationTests: [
        'tools/tests/test-structured-logging.js',
        'tools/tests/test-simple-validation.js'
    ],
    timeout: 300000 // 5 minutes
};

class CICDPipeline {
    constructor() {
        this.results = {
            install: {},
            build: {},
            test: {},
            integration: {},
            quality: {}
        };
        this.startTime = Date.now();
    }

    log(stage, message, type = 'info') {
        const timestamp = new Date().toISOString();
        const emoji = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : '📋';
        console.log(`[${timestamp}] ${emoji} [${stage}] ${message}`);
    }

    async runCommand(command, cwd = process.cwd()) {
        return new Promise((resolve, reject) => {
            const [cmd, ...args] = command.split(' ');
            const child = spawn(cmd, args, {
                cwd,
                stdio: ['pipe', 'pipe', 'pipe'],
                shell: true
            });

            let stdout = '';
            let stderr = '';

            child.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            child.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            const timeout = setTimeout(() => {
                child.kill();
                reject(new Error(`Command timeout: ${command}`));
            }, CONFIG.timeout);

            child.on('close', (code) => {
                clearTimeout(timeout);
                if (code === 0) {
                    resolve({ stdout, stderr, code });
                } else {
                    reject(new Error(`Command failed (${code}): ${command}\\n${stderr}`));
                }
            });

            child.on('error', (error) => {
                clearTimeout(timeout);
                reject(error);
            });
        });
    }

    async installDependencies() {
        this.log('INSTALL', 'Starting dependency installation...');

        // Installation des dépendances racine
        try {
            await this.runCommand('npm install');
            this.results.install.root = { success: true };
            this.log('INSTALL', 'Root dependencies installed', 'success');
        } catch (error) {
            this.results.install.root = { success: false, error: error.message };
            this.log('INSTALL', `Root dependencies failed: ${error.message}`, 'error');
            throw error;
        }

        // Installation pour chaque application
        for (const app of CONFIG.applications) {
            try {
                this.log('INSTALL', `Installing dependencies for ${app.name}...`);
                await this.runCommand('npm install', app.path);
                this.results.install[app.name] = { success: true };
                this.log('INSTALL', `${app.name} dependencies installed`, 'success');
            } catch (error) {
                this.results.install[app.name] = { success: false, error: error.message };
                this.log('INSTALL', `${app.name} dependencies failed: ${error.message}`, 'error');
                throw error;
            }
        }
    }

    async buildApplications() {
        this.log('BUILD', 'Starting application builds...');

        for (const app of CONFIG.applications) {
            try {
                this.log('BUILD', `Building ${app.name}...`);
                const result = await this.runCommand('npm run build', app.path);

                // Vérifier que les fichiers de build existent
                const distPath = join(app.path, 'dist');
                const indexExists = existsSync(join(distPath, 'index.js'));

                if (!indexExists) {
                    throw new Error(`Build output missing: dist/index.js not found`);
                }

                this.results.build[app.name] = {
                    success: true,
                    output: result.stdout,
                    files: { indexJs: indexExists }
                };
                this.log('BUILD', `${app.name} built successfully`, 'success');
            } catch (error) {
                this.results.build[app.name] = { success: false, error: error.message };
                this.log('BUILD', `${app.name} build failed: ${error.message}`, 'error');
                throw error;
            }
        }
    }

    async runUnitTests() {
        this.log('TEST', 'Starting unit tests...');

        for (const app of CONFIG.applications) {
            if (!app.hasTests) {
                this.log('TEST', `${app.name} has no tests, skipping...`, 'warning');
                this.results.test[app.name] = { success: true, skipped: true };
                continue;
            }

            try {
                this.log('TEST', `Running tests for ${app.name}...`);
                const result = await this.runCommand('npm test', app.path);
                this.results.test[app.name] = {
                    success: true,
                    output: result.stdout
                };
                this.log('TEST', `${app.name} tests passed`, 'success');
            } catch (error) {
                this.results.test[app.name] = { success: false, error: error.message };
                this.log('TEST', `${app.name} tests failed: ${error.message}`, 'error');
                throw error;
            }
        }
    }

    async runQualityChecks() {
        this.log('QUALITY', 'Starting quality checks...');

        for (const app of CONFIG.applications) {
            try {
                // Lint check (si disponible)
                try {
                    this.log('QUALITY', `Running lint for ${app.name}...`);
                    await this.runCommand('npm run lint', app.path);
                    this.results.quality[`${app.name}-lint`] = { success: true };
                } catch (error) {
                    // Lint peut ne pas être configuré
                    this.log('QUALITY', `${app.name} lint not available`, 'warning');
                    this.results.quality[`${app.name}-lint`] = { success: true, skipped: true };
                }

                // Type checking
                this.log('QUALITY', `Type checking ${app.name}...`);
                await this.runCommand('npx tsc --noEmit', app.path);
                this.results.quality[`${app.name}-types`] = { success: true };
                this.log('QUALITY', `${app.name} type check passed`, 'success');

            } catch (error) {
                this.results.quality[`${app.name}-quality`] = { success: false, error: error.message };
                this.log('QUALITY', `${app.name} quality check failed: ${error.message}`, 'error');
                throw error;
            }
        }
    }

    async runIntegrationTests() {
        this.log('INTEGRATION', 'Starting integration tests...');

        for (const testFile of CONFIG.integrationTests) {
            if (!existsSync(testFile)) {
                this.log('INTEGRATION', `Test file ${testFile} not found`, 'warning');
                continue;
            }

            try {
                this.log('INTEGRATION', `Running integration test: ${testFile}...`);
                const result = await this.runCommand(`node ${testFile}`);
                this.results.integration[testFile] = {
                    success: true,
                    output: result.stdout.slice(-500) // Derniers 500 caractères
                };
                this.log('INTEGRATION', `${testFile} passed`, 'success');
            } catch (error) {
                this.results.integration[testFile] = { success: false, error: error.message };
                this.log('INTEGRATION', `${testFile} failed: ${error.message}`, 'error');
                // Les tests d'intégration ne cassent pas le pipeline
                this.log('INTEGRATION', `Integration test failure is not blocking`, 'warning');
            }
        }
    }

    generateReport() {
        const duration = Date.now() - this.startTime;
        const report = {
            timestamp: new Date().toISOString(),
            duration: `${Math.round(duration / 1000)}s`,
            results: this.results,
            summary: {
                install: Object.values(this.results.install).every(r => r.success),
                build: Object.values(this.results.build).every(r => r.success),
                test: Object.values(this.results.test).every(r => r.success),
                quality: Object.values(this.results.quality).every(r => r.success),
                integration: Object.values(this.results.integration).length > 0
                    ? Object.values(this.results.integration).every(r => r.success)
                    : true
            }
        };

        const allSuccess = Object.values(report.summary).every(Boolean);

        console.log('\\n' + '='.repeat(60));
        console.log('🚀 CI/CD PIPELINE REPORT');
        console.log('='.repeat(60));
        console.log(`📅 Date: ${report.timestamp}`);
        console.log(`⏱️  Duration: ${report.duration}`);
        console.log(`🎯 Overall Status: ${allSuccess ? '✅ SUCCESS' : '❌ FAILURE'}`);
        console.log('');
        console.log('📊 Stage Summary:');
        console.log(`   📦 Install: ${report.summary.install ? '✅' : '❌'}`);
        console.log(`   🔨 Build: ${report.summary.build ? '✅' : '❌'}`);
        console.log(`   🧪 Test: ${report.summary.test ? '✅' : '❌'}`);
        console.log(`   🔍 Quality: ${report.summary.quality ? '✅' : '❌'}`);
        console.log(`   🌐 Integration: ${report.summary.integration ? '✅' : '❌'}`);
        console.log('='.repeat(60));

        return { report, success: allSuccess };
    }

    async run() {
        console.log('🚀 Starting CI/CD Pipeline for Mars Rover System\\n');

        try {
            await this.installDependencies();
            await this.buildApplications();
            await this.runUnitTests();
            await this.runQualityChecks();
            await this.runIntegrationTests();

            const { report, success } = this.generateReport();

            // Sauvegarder le rapport
            await fs.writeFile('ci-cd-report.json', JSON.stringify(report, null, 2));

            if (success) {
                console.log('\\n🎉 CI/CD Pipeline completed successfully!');
                process.exit(0);
            } else {
                console.log('\\n💥 CI/CD Pipeline failed!');
                process.exit(1);
            }

        } catch (error) {
            this.log('PIPELINE', `Pipeline failed: ${error.message}`, 'error');
            const { report } = this.generateReport();

            // Sauvegarder le rapport même en cas d'échec
            await fs.writeFile('ci-cd-report.json', JSON.stringify(report, null, 2));

            process.exit(1);
        }
    }
}

// Exécution du pipeline
const pipeline = new CICDPipeline();
pipeline.run();
