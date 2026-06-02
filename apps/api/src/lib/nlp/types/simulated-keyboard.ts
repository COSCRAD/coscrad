import { NestedDataType, NonEmptyString } from '@coscrad/data-types';

type SpecialCharacterReplacements = Record<string, string>;

export class SimulatedKeyboard {
    @NonEmptyString({
        label: 'name',
        description: 'name of simulated keyboard',
    })
    name: string;

    @NestedDataType(SpecialCharacterReplacements, {
        label: 'special character replacements',
        description: 'special character replacements',
    })
    specialCharacterReplacements: SpecialCharacterReplacements;
}
