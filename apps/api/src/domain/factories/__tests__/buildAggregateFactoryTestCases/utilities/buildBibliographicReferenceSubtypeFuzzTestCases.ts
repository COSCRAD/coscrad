import { FuzzGenerator, getCoscradDataSchema } from '@coscrad/data-types';
import { AggregateFactoryInalidTestCase } from '..';
import { InternalError } from '../../../../../lib/errors/InternalError';
import formatBibliographicReferenceType from '../../../../../view-models/presentation/formatBibliographicReferenceType';
import { BibliographicReferenceType } from '../../../../models/bibliographic-reference/types/BibliographicReferenceType';
import assertCoscradDataTypeError from '../../../../models/__tests__/invariant-validation-helpers/assertCoscradDataTypeError';
import getValidBibliographicReferenceInstanceForTest from '../../../../__tests__/utilities/getValidBibliographicReferenceInstanceForTest';
import { getDataCtorFromBibliographicReferenceType } from '../../../complexFactories/buildBibliographicReferenceFactory/getDataCtorFromBibliographicReferenceType';

export const buildBibliographicReferenceSubtypeFuzzTestCases = (
    bibliographicReferenceType: BibliographicReferenceType
): AggregateFactoryInalidTestCase[] =>
    Object.entries(
        getCoscradDataSchema(getDataCtorFromBibliographicReferenceType(bibliographicReferenceType))
    ).flatMap(([propertyName, propertySchma]) => {
        const validInstance = getValidBibliographicReferenceInstanceForTest(
            bibliographicReferenceType
        );

        /**
         * Note that this extra logic is required because we have a discriminated
         * union with the discriminant on a nested property (data.type in this case).
         * We cannot use the usual fuzz generator at the top level, as we run
         * into a catch 22 that prevents invariant validation if the `data`
         * property does not have a `type` property.
         *
         * So we generate data DTOs that have invalid values for all properties
         * except the `type` property. Note that we do not decorate \ fuzz type
         * discriminators ever, since they are 'hard wired' in the constructor
         * and an invalid value on a DTO will simply be ignored and replaced.
         */
        return new FuzzGenerator(propertySchma)
            .generateInvalidValues()
            .map(({ value, description }) => ({
                description: `[${formatBibliographicReferenceType(
                    bibliographicReferenceType
                )}] when data.${propertyName} has the invalid value: ${value} (${description})`,
                dto: validInstance.clone({
                    data: validInstance.data.clone({
                        [propertyName]: value,
                    }),
                }),
                checkError: (result: unknown) => {
                    expect(result).toBeInstanceOf(InternalError);

                    const error = result as InternalError;

                    assertCoscradDataTypeError(error, 'data');

                    assertCoscradDataTypeError(error.innerErrors[0], propertyName);
                },
            }));
    });
