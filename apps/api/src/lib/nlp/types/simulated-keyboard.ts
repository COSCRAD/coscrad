import { NestedDataType, NonEmptyString } from '@coscrad/data-types';
import { RecordObject } from '../../../domain/site-configuration/record-object';

export class SimulatedKeyboard {
    @NonEmptyString({
        label: 'name',
        description: 'name of simulated keyboard',
    })
    name: string;

    @NestedDataType(RecordObject, {
        label: 'special character replacements',
        description: 'special character replacements',
    })
    specialCharacterReplacements: RecordObject;
}
