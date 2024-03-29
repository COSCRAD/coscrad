import { InternalError } from '../../../../lib/errors/InternalError';
import buildTestData from '../../../../test-data/buildTestData';
import { DeepPartial } from '../../../../types/DeepPartial';
import { Valid } from '../../../domainModelValidators/Valid';
import { HasLabel } from '../../../interfaces/HasAggregateIdAndLabel';
import { AggregateType } from '../../../types/AggregateType';
import { CategorizableType } from '../../../types/CategorizableType';
import { DeluxeInMemoryStore } from '../../../types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../types/ResourceType';
import { dummyUuid } from '../../__tests__/utilities/dummyUuid';
import InvalidExternalStateError from '../../shared/common-command-errors/InvalidExternalStateError';
import { Term } from '../../term/entities/term.entity';
import InvalidExternalReferenceByAggregateError from '../errors/InvalidExternalReferenceByAggregateError';
import { Category } from './category.entity';

const buildTopLevelError = (idAndLabel: HasLabel, innerErrors) =>
    new InvalidExternalStateError(innerErrors);

const missingTerm = buildTestData().resources.term[0].clone<Term>({
    id: 'id-of-missing-term-id',
});

const validCategory = new Category({
    type: AggregateType.category,
    id: '3',
    label: 'mammals',
    members: [
        {
            type: CategorizableType.digitalText,
            id: '44',
        },
        {
            type: CategorizableType.note,
            id: '72',
        },
    ],
    childrenIDs: [],
});

const missingNoteCompositeIdentifier = {
    type: CategorizableType.note,
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
            id: dummyUuid,
            members: [],
        }),
        externalState: {},
    },
    {
        description: 'the category holds valid references for notes',
        category: validCategory.clone<Category>({
            id: dummyUuid,
            members: validSnapshot.note.map((connection) => connection.getCompositeIdentifier()),
        }),
        externalState: validSnapshot,
    },
    {
        description: 'the category holds valid references for resources',
        category: validCategory.clone<Category>({
            id: dummyUuid,
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
            new InvalidExternalReferenceByAggregateError(validCategory.getCompositeIdentifier(), [
                missingTerm.getCompositeIdentifier(),
            ]),
        ]),
    },
    {
        description: 'the category refers to non-existent members',
        category: validCategory.clone<Category>({
            members: validSnapshot.note
                .map((connection) => connection.getCompositeIdentifier())
                .concat(missingNoteCompositeIdentifier),
        }),
        externalState: validSnapshot,
        expectedError: buildTopLevelError(validCategory, [
            new InvalidExternalReferenceByAggregateError(validCategory.getCompositeIdentifier(), [
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
            new InvalidExternalReferenceByAggregateError(validCategory.getCompositeIdentifier(), [
                { type: AggregateType.category, id: 'BOGUS-CHILD-CATEGOR-ID-BOO' },
            ]),
        ]),
    },
];

describe('Category external state validation', () => {
    describe('when the external state is valid for the given category model', () => {
        validTestCases.forEach(({ description, category, externalState }: ValidTestCase) =>
            describe(description, () => {
                it('should return Valid', () => {
                    const result = category.validateExternalState(
                        new DeluxeInMemoryStore(externalState).fetchFullSnapshotInLegacyFormat()
                    );

                    expect(result).toBe(Valid);
                });
            })
        );
    });

    describe('when the external state is invalid for the given category model', () => {
        invalidTestCases.forEach(({ description, category, externalState, expectedError }) =>
            describe(description, () => {
                it('should return the expected error', () => {
                    const result = category.validateExternalState(
                        new DeluxeInMemoryStore(externalState).fetchFullSnapshotInLegacyFormat()
                    );

                    expect(result).toEqual(expectedError);
                });
            })
        );
    });
});
