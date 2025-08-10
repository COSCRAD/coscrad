import { ExternalEnum, MIMEType, NonEmptyString } from '@coscrad/data-types';
import { DTO } from '../../../../types/DTO';
import BaseDomainModel from '../../base-domain-model.entity';

export class UploadedMediaFile extends BaseDomainModel {
    @NonEmptyString({
        label: 'filename',
        description: 'the original name of the uploaded media item file',
    })
    public readonly uploadedFilename: string;

    @NonEmptyString({
        label: 'filename',
        description: 'the name of the uploaded media item file assigned by the system',
    })
    public readonly systemFilename: string;

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

    // Probably superfluous?  Or maybe this goes in the rawData?
    @NonEmptyString({
        label: 'MIME type from browser',
        description:
            'technical specification of the format of the media item provided by the browser',
    })
    readonly mimeTypeFromBrowser: string;

    constructor(dto: DTO<UploadedMediaFile>) {
        super();

        if (!dto) return;

        const { uploadedFilename, systemFilename, mimeType, mimeTypeFromBrowser } = dto;

        this.uploadedFilename = uploadedFilename;

        this.systemFilename = systemFilename;

        this.mimeType = mimeType;

        this.mimeTypeFromBrowser = mimeTypeFromBrowser;
    }
}
