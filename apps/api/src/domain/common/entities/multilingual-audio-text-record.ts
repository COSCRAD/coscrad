import { IToken, LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { DTO } from '../../../types/DTO';
import { MultilingualText } from './multilingual-text';

export class MultilingualAudioTextItemRecord {
    audioUrl?: string;
    text: string;
    tokens?: IToken;

    constructor({ audioUrl, text, tokens }: MultilingualAudioTextItemRecord) {
        this.audioUrl = audioUrl;

        this.text = text;

        this.tokens = tokens;
    }
}

/**
 * This provides a view for `MultilingualText`. It eagerly sorts the text
 * in a way that is better suited for presentation.
 *
 * In the future, we may want to store audio associated with text on the domain model as well.
 */
export class MultilingualAudioTextRecord {
    original: MultilingualAudioTextItemRecord;

    originalLanguageCode: LanguageCode;

    translations: Partial<
        Record<
            LanguageCode,
            Partial<Record<MultilingualTextItemRole, MultilingualAudioTextItemRecord>>
        >
    >;

    constructor({
        original,
        originalLanguageCode,
        translations,
    }: DTO<MultilingualAudioTextRecord>) {
        this.original = original;

        this.originalLanguageCode = originalLanguageCode;

        this.translations = translations;
    }

    translate(
        text: string,
        languageCode: LanguageCode,
        translationType: MultilingualTextItemRole
    ): MultilingualAudioTextRecord {
        if (!(languageCode in this.translations)) {
            this.translations[languageCode] = {};
        }

        // TODO should this be a map?
        this.translations[languageCode][translationType] = { text };

        return this;
    }

    static fromMultilingualText(text: MultilingualText): MultilingualAudioTextRecord {
        const { text: originalText, languageCode: originalLanguageCode } =
            text.getOriginalTextItem();

        const converted = text.items.reduce(
            (acc, item) => {
                if (item.languageCode === originalLanguageCode) {
                    return acc;
                }

                return acc.translate(item.text, item.languageCode, item.role);
            },
            new MultilingualAudioTextRecord({
                original: new MultilingualAudioTextItemRecord({
                    text: originalText,
                }),
                originalLanguageCode,
                translations: {},
            })
        );

        return converted;
    }
}
