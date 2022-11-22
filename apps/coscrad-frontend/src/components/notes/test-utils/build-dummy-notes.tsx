import {
    EdgeConnectionMemberRole,
    EdgeConnectionType,
    INoteViewModel,
    ResourceCompositeIdentifier,
    ResourceType,
} from '@coscrad/api-interfaces';

const generalContext = {
    type: 'general',
};

export const buildMemberWithGeneralContext = (
    compositeIdentifier: ResourceCompositeIdentifier,
    role: EdgeConnectionMemberRole
) => ({
    context: generalContext,
    role,
    compositeIdentifier,
});

const buildOneMemberForEveryResourceType = (role: EdgeConnectionMemberRole) =>
    Object.values(ResourceType).map((resourceType, index) =>
        buildMemberWithGeneralContext({ type: resourceType, id: index.toString() }, role)
    );

const selfEdgeConnections: INoteViewModel[] = buildOneMemberForEveryResourceType(
    EdgeConnectionMemberRole.self
).map((member, index) => ({
    connectionType: EdgeConnectionType.self,
    id: index.toString(),
    note: `note for item ${index}`,
    connectedResources: [member],
}));

// TODO share formatters with back end
const formatCompositeIdentifier = ({ type, id }: ResourceCompositeIdentifier) => `${type}/${id}`;

export const buildDummyDualEdgeConnection = (
    fromCompositeIdentifier: ResourceCompositeIdentifier,
    toCompositeIdentifier: ResourceCompositeIdentifier,
    id: string
): INoteViewModel => ({
    connectionType: EdgeConnectionType.dual,
    id,
    note: `This is why ${formatCompositeIdentifier(
        fromCompositeIdentifier
    )} is connected to ${formatCompositeIdentifier(toCompositeIdentifier)}`,
    connectedResources: [
        buildMemberWithGeneralContext(fromCompositeIdentifier, EdgeConnectionMemberRole.from),
        buildMemberWithGeneralContext(toCompositeIdentifier, EdgeConnectionMemberRole.to),
    ],
});

const dualEdgeConnections: INoteViewModel[] = [
    {
        id: '111',
        note: `This is why book 123 is related to media item 29`,
        connectedResources: [
            buildMemberWithGeneralContext(
                {
                    type: ResourceType.book,
                    id: '123',
                },
                EdgeConnectionMemberRole.to
            ),
            buildMemberWithGeneralContext(
                {
                    type: ResourceType.mediaItem,
                    id: '29',
                },
                EdgeConnectionMemberRole.to
            ),
        ],
    },
    {
        id: '112',
        note: `This is why term 5 is related to audio transcript 8`,
        connectedResources: [
            buildMemberWithGeneralContext(
                {
                    type: ResourceType.term,
                    id: '5',
                },
                EdgeConnectionMemberRole.to
            ),
            buildMemberWithGeneralContext(
                {
                    type: ResourceType.transcribedAudio,
                    id: '8',
                },
                EdgeConnectionMemberRole.to
            ),
        ],
    },
    {
        id: '113',
        note: `This is why spatial feature 12 is related to photograph 293`,
        connectedResources: [
            buildMemberWithGeneralContext(
                {
                    type: ResourceType.spatialFeature,
                    id: '12',
                },
                EdgeConnectionMemberRole.to
            ),
            buildMemberWithGeneralContext(
                {
                    type: ResourceType.photograph,
                    id: '293',
                },
                EdgeConnectionMemberRole.to
            ),
        ],
    },
].map((partial) => ({
    ...partial,
    connectionType: EdgeConnectionType.dual,
}));

export const buildDummyNotes = (desiredEdgeConnectionType?: EdgeConnectionType) => [
    ...(desiredEdgeConnectionType === EdgeConnectionType.self ? [] : dualEdgeConnections),
    ...(desiredEdgeConnectionType === EdgeConnectionType.dual ? [] : selfEdgeConnections),
];
