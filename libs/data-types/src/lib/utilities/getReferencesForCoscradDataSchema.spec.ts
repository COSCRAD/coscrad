import {
    FullReference,
    NestedDataType,
    NonEmptyString,
    ReferenceTo,
    UUID,
    Union,
    UnionMember,
    UnionType,
} from '../decorators';
import getCoscradDataSchema from './getCoscradDataSchema';
import { getReferencesForCoscradDataSchema } from './getReferencesForCoscradDataSchema';

const dummyType = 'bar';

describe(`getReferencesForCoscradDataSchema`, () => {
    class Woozeediddle {
        @NonEmptyString({
            label: 'foo',
            description: 'is a foo',
        })
        foo: string;

        @ReferenceTo(dummyType)
        @UUID({
            label: 'bar ID',
            description: 'is a direct reference to a bar',
        })
        barId: string;

        @FullReference()
        compositeId: {
            type: string;
            id: string;
        };
    }

    // ACT
    const result = getReferencesForCoscradDataSchema(getCoscradDataSchema(Woozeediddle));

    describe(`when there is a full reference (composite identifier)`, () => {
        it(`should return the reference specification`, () => {
            const doesResultIncludeFullReference = result.some(
                ({ type, path }) => path === 'compositeId' && type == '_COMPOSITE_IDENTIFIER_'
            );

            expect(doesResultIncludeFullReference).toBe(true);
        });
    });

    describe(`when there is a direct ID reference (ReferenceTo)`, () => {
        it(`should return the reference specification`, () => {
            const doesResultIncludeFullReference = result.some(
                ({ type, path }) => path === 'barId' && type == dummyType
            );

            expect(doesResultIncludeFullReference).toBe(true);
        });
    });

    describe(`when the reference is on a nested property`, () => {
        const wType = `wooziediddle`;

        class Item {
            @ReferenceTo(wType)
            woozeediddleId: string;
            properties: { rating: number }[];
        }

        class Whatchamacallit {
            @NestedDataType(Item, {
                label: 'items',
                description: 'items',
                isArray: true,
            })
            items: Item[];
        }
        it(`should return the reference specification`, () => {
            const specifications = getReferencesForCoscradDataSchema(
                getCoscradDataSchema(Whatchamacallit)
            );

            expect(specifications).toHaveLength(1);

            expect(specifications[0]).toEqual({
                path: 'items.woozeediddleId',
                type: wType,
            });
        });
    });

    describe(`when the reference is on a union property`, () => {
        const wType = `wooziediddle`;

        const ITEM_UNION = 'ITEM_UNION';

        @Union(ITEM_UNION, 'type')
        class ItemUnion {
            type: 'one' | 'two';
        }

        @UnionMember(ITEM_UNION, 'one')
        class ItemType1 {
            @ReferenceTo(wType)
            woozeediddleId: string;
            properties: { rating: number }[];
        }

        @UnionMember(ITEM_UNION, 'two')
        class ItemType2 {
            @ReferenceTo(wType)
            woozeediddleId: string;
            properties: { grade: string }[];
        }

        class Whatchamacallit {
            @UnionType(ITEM_UNION, {
                label: 'item',
                description: 'an item may be of one of two types',
            })
            item: ItemType1 | ItemType2;
        }

        it(`should throw`, () => {
            const act = getReferencesForCoscradDataSchema(getCoscradDataSchema(Whatchamacallit));

            /**
             * TODO Support this use case.
             */
            expect(act).toThrow();
        });
    });
});
