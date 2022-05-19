import { ValidationError } from 'class-validator';
import DiscriminatedUnionValidator from './DiscriminatedUnionValidator';
import { SimpleValidationFunction } from './interfaces/SimpleValidationFunction';

describe(`DescriminatedUnionValidator`, () => {
    class Circle {
        type = 'circle';

        constructor(public radius: number) {}
    }

    const validateCircle: SimpleValidationFunction = (input: unknown): ValidationError[] =>
        (input as Circle).radius < 0 ? [new ValidationError()] : [];

    class Square {
        type = 'square';

        constructor(public length: number) {}
    }

    const validateSquare: SimpleValidationFunction = (input: unknown) =>
        (input as Square).length < 0 ? [new ValidationError()] : [];

    class Rectangle {
        type = 'rectangle';

        constructor(public height: number, public width: number) {}
    }

    const validateRectangle: SimpleValidationFunction = (input: unknown) => {
        const test = input as Rectangle;

        if (test.height < 0 || test.width < 0) return [new ValidationError()];

        return [];
    };

    const myDiscriminatorPropertyName = 'type';

    const myDiscriminants = ['circle', 'square', 'rectangle'];

    const naiveValidator = (): ValidationError[] => [];

    describe(`registerAllValidationFunctions`, () => {
        describe(`when there are missing validation functions`, () => {
            let discriminatedUnionValidator: DiscriminatedUnionValidator;

            beforeEach(() => {
                discriminatedUnionValidator = new DiscriminatedUnionValidator(
                    myDiscriminants,
                    myDiscriminatorPropertyName
                );
            });

            afterEach(() => {
                discriminatedUnionValidator = null;
            });
            describe(`when the input is empty`, () => {
                it('should throw', () => {
                    const attemptToRegisterValidationFunctions = () =>
                        discriminatedUnionValidator.registerAllValidationFunctions([]);

                    expect(attemptToRegisterValidationFunctions).toThrow();
                });
            });

            describe(`when some (but not all) discriminants' validation functions are specified`, () => {
                const partialDiscriminantAndValidationFunctionPairs = [
                    ['circle', naiveValidator],
                    ['square', naiveValidator],
                ] as [string, SimpleValidationFunction][];

                const attemptToRegisterValidationFunctions = () =>
                    discriminatedUnionValidator.registerAllValidationFunctions(
                        partialDiscriminantAndValidationFunctionPairs
                    );

                expect(attemptToRegisterValidationFunctions).toThrow();
            });
        });

        describe(`when a validation function is provided for every discriminant`, () => {
            const discriminatedUnionValidator = new DiscriminatedUnionValidator(
                myDiscriminants,
                myDiscriminatorPropertyName
            );

            const allDiscriminantAndValidationFunctionPairs = [
                ['circle', naiveValidator],
                ['square', naiveValidator],
                ['rectangle', naiveValidator],
            ] as [string, SimpleValidationFunction][];

            const attemptToRegisterValidationFunctions = () =>
                discriminatedUnionValidator.registerAllValidationFunctions(
                    allDiscriminantAndValidationFunctionPairs
                );

            expect(attemptToRegisterValidationFunctions).not.toThrow();
        });
    });

    describe(`validate`, () => {
        const allDiscriminantAndValidationFunctionPairs: [string, SimpleValidationFunction][] = [
            ['circle', validateCircle],
            ['square', validateSquare],
            ['rectangle', validateRectangle],
        ];

        const discriminatedUnionValidator = new DiscriminatedUnionValidator(
            myDiscriminants,
            myDiscriminatorPropertyName
        ).registerAllValidationFunctions(allDiscriminantAndValidationFunctionPairs);

        describe(`when the input is valid`, () => {
            const validCircles = [1, 3.14, 22.4].map((r) => new Circle(r));

            const validSquares = [2, 99.9, 1200].map((l) => new Square(l));

            const validRectangles = [
                [2, 2],
                [1.4, 5, 5],
                [9, 80.1],
            ].map(([h, w]) => new Rectangle(h, w));

            it(`should return no errors`, () => {
                [...validCircles, ...validSquares, ...validRectangles].forEach((validValue) => {
                    const validationResult = discriminatedUnionValidator.validate(validValue);

                    expect(validationResult).toEqual([]);
                });
            });
        });

        describe(`when the input is invalid`, () => {
            describe(`when the input can be matched to its validation function by its discriminant`, () => {
                const invalidValues = [new Circle(-5), new Square(-2), new Rectangle(-4.4, -23)];

                invalidValues.forEach((invalidValue) => {
                    const validationResult = discriminatedUnionValidator.validate(invalidValue);

                    expect(validationResult.length).toBeGreaterThan(0);
                });
            });

            describe(`when the input cannot be matched to its validation function by its discriminant`, () => {
                describe(`when the input is null`, () => {
                    const validationResult = discriminatedUnionValidator.validate(null);

                    it(`should return an error`, () => {
                        expect(validationResult.length).toBeGreaterThan(0);
                    });
                });

                describe(`when the input is undefined`, () => {
                    const validationResult = discriminatedUnionValidator.validate(undefined);

                    it(`should return an error`, () => {
                        expect(validationResult.length).toBeGreaterThan(0);
                    });
                });

                describe(`when the input's discriminant is not in the allowed list`, () => {
                    const badInput = {
                        type: 'parallelogram',
                        length: 22,
                    };

                    it('should throw', () => {
                        const validationResult = discriminatedUnionValidator.validate(badInput);

                        expect(validationResult.length).toBeGreaterThan(0);
                    });
                });

                describe(`when the input's discriminant is undefined`, () => {
                    const badInput = {
                        radius: 4,
                    };

                    it('should return an error', () => {
                        const validationResult = discriminatedUnionValidator.validate(badInput);

                        expect(validationResult.length).toBeGreaterThan(0);
                    });
                });
            });
        });
    });
});
