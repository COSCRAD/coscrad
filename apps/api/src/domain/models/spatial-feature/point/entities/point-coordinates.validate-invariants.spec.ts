import { buildTestInstance } from '../../../../../test-data/utilities';
// TODO this is just a value object not an entity
import { PointCoordinates } from './point-coordinates.entity';

describe(`PointCoordinates.validateInvariants`, () => {
    const validLattitude = 50.1;

    const validLongitude = 122.2;

    describe(`when the coordinats are valid`, () => {
        it(`should return no errors`, () => {
            const result = buildTestInstance(PointCoordinates, {
                lattitude: validLattitude,
                longitude: validLongitude,
            }).validateComplexInvariants();

            // i.e., no errors
            expect(result).toHaveLength(0);
        });
    });

    describe(`when the coordinates are invalid`, () => {
        describe(`when lattitude is invalid`, () => {
            describe(`when it is too small`, () => {
                const invalidLattitude = -90.1;

                it(`should return the expected error`, () => {
                    const result = buildTestInstance(PointCoordinates, {
                        lattitude: invalidLattitude,
                        longitude: validLongitude,
                    }).validateComplexInvariants();

                    expect(result).toHaveLength(1);

                    const message = result[0].toString().toLowerCase();

                    expect(message).toContain(invalidLattitude.toString());
                    expect(message).toContain('-90');
                    expect(message).toContain('90');
                });
            });

            describe(`when it is too large`, () => {
                const invalidLattitude = 90.1;
                it(`should return the expected error`, () => {
                    const result = buildTestInstance(PointCoordinates, {
                        lattitude: invalidLattitude,
                        longitude: validLongitude,
                    }).validateComplexInvariants();

                    expect(result).toHaveLength(1);

                    const message = result[0].toString().toLowerCase();

                    expect(message).toContain(invalidLattitude.toString());
                    expect(message).toContain('-90');
                    expect(message).toContain('90');
                });
            });

            /**
             * Currently, it is the parent's responsibility to check schema-based
             * validation. It would be better to make this the responsibility
             * of the nested entity class.
             */
            describe.skip(`when it is missing`, () => {
                it(`should return the expected error`, () => {
                    const result = buildTestInstance(PointCoordinates, {
                        lattitude: undefined,
                        longitude: validLongitude,
                    }).validateComplexInvariants();

                    expect(result).toHaveLength(1);

                    const message = result[0].toString().toLowerCase();

                    expect(message).toContain('lattitude');
                });
            });
        });

        describe(`when longitude is invalid`, () => {
            describe(`when it is too large`, () => {
                const invalidLongitude = 180.06;

                it(`should return the expected error`, () => {
                    const result = buildTestInstance(PointCoordinates, {
                        lattitude: validLattitude,
                        longitude: invalidLongitude,
                    }).validateComplexInvariants();

                    expect(result).toHaveLength(1);

                    const message = result[0].toString().toLowerCase();

                    expect(message).toContain('longitude');
                    expect(message).toContain(invalidLongitude.toString());
                    expect(message).toContain('-180');
                    expect(message).toContain('180');
                });
            });

            describe(`when it is too small`, () => {
                const invalidLongitude = -180.111;

                it(`should return the expected error`, () => {
                    const result = buildTestInstance(PointCoordinates, {
                        lattitude: validLattitude,
                        longitude: invalidLongitude,
                    }).validateComplexInvariants();

                    expect(result).toHaveLength(1);

                    const message = result.toString().toLowerCase();

                    expect(message).toContain('longitude');
                    expect(message).toContain('-180');
                    expect(message).toContain('180');
                    expect(message).toContain(invalidLongitude.toString());
                });
            });

            // see corresponding comment for lattitude
            describe(`when it is missing`, () => {
                it.todo(`should return the expected error`);
            });
        });
    });
});
