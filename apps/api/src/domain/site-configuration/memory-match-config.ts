import { BooleanDataType } from '@coscrad/data-types';

export class MemoryMatchConfig {
    @BooleanDataType({
        label: 'should enable memory match',
        description: 'boolean flag for enabling the memory match feature',
    })
    isEnabled: boolean;
}
