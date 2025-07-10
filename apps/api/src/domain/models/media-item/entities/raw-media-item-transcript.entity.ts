import { isNonEmptyObject } from '@coscrad/validation-constraints';
import cloneToPlainObject from '../../../../lib/utilities/cloneToPlainObject';
import { CoscradDataExample } from '../../../../test-data/utilities';
import { DTO } from '../../../../types/DTO';
import BaseDomainModel from '../../base-domain-model.entity';

export enum RawMediaItemTranscriptType {
    asr = 'Machine Generated (asr)',
    docx = 'Docx',
    tsv = 'Track Labels (tsv)',
}

@CoscradDataExample<RawMediaItemTranscript>({
    example: {
        type: RawMediaItemTranscriptType.asr,
        source: 'whisper-local',
        version: '25.4',
        // This needs to be added to views using the event history
        // timestamp: dummyDateNow,
        data: null,
    },
})
export class RawMediaItemTranscript extends BaseDomainModel {
    readonly type: RawMediaItemTranscriptType;

    readonly source: string;

    readonly version: string;

    readonly data: Record<string, unknown>;

    constructor(dto: DTO<RawMediaItemTranscript>) {
        super();

        if (!dto) return;

        const { type, source, version, data } = dto;

        this.type = type;

        this.source = source;

        this.version = version;

        if (isNonEmptyObject(data)) {
            this.data = cloneToPlainObject(data);
        }
    }
}
