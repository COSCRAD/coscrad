import {
    FullReference,
    NestedDataType,
    NonEmptyString,
    ReferenceTo,
    UUID,
} from '@coscrad/data-types';
import { ResourceType } from '../../../../types/ResourceType';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { buildReferenceTree } from './build-reference-tree';
import { ReferenceTree } from './reference-tree';

class ResourceCompositeIdentifier {
    @NonEmptyString({
        label: 'type',
        description: 'the type of resource',
    })
    type: string;

    @UUID({
        label: 'ID',
        description: 'unique identifier',
    })
    id: string;
}

describe(`getReferenceTree`, () => {
    class WidgetPart {
        @ReferenceTo('machine-part')
        @UUID({
            label: 'part id',
            description: 'a reference to a part for this widget',
        })
        partId: string;

        @NonEmptyString({
            label: 'purpose',
            description: 'the purpose of this part in the widget',
        })
        purpose: string;
    }

    class Widget {
        aggregateCompositeIdentifier: {
            type: string;
            id: string;
        };

        @ReferenceTo('book')
        @UUID({
            label: 'book id',
            description: 'the book id',
        })
        bookId: string;

        @ReferenceTo('foo')
        @UUID({
            label: 'foo IDs',
            description: 'the foo IDs',
            isArray: true,
        })
        fooIds: string[];

        @FullReference()
        @NestedDataType(ResourceCompositeIdentifier, {
            label: 'resource ID',
            description: 'the resource ID',
        })
        resourceId: ResourceCompositeIdentifier;

        @FullReference()
        @NestedDataType(ResourceCompositeIdentifier, {
            label: 'alternative reosurce IDs',
            description: 'the alternative resource IDs',
            isArray: true,
        })
        alternativeRepresentationIds: ResourceCompositeIdentifier[];

        @NestedDataType(WidgetPart, {
            isArray: true,
            label: 'parts',
            description: 'the machine parts used to build this widget',
        })
        parts: WidgetPart[];
    }

    const aggregateId = buildDummyUuid(333);

    const bookId = buildDummyUuid(1);

    const existingWidget: Widget = {
        aggregateCompositeIdentifier: {
            type: 'burger',
            id: aggregateId,
        },
        bookId,
        fooIds: [2, 3, 4].map(buildDummyUuid),
        resourceId: {
            type: 'whatsit' as ResourceType,
            id: buildDummyUuid(5),
        },
        alternativeRepresentationIds: [6, 7, 8].map(buildDummyUuid).map((id) => ({
            type: 'whobob' as ResourceType,
            id,
        })),
        parts: [
            {
                partId: buildDummyUuid(9),
                purpose: 'holds the diddly together',
            },
            {
                partId: buildDummyUuid(10),
                purpose: `keeps the moving parts lubricated`,
            },
        ],
    };

    describe(`it should identify the references that are contained`, () => {
        const referenceTree = buildReferenceTree(Widget, existingWidget);

        it(`should have all references`, () => {
            const hasBookReference = referenceTree.has('book', bookId);

            expect(hasBookReference).toBe(true);

            [2, 3, 4].forEach((fooId) => {
                expect(referenceTree.has('foo', buildDummyUuid(fooId))).toBe(true);
            });

            expect(referenceTree.has('whatsit', buildDummyUuid(5))).toBe(true);

            [6, 7, 8].forEach((whobobId) => {
                expect(referenceTree.has('whobob', buildDummyUuid(whobobId))).toBe(true);
            });

            [9, 10].forEach((partId) => {
                expect(referenceTree.has('machine-part', buildDummyUuid(partId))).toBe(true);
            });

            ['foo', 'whatsit', 'whobob', 'machine-part'].forEach((aggregateType) => {
                // This ID does not appear in the test instance above
                expect(referenceTree.has(aggregateType, buildDummyUuid(999))).toBe(false);
            });
        });
    });

    describe(`it should property compare two trees`, () => {
        const matchedCompositeIdentifiers = ['widget', 'whatsit', 'gadget'].map((type, index) => ({
            type,
            id: buildDummyUuid(index),
        }));

        const unmatchedCompositeIdentifier = {
            type: 'widget',
            id: buildDummyUuid(678),
        };

        describe(`when the trees different`, () => {
            it(`should identiy the unmatched composite identifier`, () => {
                const result = ReferenceTree.fromCompositeIdentifierList(
                    matchedCompositeIdentifiers
                ).compare(
                    ReferenceTree.fromCompositeIdentifierList([
                        ...matchedCompositeIdentifiers,
                        unmatchedCompositeIdentifier,
                    ])
                );

                expect(result).toHaveLength(1);

                expect(result[0]).toEqual(unmatchedCompositeIdentifier);
            });
        });

        describe(`when the trees are different`, () => {
            it(`should return the unmatched composite identifiers`, () => {
                const result = ReferenceTree.fromCompositeIdentifierList(
                    matchedCompositeIdentifiers
                ).compare(ReferenceTree.fromCompositeIdentifierList(matchedCompositeIdentifiers));

                expect(result).toEqual([]);
            });
        });
    });
});
