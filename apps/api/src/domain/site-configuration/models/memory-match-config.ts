import { BooleanDataType } from '@coscrad/data-types';
import { DTO } from '../../../types/DTO';

export class MemoryMatchConfig {
    @BooleanDataType({
        label: 'should enable memory match',
        description: 'boolean flag for enabling the memory match feature',
    })
    isEnabled: boolean;

    constructor(dto: DTO<MemoryMatchConfig>) {
        if (!dto) return;

        const { isEnabled } = dto;

        this.isEnabled = isEnabled;
    }
}
