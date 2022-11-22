import { EdgeConnectionMemberRole, INoteViewModel, ResourceType } from '@coscrad/api-interfaces';
import { focusDualConnectionOnResource } from './focus-dual-connection-on-resource';
import { ConnectedResource } from './use-loadable-connections-to-resource';

const termContext = {
    type: 'timeRangeContext',
};

const bookContext = {
    type: 'general',
};

const termCompositeIdentifier = {
    type: ResourceType.term,
    id: '123',
};

const bookCompositeIdentifier = {
    type: ResourceType.book,
    id: '5',
};

const dummyEdgeConnection: INoteViewModel = {
    id: '1',
    note: 'this is why term 123 is related to book 5',
    connectedResources: [
        {
            compositeIdentifier: termCompositeIdentifier,
            context: termContext,
            role: EdgeConnectionMemberRole.to,
        },
        {
            compositeIdentifier: bookCompositeIdentifier,
            context: bookContext,
            role: EdgeConnectionMemberRole.from,
        },
    ],
};

const expectedOutput: ConnectedResource = {
    otherContext: bookContext,
    selfContext: termContext,
    compositeIdentifier: bookCompositeIdentifier,
};

describe('focusDualEdgeConnectionOnResource', () => {
    describe('when given a valid dual edge connection', () => {
        it('should return the expected result', () => {
            const result =
                focusDualConnectionOnResource(termCompositeIdentifier)(dummyEdgeConnection);

            expect(result).toEqual(expectedOutput);
        });
    });
});
