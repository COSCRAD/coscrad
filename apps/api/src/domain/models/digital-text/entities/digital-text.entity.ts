import { AGGREGATE_COMPOSITE_IDENTIFIER, ICommandBase } from '@coscrad/api-interfaces';
import { NestedDataType } from '@coscrad/data-types';
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
import { AggregateCompositeIdentifier } from '../../../types/AggregateCompositeIdentifier';
import { AggregateId } from '../../../types/AggregateId';
import { AggregateType } from '../../../types/AggregateType';
import { ResourceType } from '../../../types/ResourceType';
import { Snapshot } from '../../../types/Snapshot';
import { Resource } from '../../resource.entity';
import InvalidExternalStateError from '../../shared/common-command-errors/InvalidExternalStateError';
import { ResourceReadAccessGrantedToUser } from '../../shared/common-commands/grant-resource-read-access-to-user/resource-read-access-granted-to-user.event';
import { BaseEvent } from '../../shared/events/base-event.entity';
import { DigitalTextCreated, PageAddedToDigitalText } from '../commands';
import {
    ADD_PAGE_TO_DIGITAL_TEXT,
    CREATE_DIGITAL_TEXT,
    DIGITAL_TEXT_CREATED,
    PAGE_ADDED_TO_DIGITAL_TEXT,
} from '../constants';
import { DuplicateDigitalTextTitleError } from '../errors';
import { CannotAddPageWithDuplicateIdentifierError } from '../errors/cannot-add-page-with-duplicate-identifier.error';
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
        if (!Array.isArray(pageIdentifiers)) return this.pages.length > 0;

        return pageIdentifiers.every((pageIdentifier) => this.hasPage(pageIdentifier));
    }

    hasPage(pageIdentifier: PageIdentifier): boolean {
        return this.pages.some(({ identifier }) => identifier === pageIdentifier);
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
