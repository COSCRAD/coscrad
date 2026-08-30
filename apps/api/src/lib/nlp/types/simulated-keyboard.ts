import { NestedDataType, NonEmptyString, RawDataObject } from '@coscrad/data-types';
import { DeepPartial } from '../../../types/DeepPartial';
import { DTO } from '../../../types/DTO';

export class SimulatedKeyboard {
    @NonEmptyString({
        label: 'name',
        description: 'name of simulated keyboard',
    })
    name: string;

    @NestedDataType(RawDataObject, {
        label: 'special character replacements',
        description: 'special character replacements',
    })
    specialCharacterReplacements: Record<string, string>;

    constructor(dto: DeepPartial<DTO<SimulatedKeyboard>>) {
        if (!dto) return;

        const { name, specialCharacterReplacements } = dto;

        this.name = name;

        this.specialCharacterReplacements = specialCharacterReplacements;
    }
}
