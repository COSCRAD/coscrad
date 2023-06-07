import { ThingDataOne, ThingDataTwo, Widget } from '../../../test/widget';
import getCoscradDataSchema from '../getCoscradDataSchema';
import {
    resolveMemberSchemasForUnion,
    UnionMemberSchemaDefinition,
} from './resolve-member-schemas-for-union';

type DiscriminantValueAndCtorName = {
    discriminantValue: string;

    ctorName: string;
};

describe(`resolveMemberSchemasForUnion`, () => {
    const assertMembersResolved = (
        schemaDefinitions: UnionMemberSchemaDefinition[],
        expectedNumberOfMembers: number,
        expectedDiscriminantsAndCtorNames: DiscriminantValueAndCtorName[]
    ): void => {
        expect(schemaDefinitions.length).toBe(expectedNumberOfMembers);

        const missingMembers = expectedDiscriminantsAndCtorNames.filter(
            ({ discriminantValue }) =>
                !schemaDefinitions.some(
                    ({ discriminantValue: discriminantValueForThisSchema }) =>
                        discriminantValue === discriminantValueForThisSchema
                )
        );

        expect(missingMembers).toEqual([]);
    };

    describe(`when there are multiple union members with no nesting`, () => {
        it(`should resolve the members`, () => {
            const widgetSchema = getCoscradDataSchema(Widget);

            const unionPropertySchema = widgetSchema['data'];

            const result = resolveMemberSchemasForUnion(
                [Widget, ThingDataOne, ThingDataTwo],
                // @ts-expect-error fix types \ add a proper assertion
                unionPropertySchema
            );

            assertMembersResolved(result, 2, [
                {
                    discriminantValue: 'widget',
                    ctorName: 'Widget',
                },
                {
                    discriminantValue: 'whatsit',
                    ctorName: 'Whatsit',
                },
            ]);
        });
    });
});
