import { AggregateCompositeIdentifier, ICommandBase, LanguageCode } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType, NonEmptyString } from '@coscrad/data-types';
import { LanguageCodeEnum } from '../../../../../domain/common/entities/multilingual-text';
import { VideoCompositeIdentifier } from '../../entities';
import { TRANSLATE_VIDEO_NAME } from '../constants';

@Command({
    type: TRANSLATE_VIDEO_NAME,
    label: 'Translate Video Name',
    description: 'Translate the name of a video to an additional language',
})
export class TranslateVideoName implements ICommandBase {
    @NestedDataType(VideoCompositeIdentifier, {
        label: 'Composite Identifier',
        description: 'system-wide unique identifier',
    })
    readonly aggregateCompositeIdentifier: AggregateCompositeIdentifier;

    @LanguageCodeEnum({
        label: 'language code',
        description: 'the language in which you are naming the new video name',
    })
    readonly languageCode: LanguageCode;

    @NonEmptyString({
        label: 'translation',
        description: 'text for the translation of the name',
    })
    readonly text: string;
}
