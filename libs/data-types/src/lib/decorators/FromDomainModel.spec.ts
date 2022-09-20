import 'reflect-metadata';
import { CoscradDataSchema, CoscradDataType } from '../types';
import { getCoscradDataSchema } from '../utilities';
import { FromDomainModel } from './FromDomainModel';
import { NonEmptyString } from './NonEmptyString';
import { PositiveInteger } from './PositiveInteger';
import { URL } from './URL';

const checkSchema = (ViewModel: Object, expectedSchema: Record<string, CoscradDataSchema>) => {
    const viewModelSchema = getCoscradDataSchema(ViewModel);

    expect(viewModelSchema).toEqual(expectedSchema);
};

describe(`@FromDomainModel`, () => {
    describe('when there is a valid definition of each property on a corresponding domain model', () => {
        class MyDomainClass {
            @PositiveInteger()
            readonly numberOfStars: number;

            @NonEmptyString({ isOptional: true })
            readonly label?: string;

            @URL({ isArray: true })
            readonly links: string[];

            // This property is intentinoally not exposed to public API
            readonly notRelevantToViewModel: number[];
        }

        class MyViewModel {
            @FromDomainModel(MyDomainClass)
            readonly numberOfStars: number;

            @FromDomainModel(MyDomainClass)
            readonly label?: string;

            @FromDomainModel(MyDomainClass)
            readonly links: string[];

            // This could be denormalized data calculated from combination of fields, for example
            readonly uniqueToViewModel: string;
        }

        const expectedSchema: Record<string, CoscradDataSchema> = {
            numberOfStars: {
                coscradDataType: CoscradDataType.PositiveInteger,
                isArray: false,
                isOptional: false,
            },
            label: {
                coscradDataType: CoscradDataType.NonEmptyString,
                isArray: false,
                isOptional: true,
            },
            links: {
                coscradDataType: CoscradDataType.URL,
                isArray: true,
                isOptional: false,
            },
        };

        it('should have the expected schema', () => {
            checkSchema(MyViewModel, expectedSchema);
        });
    });

    describe('when there is no corresponding property on the domain model', () => {
        class MyDomainClass {
            @PositiveInteger()
            readonly numberOfStars: number;

            @NonEmptyString({ isOptional: true })
            readonly label?: string;

            @URL({ isArray: true })
            readonly links: string[];

            // This property is intentinoally not exposed to public API
            readonly notRelevantToViewModel: number[];
        }

        class MyViewModel {
            @FromDomainModel(MyDomainClass)
            readonly numberOfStars: number;

            @FromDomainModel(MyDomainClass)
            readonly label?: string;

            @FromDomainModel(MyDomainClass)
            readonly links: string[];

            /**
             * Normally, the typescript compiler is responsible for
             * executing the decorators. We will manually call the decorator
             * below in order to test that it throws if no corresponding domain
             * model property is found.
             */
            // @FromDomainModel(MyDomainClass)
            readonly missingOnDomainModel: string;

            // This could be denormalized data calculated from combination of fields, for example
            readonly uniqueToViewModel: string;
        }

        it('should throw', () => {
            const attemptToGetSchema = () => {
                FromDomainModel(MyDomainClass)(MyViewModel, 'missingOnDomainModel');
            };

            expect(attemptToGetSchema).toThrow();
        });
    });
});
