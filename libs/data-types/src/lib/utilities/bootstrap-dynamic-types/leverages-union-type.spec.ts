import { ThingDataOne, ThingDataTwo, ThingUnion } from '../../../test/widget';
import { NestedDataType, NonEmptyString, NonNegativeFiniteNumber } from '../../decorators';
import getCoscradDataSchema from '../getCoscradDataSchema';
import { leveragesUniontype } from './leverages-union-type';

describe(`leverages union type`, () => {
    describe(`when the class does not leverage a union type`, () => {
        class NoUnionsHere {
            @NonEmptyString({
                description: 'name',
                label: 'name',
            })
            name: string;

            @NonNegativeFiniteNumber({
                description: 'number',
                label: 'number',
            })
            number: Number;
        }

        it('should return false', () => {
            const result = leveragesUniontype(getCoscradDataSchema(NoUnionsHere));

            expect(result).toBe(false);
        });
    });

    describe(`when the class leverages a union type`, () => {
        class SimpleDataTypeWithUnion {
            @NonEmptyString({
                description: 'name',
                label: 'name',
            })
            name: string;

            @ThingUnion({
                description: 'machine',
                label: 'machine',
            })
            machine: ThingDataOne | ThingDataTwo;
        }

        describe(`when there is no nesting of data types`, () => {
            it(`should return true`, () => {
                const result = leveragesUniontype(getCoscradDataSchema(SimpleDataTypeWithUnion));

                expect(result).toBe(true);
            });
        });

        describe(`when there is a nested property type definition`, () => {
            describe(`when the nested property does not leverage a union`, () => {
                class Nested {
                    @NonNegativeFiniteNumber({
                        description: 'number',
                        label: 'number',
                    })
                    number: number;
                }

                class NestorWithoutAUnion {
                    name: string;

                    @NestedDataType(Nested, {
                        description: 'nested',
                        label: 'nested',
                    })
                    nested: Nested;
                }

                it('should return false', () => {
                    const result = leveragesUniontype(getCoscradDataSchema(NestorWithoutAUnion));

                    expect(result).toBe(false);
                });
            });

            describe(`when the nested property leverages a union`, () => {
                class LeveragesANestedTypeWithoutAnyUnions {
                    @NonNegativeFiniteNumber({
                        description: 'number',
                        label: 'number',
                    })
                    number: number;

                    @NestedDataType(SimpleDataTypeWithUnion, {
                        description: 'nested prop (leverages a union on nested type)',
                        label: 'nested prop',
                    })
                    nestedProp: SimpleDataTypeWithUnion;
                }

                it(`should return true`, () => {
                    expect(
                        leveragesUniontype(
                            getCoscradDataSchema(LeveragesANestedTypeWithoutAnyUnions)
                        )
                    ).toBe(true);
                });
            });
        });
    });
});
