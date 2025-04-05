import { AggregateType, MIMEType } from '@coscrad/api-interfaces';

export const seedDummyMediaItem = ({
    id,
    title,
    mimeType,
}: {
    id: string;
    title: string;
    mimeType: MIMEType;
}) => {
    const aggregateCompositeIdentifier = {
        type: AggregateType.mediaItem,
        id,
    };

    cy.seedDataWithCommand(`CREATE_MEDIA_ITEM`, {
        aggregateCompositeIdentifier,
        title: title,
        mimeType: mimeType,
        // Override default value to "remove" property from fsa for image media item
        lengthMilliseconds: null,
    });

    cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
        aggregateCompositeIdentifier,
    });
};
