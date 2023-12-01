import {
    FullReference,
    NestedDataType,
    NonEmptyString,
    ReferenceTo,
    UUID,
} from '@coscrad/data-types';
import { DeluxeInMemoryStore } from '../../../../types/DeluxeInMemoryStore';
import { ResourceType } from '../../../../types/ResourceType';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { buildReferenceTree } from './build-reference-tree';

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
            label: 'reosurce ID',
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
    };

    describe(`it should identify the references that are contained`, () => {
        const referenceTree = buildReferenceTree(
            Widget,
            new DeluxeInMemoryStore({}),
            existingWidget
        );

        it(`should have all references`, () => {
            const hasBookReference = referenceTree.has('book', bookId);

            expect(hasBookReference).toBe(true);
        });
    });
});
