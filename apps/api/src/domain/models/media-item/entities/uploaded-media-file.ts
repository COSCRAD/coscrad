import { ExternalEnum, MIMEType, NonEmptyString } from '@coscrad/data-types';
import { DTO } from '../../../../types/DTO';
import BaseDomainModel from '../../base-domain-model.entity';

export class UploadedMediaFile extends BaseDomainModel {
    @NonEmptyString({
        label: 'filename',
        description: 'the name of the uploaded media item file',
    })
    public readonly filename: string;

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

    constructor(dto: DTO<UploadedMediaFile>) {
        super();

        if (!dto) return;

        const { filename, mimeType } = dto;

        this.filename = filename;

        this.mimeType = mimeType;
    }
}
