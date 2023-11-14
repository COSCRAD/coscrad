import { ICommandBase } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType, NonEmptyString } from '@coscrad/data-types';
import { ADD_PAGE_TO_DIGITAL_TEXT } from '../../constants';
import { PageIdentifier } from '../../entities';
import { DigitalTextCompositeId } from '../create-digital-text.command';

@Command({
    type: ADD_PAGE_TO_DIGITAL_TEXT,
    description: `Add a page identifier to a digital text`,
    label: `Add Page to Digital Text`,
})
export class AddPageToDigitalText implements ICommandBase {
    @NestedDataType(DigitalTextCompositeId, {
        label: 'Composite Identifier',
        description: 'system-wide unique identifier',
    })
    readonly aggregateCompositeIdentifier: DigitalTextCompositeId;

    @NonEmptyString({
        label: 'page identifier',
        description: 'the identifier for the page (i.e., the "page number")',
    })
    readonly identifier: PageIdentifier;
}
