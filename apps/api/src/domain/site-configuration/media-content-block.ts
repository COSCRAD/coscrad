import { ExternalEnum, MIMEType, NonEmptyString, URL } from '@coscrad/data-types';

// Not sure which if any properties are optional

export class MediaContentBlock {
    @NonEmptyString({
        label: 'name',
        description: 'name of media',
    })
    title: string;

    @URL({
        label: 'url',
        description: 'url for the media',
    })
    url: string;

    @NonEmptyString({
        label: 'description',
        description: 'description for the media',
    })
    description: string;

    @ExternalEnum(
        {
            labelsAndValues: Object.entries(MIMEType).map(([label, value]) => ({ label, value })),
            enumLabel: 'MIME type',
            enumName: 'MIMEType',
        },
        {
            label: 'MIME type',
            description: 'technical specification of the format of the media item',
        }
    )
    readonly mimeType: MIMEType;
}
