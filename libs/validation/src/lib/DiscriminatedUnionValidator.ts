import { SimpleValidationError } from './interfaces/SimpleValidationError';
import { SimpleValidationFunction } from './interfaces/SimpleValidationFunction';

const buildValidationError = (message: string): SimpleValidationError => ({
    toString: () => message,
});

export default class DiscriminatedUnionValidator {
    #discriminantToValidationFunction: Map<string, SimpleValidationFunction> = new Map();

    readonly #allDiscriminants: string[];

    readonly #discriminatorPropertyName: string;

    /**
     *
     * @param allDiscriminants an array of string values that discriminant members of your union
     * @param discriminatorPropertyName the name of the property that is used to discriminate members of your union (commonly "type")
     */
    constructor(allDiscriminants: string[], discriminatorPropertyName: string) {
        this.#allDiscriminants = [...allDiscriminants];

        this.#discriminatorPropertyName = discriminatorPropertyName;
    }

    registerAllValidationFunctions(
        discrimantAndValidationFunctionPairs: [string, SimpleValidationFunction][]
    ): DiscriminatedUnionValidator {
        if (this.#discriminantToValidationFunction.size !== 0) {
            throw new Error(
                [
                    `You cannot update the validation functions once set.`,
                    `Create a new DiscriminatedUnionValidator instance instead`,
                ].join(' ')
            );
        }

        discrimantAndValidationFunctionPairs.forEach(([discriminant, validation]) =>
            this.#registerValidationFunction(discriminant, validation)
        );

        const discriminantsWithoutValidationFunction =
            this.#getDiscriminantsThatAreMissingAValidationFunction();

        if (discriminantsWithoutValidationFunction.length > 0) {
            throw new Error(
                `The following discriminants are missing a validation function: ${discriminantsWithoutValidationFunction}`
            );
        }

        return this;
    }

    validate(input: unknown): SimpleValidationError[] {
        if (input === null || typeof input === 'undefined')
            return [buildValidationError(`The input must not be null or undefined`)];

        const discriminantForInput = input[this.#discriminatorPropertyName];

        if (discriminantForInput === null || typeof discriminantForInput === 'undefined')
            return [
                buildValidationError(
                    `The input is missing the discriminator property: ${
                        this.#discriminatorPropertyName
                    }`
                ),
            ];

        if (!this.#isAllowedDiscriminant(discriminantForInput)) {
            return [
                buildValidationError(
                    [
                        `Encountered an invalid discriminant: ${discriminantForInput}.`,
                        `The allowed values are: ${this.#allDiscriminants}`,
                    ].join(' ')
                ),
            ];
        }

        const executeValidation = this.#discriminantToValidationFunction.get(discriminantForInput);

        if (!executeValidation) {
            throw new Error(
                `Failed to find a validation function for discriminant: ${discriminantForInput}`
            );
        }

        return executeValidation(input);
    }

    #registerValidationFunction(
        discriminant: string,
        validationFunction: SimpleValidationFunction
    ) {
        if (this.#discriminantToValidationFunction.has(discriminant)) {
            throw new Error(
                `Validation has already been set for the discriminant: ${discriminant}`
            );
        }

        if (!this.#allDiscriminants.includes(discriminant)) {
            throw new Error(
                `The discriminant: ${discriminant} is not in the allowed list: ${
                    this.#allDiscriminants
                }`
            );
        }

        this.#discriminantToValidationFunction.set(discriminant, validationFunction);
    }

    #getDiscriminantsThatAreMissingAValidationFunction(): string[] {
        return this.#allDiscriminants.filter(
            (discriminant) => !this.#discriminantToValidationFunction.has(discriminant)
        );
    }

    #isAllowedDiscriminant(input: string): boolean {
        return this.#allDiscriminants.includes(input);
    }
}
