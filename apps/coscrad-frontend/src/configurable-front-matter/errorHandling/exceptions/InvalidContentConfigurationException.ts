export class InvalidContentConfigurationException extends Error {
    constructor(allErrors: Error[]) {
        const allErrorMessages = allErrors.map((error) => error.message).join('\n');

        super(`Encountered and invalid content configuration. \n Errors:${allErrorMessages}`);
    }
}
