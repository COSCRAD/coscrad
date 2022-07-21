import { InternalError } from '../../../lib/errors/InternalError';
import { Valid } from '../../domainModelValidators/Valid';
import { ResourceType } from '../../types/ResourceType';
import isContextAllowedForGivenResourceType from '../allowedContexts/isContextAllowedForGivenResourceType';
import { EdgeConnectionContext } from '../context/context.entity';
import { EdgeConnectionContextType } from '../context/types/EdgeConnectionContextType';
import { Resource } from '../resource.entity';
import buildResourceModelContextStateValidatorTestCases from './buildResourceModelContextStateValidatorTestCases';

type ResourceAndContext<
    TResource extends Resource = Resource,
    UContext extends EdgeConnectionContext = EdgeConnectionContext
> = {
    resource: TResource;
    context: UContext;
};

export type ResourceModelContextStateValidatorValidTestCase<
    TResource extends Resource = Resource,
    UContext extends EdgeConnectionContext = EdgeConnectionContext
> = ResourceAndContext<TResource, UContext> & {
    description: string;
};

export type ResourceModelContextStateValidatorInvalidTestCase<
    TResource extends Resource = Resource,
    UContext extends EdgeConnectionContext = EdgeConnectionContext
> = ResourceAndContext<TResource, UContext> & {
    description: string;
    expectedError: InternalError;
};

export type ContextStateValidatorTestCase = {
    validCases: ResourceModelContextStateValidatorValidTestCase[];
    invalidCases: ResourceModelContextStateValidatorInvalidTestCase[];
};

const testCases: ContextStateValidatorTestCase[] =
    buildResourceModelContextStateValidatorTestCases();
describe(`resource model context state validators`, () => {
    const isThereATestCaseForResourceTypeContextTypeCombo = (
        resourceType: ResourceType,
        contextType: EdgeConnectionContextType,
        searchContext: 'validCases' | 'invalidCases'
    ): boolean =>
        testCases
            .flatMap((testCase) => testCase[searchContext])
            .some(
                ({
                    resource: { type: testCaseResourceType },
                    context: { type: testCaseContextType },
                }) => resourceType === testCaseResourceType && contextType === testCaseContextType
            );

    const allResourceTypeContextTypeCombos = Object.keys(ResourceType).flatMap(
        (resourceType: ResourceType) =>
            Object.keys(EdgeConnectionContextType).map(
                (
                    contextType: EdgeConnectionContextType
                ): [ResourceType, EdgeConnectionContextType] => [resourceType, contextType]
            )
    );

    const allowedResourceTypeContextTypeCombos = allResourceTypeContextTypeCombos.filter(
        ([resourceType, contextType]) =>
            isContextAllowedForGivenResourceType(contextType, resourceType)
    );

    describe(`the test cases should be comprehensive`, () => {
        it('should have at least one valid test case for each resource type \\ allowed context type combo', () => {
            const missingValidCases = allowedResourceTypeContextTypeCombos.reduce(
                (acc: [ResourceType, EdgeConnectionContextType][], [resourceType, contextType]) =>
                    isThereATestCaseForResourceTypeContextTypeCombo(
                        resourceType,
                        contextType,
                        'validCases'
                    )
                        ? acc
                        : acc.concat([[resourceType, contextType]]),
                []
            );

            // This should give us a better message upon failing than checking the length
            expect(missingValidCases).toEqual([]);
        });

        it('should have at least one invalid test case for each resource type \\ context type combo', () => {
            const missingValidCases = allResourceTypeContextTypeCombos
                .filter(([_, contextType]) => contextType !== EdgeConnectionContextType.general)
                .reduce(
                    (
                        acc: [ResourceType, EdgeConnectionContextType][],
                        [resourceType, contextType]
                    ) =>
                        isThereATestCaseForResourceTypeContextTypeCombo(
                            resourceType,
                            contextType,
                            'invalidCases'
                        )
                            ? acc
                            : acc.concat([[resourceType, contextType]]),
                    []
                );

            // This should give us a better message upon failing than checking the length
            expect(missingValidCases).toEqual([]);
        });
    });

    testCases.forEach(({ validCases, invalidCases }) => {
        describe(`For a resource of type: ${validCases[0].resource.type}`, () => {
            describe(`when the context is valid`, () => {
                validCases.forEach(({ resource, context, description }) => {
                    describe(description, () => {
                        it('should return Valid', () => {
                            const validationResult = resource.validateContext(context);

                            expect(validationResult).toBe(Valid);
                        });
                    });
                });
            });

            describe('when the context is not valid', () => {
                invalidCases.forEach(({ resource, context, description, expectedError }) => {
                    describe(description, () => {
                        it('should return the expected error', () => {
                            const validationResult = resource.validateContext(context);

                            expect(validationResult).toEqual(expectedError);

                            // TODO Do we need to check inner errors?
                        });
                    });
                });
            });
        });
    });
});
