import { FuzzGenerator, getCoscradDataSchema } from '@coscrad/data-types';
import { AggregateFactoryInalidTestCase } from '..';
import { InternalError } from '../../../../../lib/errors/InternalError';
import formatBibliographicCitationType from '../../../../../queries/presentation/formatBibliographicCitationType';
import getValidBibliographicCitationInstanceForTest from '../../../../__tests__/utilities/getValidBibliographicCitationInstanceForTest';
import assertCoscradDataTypeError from '../../../../models/__tests__/invariant-validation-helpers/assertCoscradDataTypeError';
import { BibliographicCitationType } from '../../../../models/bibliographic-citation/types/bibliographic-citation-type';
import { isNullOrUndefined } from '../../../../utilities/validation/is-null-or-undefined';
import { getDataCtorFromBibliographicCitationType } from '../../../complex-factories/build-bibliographic-citation-factory/get-data-ctor-from-bibliographic-citation-type';

export const buildBibliographicCitationSubtypeFuzzTestCases = (
    BibliographicCitationType: BibliographicCitationType
): AggregateFactoryInalidTestCase[] =>
    Object.entries(
        getCoscradDataSchema(getDataCtorFromBibliographicCitationType(BibliographicCitationType))
    )
        .filter(([propertyName, _]) => propertyName !== 'type')
        .flatMap(([propertyName, propertySchema]) => {
            const validInstance =
                getValidBibliographicCitationInstanceForTest(BibliographicCitationType);

            if (isNullOrUndefined(propertySchema))
                throw new InternalError(
                    `Otained null or undefined property schema for ${formatBibliographicCitationType(
                        BibliographicCitationType
                    )}`
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
            return new FuzzGenerator(propertySchema)
                .generateInvalidValues()
                .map(({ value, description }) => ({
                    description: `[${formatBibliographicCitationType(
                        BibliographicCitationType
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
