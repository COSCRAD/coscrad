import { IVocabularyListVariable } from '@coscrad/api-interfaces';
import { NonEmptyString } from '@coscrad/data-types';
import { ApiProperty } from '@nestjs/swagger';
import { DropboxOrCheckbox } from '../../vocabulary-list/types/dropbox-or-checkbox';
import { VocabularyListVariableValue } from '../../vocabulary-list/types/vocabulary-list-variable-value';
import { ValueAndDisplay } from './value-and-display.entity';

/**
 * TODO correlate `type` and `validValues`
 * type:dropbox <-> string values
 * type:checkbox <-> boolean values
 */
export class VocabularyListVariable<
    TVariableType extends VocabularyListVariableValue = VocabularyListVariableValue
> implements IVocabularyListVariable<TVariableType>
{
    @ApiProperty({
        example: 'person',
        description: 'name of a property that parametrizes terms in the list',
    })
    @NonEmptyString()
    name: string;

    @ApiProperty({
        example: 'dropbox',
        description:
            'specifies whether the corresponding field be a dropbox (select) or slider (switch)',
    })
    // TODO Support `DropboxOrCheckbox` enum data-type
    type: DropboxOrCheckbox;

    @ApiProperty({
        description: 'specifies the value and label for the corresponding form element',
    })
    // TODO Add data-type decorator
    validValues: ValueAndDisplay<TVariableType>[];
}
