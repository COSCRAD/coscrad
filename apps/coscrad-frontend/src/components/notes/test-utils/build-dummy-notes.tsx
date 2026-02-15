import {
    EdgeConnectionMemberRole,
    EdgeConnectionType,
    IMultilingualText,
    INoteViewModel,
    LanguageCode,
    MultilingualTextItemRole,
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

export const buildMultilingualTextFromEnglishOriginal = (text: string): IMultilingualText => ({
    items: [
        {
            text,
            role: MultilingualTextItemRole.original,
            languageCode: LanguageCode.English,
        },
    ],
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
    name: buildMultilingualTextFromEnglishOriginal(`name for self-note: ${index}`),
    note: buildMultilingualTextFromEnglishOriginal(`note for item ${index}`),
    connectedResources: {
        self: {
            resource: member.compositeIdentifier,
            context: member.context,
        },
    },
}));

// TODO share formatters with back end
const formatCompositeIdentifier = ({ type, id }: ResourceCompositeIdentifier) => `${type}/${id}`;

export const buildDummyDualEdgeConnection = (
    fromCompositeIdentifier: ResourceCompositeIdentifier,
    toCompositeIdentifier: ResourceCompositeIdentifier,
    id: string
): INoteViewModel => {
    const toMember = buildMemberWithGeneralContext(
        toCompositeIdentifier,
        EdgeConnectionMemberRole.to
    );

    const fromMember = buildMemberWithGeneralContext(
        fromCompositeIdentifier,
        EdgeConnectionMemberRole.from
    );

    return {
        connectionType: EdgeConnectionType.dual,
        id,
        name: buildMultilingualTextFromEnglishOriginal(
            `This is why ${formatCompositeIdentifier(
                fromCompositeIdentifier
            )} is connected to ${formatCompositeIdentifier(toCompositeIdentifier)}`
        ),
        note: buildMultilingualTextFromEnglishOriginal(
            `This is why ${formatCompositeIdentifier(
                fromCompositeIdentifier
            )} is connected to ${formatCompositeIdentifier(toCompositeIdentifier)}`
        ),
        connectedResources: {
            to: {
                resource: toMember.compositeIdentifier,
                context: toMember.context,
            },
            from: {
                resource: fromMember.compositeIdentifier,
                context: fromMember.context,
            },
        },
    };
};

const dualEdgeConnections: INoteViewModel[] = [
    {
        id: '111',
        name: buildMultilingualTextFromEnglishOriginal('name for 111'),
        note: buildMultilingualTextFromEnglishOriginal(
            `This is why book 123 is related to media item 29`
        ),
        connectedResources: {
            to: {
                resource: {
                    type: ResourceType.digitalText,
                    id: '123789',
                },
                context: generalContext,
            },
            from: {
                resource: {
                    type: ResourceType.mediaItem,
                    id: '29',
                },
                context: generalContext,
            },
        },
    },
    {
        id: '112',
        name: buildMultilingualTextFromEnglishOriginal('name for 112'),
        note: buildMultilingualTextFromEnglishOriginal(
            `This is why term 5 is related to audio item 8`
        ),
        connectedResources: {
            to: {
                resource: {
                    type: ResourceType.term,
                    id: '5',
                },
                context: generalContext,
            },
            from: {
                resource: {
                    type: ResourceType.audioItem,
                    id: '8',
                },
                context: generalContext,
            },
        },
    },
    {
        id: '113',
        name: buildMultilingualTextFromEnglishOriginal('name for 113'),
        note: buildMultilingualTextFromEnglishOriginal(
            `This is why spatial feature 12 is related to photograph 293`
        ),
        connectedResources: {
            to: {
                resource: {
                    type: ResourceType.spatialFeature,
                    id: '12',
                },
                context: generalContext,
            },
            from: {
                context: generalContext,
                resource: {
                    type: ResourceType.photograph,
                    id: '293',
                },
            },
        },
    },
].map((partial) => ({
    ...partial,
    connectionType: EdgeConnectionType.dual,
}));

export const buildDummyNotes = (desiredEdgeConnectionType?: EdgeConnectionType) => [
    ...(desiredEdgeConnectionType === EdgeConnectionType.self ? [] : dualEdgeConnections),
    ...(desiredEdgeConnectionType === EdgeConnectionType.dual ? [] : selfEdgeConnections),
];
