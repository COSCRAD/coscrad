import { ICommandBase, LanguageCode } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { BindToViewState, NestedDataType, NonEmptyString } from '@coscrad/data-types';
import { LanguageCodeEnum } from '../../../../common/entities/multilingual-text';
import { PageIdentifier } from '../../../book/entities/types/PageIdentifier';
import { DigitalTextCompositeId } from '../create-digital-text.command';

@Command({
    type: 'ADD_CONTENT_TO_DIGITAL_TEXT_PAGE',
    description: `Add content to an empty page`,
    label: `Add Content to Page`,
})
export class AddContentToDigitalTextPage implements ICommandBase {
    @NestedDataType(DigitalTextCompositeId, {
        label: 'Composite Identifier',
        description: 'system-wide unique identifier',
    })
    readonly aggregateCompositeIdentifier: DigitalTextCompositeId;

    @BindToViewState('currentPage')
    @NonEmptyString({
        label: 'page identifier',
        description: 'identifier for a digital text page',
    })
    readonly pageIdentifier: PageIdentifier;

    @BindToViewState('newPageContent')
    @NonEmptyString({
        label: 'text content',
        description: 'text content for the current page',
    })
    readonly text: string;

    @BindToViewState('newPageContentLanguageCode')
    @LanguageCodeEnum({
        label: 'language',
        description: 'language for text content',
    })
    readonly languageCode: LanguageCode;
}
