import { AggregateType } from '@coscrad/api-interfaces';
import { bootstrapDynamicTypes } from '@coscrad/data-types';
import assertErrorAsExpected from '../../../lib/__tests__/assertErrorAsExpected';
import { buildTestInstance } from '../../../test-data/utilities';
import buildDummyUuid from '../__tests__/utilities/buildDummyUuid';
import { EdgeConnectionContextUnion } from './edge-connection-context-union';
import {
    EdgeConnection,
    EdgeConnectionMember,
    EdgeConnectionMemberRole,
    EdgeConnectionType,
} from './edge-connection.entity';
import { EdgeAlreadyPublishedError } from './errors';
import { GeneralContext } from './general-context/general-context.entity';

const noteMembers = [
    buildTestInstance(EdgeConnectionMember, {
        role: EdgeConnectionMemberRole.self,
    }),
];

const connectionMembers = [
    buildTestInstance(EdgeConnectionMember, {
        role: EdgeConnectionMemberRole.from,
        compositeIdentifier: {
            type: AggregateType.term,
            id: buildDummyUuid(908),
        },
    }),
    buildTestInstance(EdgeConnectionMember, {
        role: EdgeConnectionMemberRole.to,
        compositeIdentifier: {
            type: AggregateType.song,
            id: buildDummyUuid(909),
        },
    }),
];

describe(`EdgeConnection.publish`, () => {
    beforeAll(() => {
        bootstrapDynamicTypes([EdgeConnection, EdgeConnectionContextUnion, GeneralContext]);
    });

    describe(`when the update is valid`, () => {
        describe(`when the edge is a note`, () => {
            const unpublishedNote = buildTestInstance(EdgeConnection, {
                isPublished: false,
                connectionType: EdgeConnectionType.self,
                members: noteMembers,
            });

            it(`should publish the edge`, () => {
                const updateResult = unpublishedNote.publish();

                expect(updateResult).toBeInstanceOf(EdgeConnection);

                expect((updateResult as EdgeConnection).isPublished).toBe(true);
            });
        });

        describe(`when the edge is a connection`, () => {
            const unpublishedConnection = buildTestInstance(EdgeConnection, {
                isPublished: false,
                connectionType: EdgeConnectionType.dual,
                members: connectionMembers,
            });

            it(`should publish the edge`, () => {
                const updateResult = unpublishedConnection.publish();

                expect(updateResult).toBeInstanceOf(EdgeConnection);

                expect((updateResult as EdgeConnection).isPublished).toBe(true);
            });
        });
    });

    describe(`when the update is invalid`, () => {
        describe(`when the edge is already published`, () => {
            describe(`when the edge is a note`, () => {
                it(`should return the expected error`, () => {
                    const publishedNote = buildTestInstance(EdgeConnection, {
                        isPublished: true,
                        connectionType: EdgeConnectionType.self,
                        members: noteMembers,
                    });

                    const result = publishedNote.publish();

                    assertErrorAsExpected(result, new EdgeAlreadyPublishedError(publishedNote.id));
                });
            });

            describe(`when the edge is a connection`, () => {
                it(`should return the expected error`, () => {
                    const publishedNote = buildTestInstance(EdgeConnection, {
                        isPublished: true,
                        connectionType: EdgeConnectionType.dual,
                        members: connectionMembers,
                    });

                    const result = publishedNote.publish();

                    assertErrorAsExpected(result, new EdgeAlreadyPublishedError(publishedNote.id));
                });
            });
        });
    });
});
