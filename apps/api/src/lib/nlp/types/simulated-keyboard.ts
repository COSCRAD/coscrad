import { NestedDataType, NonEmptyString, RawDataObject } from '@coscrad/data-types';

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
}
