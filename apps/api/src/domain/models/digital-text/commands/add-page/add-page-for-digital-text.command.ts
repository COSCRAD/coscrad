import { ICommandBase } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType, NonEmptyString } from '@coscrad/data-types';
import { PageIdentifier } from '../../../book/entities/types/PageIdentifier';
import { ADD_PAGE_FOR_DIGITAL_TEXT } from '../../constants';
import { DigitalTextCompositeId } from '../create-digital-text.command';

@Command({
    type: ADD_PAGE_FOR_DIGITAL_TEXT,
    description: `Add a page identifier to a digital text`,
    label: `Add page to digital text`,
})
export class AddPageForDigitalText implements ICommandBase {
    @NestedDataType(DigitalTextCompositeId, {
        label: 'Composite Identifier',
        description: 'system-wide unique identifier',
    })
    readonly aggregateCompositeIdentifier: DigitalTextCompositeId;

    @NonEmptyString({
        label: 'page identifier',
        description: 'the identifier for the page in a paginated digital text',
    })
    readonly pageIdentifier: PageIdentifier;
}
