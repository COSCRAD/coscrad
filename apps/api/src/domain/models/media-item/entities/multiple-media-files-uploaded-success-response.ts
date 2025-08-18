import { NestedDataType } from '@coscrad/data-types';
import { DTO } from '../../../../types/DTO';
import BaseDomainModel from '../../base-domain-model.entity';
import { SuccessfulMediaUploadRecord } from './successful-media-upload-record';

export class MultipleMediaFilesUploadedSuccessResponse extends BaseDomainModel {
    @NestedDataType(SuccessfulMediaUploadRecord, {
        isOptional: false,
        isArray: true,
        label: 'uploaded media files',
        description: 'an array of uploaded media file metadata',
    })
    public readonly uploadedMediaFiles: SuccessfulMediaUploadRecord[];

    constructor(dto: DTO<MultipleMediaFilesUploadedSuccessResponse>) {
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
