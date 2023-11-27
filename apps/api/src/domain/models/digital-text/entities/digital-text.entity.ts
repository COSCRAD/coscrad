import {
    AGGREGATE_COMPOSITE_IDENTIFIER,
    ICommandBase,
    LanguageCode,
} from '@coscrad/api-interfaces';
import { NestedDataType } from '@coscrad/data-types';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { isDeepStrictEqual } from 'util';
import { RegisterIndexScopedCommands } from '../../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { InternalError, isInternalError } from '../../../../lib/errors/InternalError';
import { ValidationResult } from '../../../../lib/errors/types/ValidationResult';
import { Maybe } from '../../../../lib/types/maybe';
import { NotFound } from '../../../../lib/types/not-found';
import formatAggregateCompositeIdentifier from '../../../../queries/presentation/formatAggregateCompositeIdentifier';
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
import { PageRangeContext } from '../../context/page-range-context/page-range.context.entity';
import { Resource } from '../../resource.entity';
import InvalidExternalStateError from '../../shared/common-command-errors/InvalidExternalStateError';
import { ResourceReadAccessGrantedToUser } from '../../shared/common-commands/grant-resource-read-access-to-user/resource-read-access-granted-to-user.event';
import { BaseEvent } from '../../shared/events/base-event.entity';
import { DigitalTextCreated, PageAddedToDigitalText } from '../commands';
import { ContentAddedToDigitalTextPage } from '../commands/add-content-to-digital-text-page';
import {
    ADD_PAGE_TO_DIGITAL_TEXT,
    CREATE_DIGITAL_TEXT,
    DIGITAL_TEXT_CREATED,
    PAGE_ADDED_TO_DIGITAL_TEXT,
} from '../constants';
import { FailedToUpdateDigitalTextPageError } from '../errors';
import { CannotAddContentToMissingPageError } from '../errors/cannot-add-content-to-missing-page.error';
import { CannotAddPageWithDuplicateIdentifierError } from '../errors/cannot-add-page-with-duplicate-identifier.error';
import { DuplicateDigitalTextTitleError } from '../errors/duplicate-digital-text-title.error';
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

        const { title, pages: pageDTOs } = dto;

        this.title = new MultilingualText(title);

        this.pages = Array.isArray(pageDTOs)
            ? pageDTOs.map((pageDTO) => new DigitalTextPage(pageDTO))
            : undefined;
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
                new CannotAddContentToMissingPageError(pageIdentifier, this.id),
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

        // We avoid shared references by cloning
        return this.pages.find(({ identifier }) => identifier === pageIdentifier).clone({});
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

    static fromEventHistory(
        eventStream: BaseEvent[],
        idOfDigitalTextToCreate: AggregateId
    ): Maybe<ResultOrError<DigitalText>> {
        const eventsForThisDigitalText = eventStream.filter(({ payload }) =>
            isDeepStrictEqual((payload as ICommandBase)[AGGREGATE_COMPOSITE_IDENTIFIER], {
                type: AggregateType.digitalText,
                id: idOfDigitalTextToCreate,
            })
        );

        if (eventsForThisDigitalText.length === 0) return NotFound;

        const [creationEvent, ...updateEvents] = eventsForThisDigitalText;

        if (creationEvent.type !== DIGITAL_TEXT_CREATED) {
            throw new InternalError(
                `The first event for ${formatAggregateCompositeIdentifier({
                    type: AggregateType.digitalText,
                    id: idOfDigitalTextToCreate,
                })} should have been of type ${DIGITAL_TEXT_CREATED}, but found: ${
                    creationEvent?.type
                }`
            );
        }

        const {
            payload: {
                title,
                languageCodeForTitle,
                aggregateCompositeIdentifier: { id, type },
            },
        } = creationEvent as DigitalTextCreated;

        const initialInstance = new DigitalText({
            type,
            id,
            published: false,
            title: buildMultilingualTextWithSingleItem(title, languageCodeForTitle),
            pages: [],
            eventHistory: [creationEvent],
        });

        const newDigitalText = updateEvents.reduce((digitalText, event) => {
            if (isInternalError(digitalText)) return digitalText;

            if (event.type === `RESOURCE_PUBLISHED`) {
                return digitalText.addEventToHistory(event).publish();
            }

            if (event.type === PAGE_ADDED_TO_DIGITAL_TEXT) {
                const {
                    payload: { identifier },
                } = event as PageAddedToDigitalText;

                return digitalText.addEventToHistory(event).addPage(identifier);
            }

            if (event.type === 'CONTENT_ADDED_TO_DIGITAL_TEXT_PAGE') {
                const {
                    payload: { pageIdentifier, text, languageCode },
                } = event as ContentAddedToDigitalTextPage;

                return digitalText
                    .addEventToHistory(event)
                    .addContentToPage(pageIdentifier, text, languageCode);
            }

            if (event.type === `RESOURCE_READ_ACCESS_GRANTED_TO_USER`) {
                const {
                    payload: { userId },
                } = event as ResourceReadAccessGrantedToUser;

                return digitalText.addEventToHistory(event).grantReadAccessToUser(userId);
            }

            // This event was not handled
            // TODO: should we throw here?
            return digitalText;
        }, initialInstance);

        return newDigitalText;
    }
}
