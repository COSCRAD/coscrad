type PropertyErrorDefinition = {
    propertyName: string;
    propertyType: string;
    invalidReceivedValue: unknown;
};

export class InvalidConfigurationPropertyError extends Error {
    constructor({ propertyName, propertyType, invalidReceivedValue }: PropertyErrorDefinition) {
        const msg = [
            `Encountered an invalid config property: ${propertyName}.`,
            `Expected value of the type: ${propertyType}.`,
            `Received the value: ${JSON.stringify(invalidReceivedValue)}`,
        ].join(' ');

        super(msg);
    }
}
