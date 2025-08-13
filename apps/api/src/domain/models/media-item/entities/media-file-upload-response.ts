import { NestedDataType } from '@coscrad/data-types';
import { DTO } from '../../../../types/DTO';
import BaseDomainModel from '../../base-domain-model.entity';
import { SuccessfulMediaUploadRecord } from './uploaded-media-file';

export class MediaFileUploadResponse extends BaseDomainModel {
    @NestedDataType(SuccessfulMediaUploadRecord, {
        isOptional: false,
        isArray: true,
        label: 'uploaded media files',
        description: 'an array of uploaded media file metadata',
    })
    public readonly uploadedMediaFiles: SuccessfulMediaUploadRecord[];

    constructor(dto: DTO<MediaFileUploadResponse>) {
        super();

        if (!dto) return;

        const { uploadedMediaFiles: uploadedMediaFileDTOs } = dto;

        this.uploadedMediaFiles = Array.isArray(uploadedMediaFileDTOs)
            ? uploadedMediaFileDTOs.map(
                  (uploadedMediaFileDTO) => new SuccessfulMediaUploadRecord(uploadedMediaFileDTO)
              )
            : undefined;
    }
}
