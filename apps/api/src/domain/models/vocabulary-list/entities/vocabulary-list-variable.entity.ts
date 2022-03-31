import { ApiProperty } from '@nestjs/swagger';
import { DropboxOrCheckbox } from 'apps/api/src/domain/models/vocabulary-list/types/dropbox-or-checkbox';
import { VocabularyListVariableValue } from 'apps/api/src/domain/models/vocabulary-list/types/vocabulary-list-variable-value';
import { ValueAndDisplay } from './value-and-display.entity';

/**
 * TODO correlate `type` and `validValues`
 * type:dropbox <-> string values
 * type:checkbox <-> boolean values
 */
export class VocabularyListVariable<
    TVariableType extends VocabularyListVariableValue = VocabularyListVariableValue
> {
    @ApiProperty({
        example: 'person',
        description: 'name of a property that parametrizes terms in the list',
    })
    name: string;

    @ApiProperty({
        example: 'dropbox',
        description:
            'specifies whether the corresponding field be a dropbox (select) or slider (switch)',
    })
    type: DropboxOrCheckbox;

    @ApiProperty({
        description: 'specifies the value and label for the corresponding form element',
    })
    validValues: ValueAndDisplay<TVariableType>[];
}
