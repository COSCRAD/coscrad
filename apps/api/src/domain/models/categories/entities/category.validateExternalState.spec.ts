import { InternalError } from '../../../../lib/errors/InternalError';
import buildTestData from '../../../../test-data/buildTestData';
import { DeepPartial } from '../../../../types/DeepPartial';
import { Valid } from '../../../domainModelValidators/Valid';
import { HasEntityIdAndLabel } from '../../../interfaces/HasEntityIdAndLabel';
import { InMemorySnapshot, resourceTypes } from '../../../types/resourceTypes';
import { Term } from '../../term/entities/term.entity';
import ChildCategoryDoesNotExistError from '../errors/ChildCategoryDoesNotExistError';
import InvalidExternalReferenceInCategoryError from '../errors/InvalidExternalReferenceInCategoryError';
import InvalidExternalStateForCategoryError from '../errors/InvalidExternalStateForCategoryError';
import { noteType } from '../types/ResourceTypeOrNoteType';
import { Category } from './category.entity';

const buildTopLevelError = (idAndLabel: HasEntityIdAndLabel, innerErrors) =>
    new InvalidExternalStateForCategoryError(idAndLabel, innerErrors);

const missingTerm = buildTestData().resources.term[0].clone<Term>({
    id: 'id-of-missing-term-id',
});

const validCategory = new Category({
    id: '3',
    label: 'mammals',
    members: [
        {
            type: resourceTypes.book,
            id: '44',
        },
        {
            type: noteType,
            id: '72',
        },
    ],
    childrenIDs: [],
});

const missingNoteCompositeIdentifier = {
    type: noteType,
    id: 'missing-note-id',
} as const;

const validSnapshot = buildTestData();

type ValidTestCase = {
    description: string;
    category: Category;
    externalState: DeepPartial<InMemorySnapshot>;
};

type InvalidTestCase = ValidTestCase & {
    expectedError: InternalError;
};

const validTestCases: ValidTestCase[] = [
    {
        description: 'the category has no members',
        category: validCategory.clone<Category>({
            members: [],
        }),
        externalState: {},
    },
    {
        description: 'the category holds valid references for notes',
        category: validCategory.clone<Category>({
            members: validSnapshot.connections.map((connection) =>
                connection.getCompositeIdentifier()
            ),
        }),
        externalState: validSnapshot,
    },
    {
        description: 'the category holds valid references for resources',
        category: validCategory.clone<Category>({
            members: Object.values(validSnapshot.resources).flatMap((allResourcesOfType) =>
                allResourcesOfType.map((resource) => resource.getCompositeIdentifier())
            ),
        }),
        externalState: validSnapshot,
    },
];

const invalidTestCases: InvalidTestCase[] = [
    {
        description: 'the category refers to non-existant members',
        category: validCategory.clone<Category>({
            members: Object.values(validSnapshot.resources)
                .flatMap((allResourcesOfType) =>
                    allResourcesOfType.map((resource) => resource.getCompositeIdentifier())
                )
                .concat(missingTerm.getCompositeIdentifier()),
        }),
        externalState: validSnapshot,
        expectedError: buildTopLevelError(validCategory, [
            new InvalidExternalReferenceInCategoryError(validCategory, [
                missingTerm.getCompositeIdentifier(),
            ]),
        ]),
    },
    {
        description: 'the category refers to non-existent members',
        category: validCategory.clone<Category>({
            members: validSnapshot.connections
                .map((connection) => connection.getCompositeIdentifier())
                .concat(missingNoteCompositeIdentifier),
        }),
        externalState: validSnapshot,
        expectedError: buildTopLevelError(validCategory, [
            new InvalidExternalReferenceInCategoryError(validCategory, [
                missingTerm.getCompositeIdentifier(),
            ]),
        ]),
    },
    {
        description: 'the category refers to non-existent children categories',
        category: validCategory.clone<Category>({
            childrenIDs: [...validCategory.childrenIDs, 'BOGUS-CHILD-CATEGOR-ID-BOO'],
        }),
        externalState: validSnapshot,
        expectedError: buildTopLevelError(validCategory, [
            new ChildCategoryDoesNotExistError('BOGUS-CHILD-CATEGOR-ID-BOO', validCategory),
        ]),
    },
];

describe('Category external state validation', () => {
    describe('when the external state is valid for the given category model', () => {
        validTestCases.forEach(({ description, category, externalState }) =>
            describe(description, () => {
                it('should return Valid', () => {
                    const result = category.validateExternalState(externalState);

                    expect(result).toBe(Valid);
                });
            })
        );
    });

    describe('when the external state is invalid for the given category model', () => {
        invalidTestCases.forEach(({ description, category, externalState, expectedError }) =>
            describe(description, () => {
                it('should return the expected error', () => {
                    const result = category.validateExternalState(externalState);

                    expect(result).toEqual(expectedError);
                });
            })
        );
    });
});
