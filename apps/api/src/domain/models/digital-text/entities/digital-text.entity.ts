import { LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { NestedDataType } from '@coscrad/data-types';
import { isNonEmptyString, isNullOrUndefined } from '@coscrad/validation-constraints';
import { RegisterIndexScopedCommands } from '../../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { InternalError, isInternalError } from '../../../../lib/errors/InternalError';
import { ValidationResult } from '../../../../lib/errors/types/ValidationResult';
import { Maybe } from '../../../../lib/types/maybe';
import { NotFound, isNotFound } from '../../../../lib/types/not-found';
import { DTO } from '../../../../types/DTO';
import { ResultOrError } from '../../../../types/ResultOrError';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../../common/entities/multilingual-text';
import { AggregateRoot } from '../../../decorators';
import { Valid, isValid } from '../../../domainModelValidators/Valid';
import { EmptyPageRangeContextError } from '../../../domainModelValidators/errors/context/invalidContextStateErrors/pageRangeContext';
import PageRangeContextHasSuperfluousPageIdentifiersError from '../../../domainModelValidators/errors/context/invalidContextStateErrors/pageRangeContext/page-range-context-has-superfluous-page-identifiers.error';
import { AggregateCompositeIdentifier } from '../../../types/AggregateCompositeIdentifier';
import { AggregateId } from '../../../types/AggregateId';
import { AggregateType } from '../../../types/AggregateType';
import { ResourceType } from '../../../types/ResourceType';
import { Snapshot } from '../../../types/Snapshot';
import {
    CreationEventHandlerMap,
    buildAggregateRootFromEventHistory,
} from '../../build-aggregate-root-from-event-history';
import { PageRangeContext } from '../../context/page-range-context/page-range.context.entity';
import { Resource } from '../../resource.entity';
import InvalidExternalStateError from '../../shared/common-command-errors/InvalidExternalStateError';
import { BaseEvent } from '../../shared/events/base-event.entity';
import { MultilingualAudio } from '../../shared/multilingual-audio/multilingual-audio.entity';
import {
    AudioAddedForDigitalTextPage,
    AudioAddedForDigitalTextTitle,
    DigitalTextCreated,
    DigitalTextPageContentTranslated,
    DigitalTextTitleTranslated,
    PageAddedToDigitalText,
} from '../commands';
import { ContentAddedToDigitalTextPage } from '../commands/add-content-to-digital-text-page';
import { ADD_PAGE_TO_DIGITAL_TEXT, CREATE_DIGITAL_TEXT } from '../constants';
import {
    CannotAddPhotographForMissingPageError,
    FailedToUpdateDigitalTextPageError,
} from '../errors';
import { CannotAddAudioForTitleInGivenLanguageError } from '../errors/cannot-add-audio-for-title-in-given-language.error';
import { CannotAddPageWithDuplicateIdentifierError } from '../errors/cannot-add-page-with-duplicate-identifier.error';
import { CannotOverrideAudioForPageError } from '../errors/cannot-override-audio-for-page.error';
import { DuplicateDigitalTextTitleError } from '../errors/duplicate-digital-text-title.error';
import { MissingPageContentError } from '../errors/missing-page-content.error';
import { MissingPageError } from '../errors/missing-page.error';
import DigitalTextPage from './digital-text-page.entity';
import { PageIdentifier } from './types/page-identifier';

@AggregateRoot(AggregateType.digitalText)
@RegisterIndexScopedCommands([CREATE_DIGITAL_TEXT])
export class DigitalText extends Resource {
    readonly type = ResourceType.digitalText;

    @NestedDataType(MultilingualText, {
        label: 'title',
        description: 'the title of the digital text',
    })
    readonly title: MultilingualText;

    @NestedDataType(MultilingualAudio, {
        label: 'audio for title',
        description: 'contains refereneces to audio for the title',
    })
    readonly audioForTitle: MultilingualAudio;

    @NestedDataType(DigitalTextPage, {
        isOptional: true,
        isArray: true,
        label: 'digital text pages',
        description: "a digital representation of the digital text's pages",
    })
    pages: DigitalTextPage[];

    constructor(dto: DTO<DigitalText>) {
        super({ ...dto, type: ResourceType.digitalText });

        if (!dto) return;

        const { title, pages: pageDTOs, audioForTitle: audioForTitleDto } = dto;

        this.title = new MultilingualText(title);

        this.pages = Array.isArray(pageDTOs)
            ? pageDTOs.map((pageDTO) => new DigitalTextPage(pageDTO))
            : undefined;

        this.audioForTitle = audioForTitleDto ? new MultilingualAudio(audioForTitleDto) : undefined;
    }

    getName(): MultilingualText {
        return this.title.clone();
    }

    protected getResourceSpecificAvailableCommands(): string[] {
        return [ADD_PAGE_TO_DIGITAL_TEXT];
    }

    protected validateComplexInvariants(): InternalError[] {
        return [];
    }

    protected getExternalReferences(): AggregateCompositeIdentifier[] {
        return [];
    }

    validateExternalState(externalState: Snapshot): ValidationResult {
        // TODO All validation methods should return Error[] for composibility
        const idCollisionValidationResult = this.validateExternalReferences(externalState);

        const idCollisionErrors = isValid(idCollisionValidationResult)
            ? []
            : [idCollisionValidationResult];

        const duplicateNameErrors = externalState.resources.digitalText
            .map(({ title }) => title.getOriginalTextItem())
            .filter((otherOriginalTextItem) => {
                const thisOriginalTextItem = this.title.getOriginalTextItem();

                return (
                    otherOriginalTextItem.languageCode === thisOriginalTextItem.languageCode &&
                    otherOriginalTextItem.text === thisOriginalTextItem.text
                );
            })
            .map(
                ({ text, languageCode }) => new DuplicateDigitalTextTitleError(text, languageCode)
            );

        const allErrors = [...idCollisionErrors, ...duplicateNameErrors];

        return allErrors.length > 0 ? new InvalidExternalStateError(allErrors) : Valid;
    }

    addPage(pageIdentifier: PageIdentifier): ResultOrError<DigitalText> {
        if (this.hasPage(pageIdentifier))
            return new CannotAddPageWithDuplicateIdentifierError(this.id, pageIdentifier);

        return this.safeClone<DigitalText>({
            pages: [
                ...this.pages,
                new DigitalTextPage({
                    identifier: pageIdentifier,
                    audio: new MultilingualAudio({ items: [] }),
                }),
            ],
        });
    }

    addContentToPage(
        pageIdentifier: PageIdentifier,
        text: string,
        languageCode: LanguageCode
    ): ResultOrError<DigitalText> {
        if (!this.hasPage(pageIdentifier)) {
            return new FailedToUpdateDigitalTextPageError(pageIdentifier, this.id, [
                new MissingPageError(pageIdentifier, this.id),
            ]);
        }

        // Note that we already have asserted that the page exists, so `NotFound` is not a posisblity here
        const pageUpdateResult = (this.getPage(pageIdentifier) as DigitalTextPage).addContent(
            text,
            languageCode
        );

        if (isInternalError(pageUpdateResult)) {
            return new FailedToUpdateDigitalTextPageError(pageIdentifier, this.id, [
                pageUpdateResult,
            ]);
        }

        const updatedPages = this.pages.map((page) =>
            page.identifier === pageIdentifier ? pageUpdateResult : page.clone({})
        );

        const updateResult = this.safeClone<DigitalText>({
            pages: updatedPages,
        });

        return updateResult;
    }

    translateTitle(
        translationOfTitle: string,
        languageCode: LanguageCode
    ): ResultOrError<DigitalText> {
        return this.translateMultilingualTextProperty('title', {
            languageCode,
            text: translationOfTitle,
            role: MultilingualTextItemRole.freeTranslation,
        });
    }

    translatePageContent(
        pageIdentifier: PageIdentifier,
        text: string,
        languageCode: LanguageCode
    ): ResultOrError<DigitalText> {
        const pageSearchResult = this.getPage(pageIdentifier);

        if (isNotFound(pageSearchResult)) return new MissingPageError(pageIdentifier, this.id);

        if (!pageSearchResult.hasContent()) {
            return new MissingPageContentError(pageIdentifier);
        }

        const updatedPage = pageSearchResult.translateContent(
            text,
            languageCode
        ) as DigitalTextPage;

        const updatedPages = this.pages.map((page) =>
            page.identifier === pageIdentifier ? updatedPage : page
        );

        return this.safeClone<DigitalText>({
            pages: updatedPages,
        });
    }

    addAudioForPage(
        pageIdentifier: PageIdentifier,
        audioItemId: AggregateId,
        languageCode: LanguageCode
    ): ResultOrError<DigitalText> {
        if (!this.hasPage(pageIdentifier)) {
            return new MissingPageError(pageIdentifier, this.id);
        }

        const pageToUpdate = this.getPage(pageIdentifier) as DigitalTextPage;

        if (pageToUpdate.hasAudioIn(languageCode)) {
            return new CannotOverrideAudioForPageError(
                pageIdentifier,
                languageCode,
                audioItemId,
                pageToUpdate.getAudioIn(languageCode) as AggregateId
            );
        }

        const pageUpdateResult = pageToUpdate.addAudio(audioItemId, languageCode);

        if (isInternalError(pageUpdateResult)) return pageUpdateResult;

        const updatedPages = this.pages.map((page) =>
            page.identifier === pageUpdateResult.identifier ? pageUpdateResult : page
        );

        const updatedDigitalText = this.safeClone<DigitalText>({
            pages: updatedPages,
        });

        return updatedDigitalText;
    }

    addPhotographToPage(
        pageIdentifier: PageIdentifier,
        photographId: AggregateId
    ): ResultOrError<DigitalText> {
        // TODO Investigate why `safeClone` doesn't catch this with invariant validation
        if (!isNonEmptyString(photographId)) {
            return new InternalError(
                `Invalid page identifier format. Expected non-empty string, received: ${photographId}`
            );
        }

        const pageSearchResult = this.getPage(pageIdentifier);

        if (isNotFound(pageSearchResult)) {
            return new CannotAddPhotographForMissingPageError(pageIdentifier, photographId);
        }

        const pageUpdateResult = pageSearchResult.addPhotograph(photographId);

        if (isInternalError(pageUpdateResult)) {
            return pageUpdateResult;
        }

        return this.safeClone<DigitalText>({
            // here we update only the target page
            pages: this.pages.map((page) =>
                page.is(pageUpdateResult.identifier) ? pageUpdateResult : page
            ),
        });
    }

    addAudioForTitle(
        audioItemId: AggregateId,
        languageCode: LanguageCode
    ): ResultOrError<DigitalText> {
        if (!this.title.has(languageCode)) {
            return new CannotAddAudioForTitleInGivenLanguageError(
                this.id,
                audioItemId,
                languageCode
            );
        }

        const audioUpdateResult = this.audioForTitle.addAudio(audioItemId, languageCode);

        if (isInternalError(audioUpdateResult)) {
            return audioUpdateResult;
        }

        return this.safeClone<DigitalText>({
            audioForTitle: audioUpdateResult,
        });
    }

    /**
     *
     * @param pageIdentifiers list of all page identifiers that must be included
     * in this `DigitalText`'s pages
     *
     * @returns `true` if every `page identifier` in the list corresponds to some
     * page in this `DigitalText`.
     */
    hasPages(pageIdentifiers: PageIdentifier[]): boolean;

    /**
     * @returns `true` if this book has one or more pages
     */
    hasPages(): boolean;

    hasPages(pageIdentifiers?: PageIdentifier[]): boolean {
        /**
         * If the user did not specify a specific range of pages, we interpret
         * the query as "does this digital text have any pages at all?"
         */
        if (!Array.isArray(pageIdentifiers)) return this.pages.length > 0;

        return pageIdentifiers.every((pageIdentifier) => this.hasPage(pageIdentifier));
    }

    hasPage(pageIdentifier: PageIdentifier): boolean {
        return this.pages.some(({ identifier }) => identifier === pageIdentifier);
    }

    getPage(pageIdentifier: PageIdentifier): Maybe<DigitalTextPage> {
        if (!this.hasPage(pageIdentifier)) return NotFound;

        const searchResult = this.pages.find(({ identifier }) => identifier === pageIdentifier);

        // We avoid shared references by cloning
        return searchResult.clone({});
    }

    hasAudioForTitle(): boolean {
        return !this.audioForTitle.isEmpty();
    }

    getAudioForTitleInLanguage(languageCode: LanguageCode): Maybe<AggregateId> {
        return this.audioForTitle.getIdForAudioIn(languageCode);
    }

    /**
     * Note that if the page does not exist or if the page does not have a
     * linked photograph, this will return `NotFound`.
     *
     * @param pageIdentifier the page for which you would like the photographId
     */
    getPhotographForPage(pageIdentifier: PageIdentifier): Maybe<AggregateId> {
        const pageSearchResult = this.getPage(pageIdentifier);

        if (isNotFound(pageSearchResult)) return NotFound;

        return pageSearchResult.getPhotograph();
    }

    protected validatePageRangeContext(context: PageRangeContext): Valid | InternalError {
        // TODO Is this really necessary?
        if (isNullOrUndefined(context))
            return new InternalError(`Page Range Context is undefined for book: ${this.id}`);

        // We may want to rename the pages property in the PageRangeContext
        const { pageIdentifiers: contextPageIdentifiers } = context;

        // TODO Consider making this an invariant for the PageRangeContext
        if (contextPageIdentifiers.length === 0) {
            return new EmptyPageRangeContextError();
        }

        const missingPages = contextPageIdentifiers.reduce(
            (accumulatedList, contextPageIdentifier) =>
                this.pages.some(({ identifier }) => identifier === contextPageIdentifier)
                    ? accumulatedList
                    : accumulatedList.concat(contextPageIdentifier),
            []
        );

        if (missingPages.length > 0)
            return new PageRangeContextHasSuperfluousPageIdentifiersError(
                missingPages,
                this.getCompositeIdentifier()
            );

        return Valid;
    }

    handleDigitalTextTitleTranslated({
        payload: { translation, languageCode },
    }: DigitalTextTitleTranslated) {
        return this.translateTitle(translation, languageCode);
    }

    handleAudioAddedForDigitalTextTitle({
        payload: { audioItemId, languageCode },
    }: AudioAddedForDigitalTextTitle) {
        return this.addAudioForTitle(audioItemId, languageCode);
    }

    handlePageAddedToDigitalText({ payload: { identifier } }: PageAddedToDigitalText) {
        return this.addPage(identifier);
    }

    handleContentAddedToDigitalTextPage({
        payload: { pageIdentifier, text, languageCode },
    }: ContentAddedToDigitalTextPage) {
        return this.addContentToPage(pageIdentifier, text, languageCode);
    }

    handleAudioAddedForDigitalTextPage({
        payload: { pageIdentifier, audioItemId, languageCode },
    }: AudioAddedForDigitalTextPage) {
        return this.addAudioForPage(pageIdentifier, audioItemId, languageCode);
    }

    handleDigitalTextPageContentTranslated({
        payload: { pageIdentifier, translation, languageCode },
    }: DigitalTextPageContentTranslated) {
        return this.translatePageContent(pageIdentifier, translation, languageCode);
    }

    static fromEventHistory(
        eventStream: BaseEvent[],
        idOfDigitalTextToCreate: AggregateId
    ): Maybe<ResultOrError<DigitalText>> {
        const creationEventHandlerMap: CreationEventHandlerMap<DigitalText> = new Map().set(
            'DIGITAL_TEXT_CREATED',
            DigitalText.createDigitalTextFromDigitalTextCreated
        );

        return buildAggregateRootFromEventHistory(
            creationEventHandlerMap,
            {
                type: AggregateType.digitalText,
                id: idOfDigitalTextToCreate,
            },
            eventStream
        );
    }

    private static createDigitalTextFromDigitalTextCreated(event: DigitalTextCreated) {
        const {
            payload: {
                aggregateCompositeIdentifier: { id },
                title,
                languageCodeForTitle,
            },
        } = event;

        const digitalText = new DigitalText({
            type: AggregateType.digitalText,
            id,
            title: buildMultilingualTextWithSingleItem(title, languageCodeForTitle),
            audioForTitle: MultilingualAudio.buildEmpty(),
            pages: [],
            published: false,
        });

        // TODO validate invariants

        return digitalText;
    }
}
