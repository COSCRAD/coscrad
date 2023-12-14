import { IDigitalTextPage, LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { NestedDataType, PageNumber } from '@coscrad/data-types';
import { isInternalError } from '../../../../lib/errors/InternalError';
import { Maybe } from '../../../../lib/types/maybe';
import { NotFound } from '../../../../lib/types/not-found';
import { DTO } from '../../../../types/DTO';
import { ResultOrError } from '../../../../types/ResultOrError';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../../common/entities/multilingual-text';
import { AggregateId } from '../../../types/AggregateId';
import { isNullOrUndefined } from '../../../utilities/validation/is-null-or-undefined';
import BaseDomainModel from '../../BaseDomainModel';
import { MultilingualAudio } from '../../shared/multilingual-audio/multilingual-audio.entity';
import { CannotOverwritePageContentError } from '../errors/cannot-overwrite-page-content.error';
import { PageIdentifier } from './types/page-identifier';

export default class DigitalTextPage extends BaseDomainModel implements IDigitalTextPage {
    @PageNumber({
        label: 'identifier',
        description: 'text identifier for the page',
    })
    readonly identifier: PageIdentifier;

    @NestedDataType(MultilingualText, {
        label: 'content',
        description: '(multilingual text) content for this page',
        isOptional: true,
    })
    /**
     * This is optional because users sometimes register the existence of a page
     * by identifier (page number), even though they do not have access to or
     * do not want to invest the time in adding the content at that point in
     * time.
     */
    readonly content?: MultilingualText;

    @NestedDataType(MultilingualAudio, {
        label: `multilingual audio`,
        description: `maintains references to audio in available languages`,
    })
    readonly audio: MultilingualAudio;

    constructor(dto: DTO<DigitalTextPage>) {
        super();

        if (!dto) return;

        const { identifier, content } = dto;

        // Note that this is just a string (stored by value not reference), so there is no need to clone or build an instance
        this.identifier = identifier;

        this.content = !isNullOrUndefined(content) ? new MultilingualText(content) : null;
    }

    addContent(text: string, languageCode: LanguageCode): ResultOrError<DigitalTextPage> {
        if (this.hasContent()) {
            return new CannotOverwritePageContentError(this.identifier, this.content);
        }

        /**
         * TODO Validate invariants as in `safeClone`.
         */
        return this.clone<DigitalTextPage>({
            content: buildMultilingualTextWithSingleItem(text, languageCode),
        });
    }

    translateContent(text: string, languageCode: LanguageCode): ResultOrError<DigitalTextPage> {
        const contentUpdateResult = this.content.translate({
            text,
            languageCode,
            role: MultilingualTextItemRole.freeTranslation,
        });

        if (isInternalError(contentUpdateResult)) return contentUpdateResult;

        return this.clone<DigitalTextPage>({
            content: contentUpdateResult,
        });
    }

    hasContent(): boolean {
        return !isNullOrUndefined(this.content);
    }

    getContent(): Maybe<MultilingualText> {
        if (!this.hasContent()) return NotFound;

        return this.content.clone({});
    }

    hasAudio(): boolean {
        return this.audio.count() > 0;
    }

    addAudio(audioItemId: AggregateId, languageCode: LanguageCode) {
        const updatedAudio = this.audio.addAudio(audioItemId, languageCode) as MultilingualAudio;

        return this.clone<DigitalTextPage>({
            audio: updatedAudio,
        });
    }
}
