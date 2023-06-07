import { ThingDataOne, ThingDataTwo, Widget } from '../../../test/widget';
import {
    resolveMemberSchemasForUnion,
    UnionMemberSchemaDefinition,
} from './resolve-member-schemas-for-union';

const assertMembersResolved = (
    schemaDefinitions: UnionMemberSchemaDefinition[],
    expectedNumberOfMembers: number,
    expectedDiscriminantValues: string[]
): void => {
    expect(schemaDefinitions.length).toBe(expectedNumberOfMembers);

    const missingMembers = expectedDiscriminantValues.filter(
        (discriminantValue) =>
            !schemaDefinitions.some(
                ({ discriminantValue: discriminantValueForThisSchema }) =>
                    discriminantValue === discriminantValueForThisSchema
            )
    );

    expect(missingMembers).toEqual([]);
};

describe(`resolveMemberSchemasForUnion`, () => {
    describe(`when there are multiple union members with no nesting`, () => {
        it(`should resolve the members`, () => {
            const result = resolveMemberSchemasForUnion(
                [Widget, ThingDataOne, ThingDataTwo],
                'THING_UNION'
            );

            assertMembersResolved(result, 2, ['one', 'two']);
        });
    });

    describe(`when there is a nested type that leverages another union`, () => {
        it.todo('should have a test');
    });

    describe(`when there is a nested type that does not leverage another union`, () => {
        it.todo('should have a test');
    });
});
