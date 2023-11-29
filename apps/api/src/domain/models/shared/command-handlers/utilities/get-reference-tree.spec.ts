import { ReferenceTo, UUID } from '@coscrad/data-types';
import { DeluxeInMemoryStore } from '../../../../types/DeluxeInMemoryStore';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { buildReferenceTree } from './build-reference-tree';

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

        // @FullReference()
        // @NestedDataType(ResourceCompositeIdentifier, {
        //     label: 'reosurce ID',
        //     description: 'the resource ID',
        // })
        // resourceId: CompositeIdentifier<string>;

        // @FullReference()
        // @NestedDataType(ResourceCompositeIdentifier, {
        //     label: 'alternative reosurce IDs',
        //     description: 'the alternative resource IDs',
        //     isArray: true,
        // })
        // alternativeRepresentationIds: CompositeIdentifier<string>[];
    }

    const existingWidget: Widget = {
        aggregateCompositeIdentifier: {
            type: 'burger',
            id: buildDummyUuid(333),
        },
        bookId: buildDummyUuid(1),
        fooIds: [2, 3, 4].map(buildDummyUuid),
        // resourceId: {
        //     type: 'whatsit',
        //     id: buildDummyUuid(5),
        // },
        // alternativeRepresentationIds: [6, 7, 8].map(buildDummyUuid).map((id) => ({
        //     type: 'whobob',
        //     id,
        // })),
    };

    describe(`it should identify the references that are contained`, () => {
        const referenceTree = buildReferenceTree(
            Widget,
            new DeluxeInMemoryStore({}),
            existingWidget
        );

        it(`should have all references`, () => {
            const hasBookReference = referenceTree.has('book', buildDummyUuid(1));

            expect(hasBookReference).toBe(true);
        });
    });
});
