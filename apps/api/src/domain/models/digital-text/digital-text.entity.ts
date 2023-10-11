import { AGGREGATE_COMPOSITE_IDENTIFIER, ICommandBase } from '@coscrad/api-interfaces';
import { NestedDataType } from '@coscrad/data-types';
import { isDeepStrictEqual } from 'util';
import { RegisterIndexScopedCommands } from '../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { InternalError, isInternalError } from '../../../lib/errors/InternalError';
import { ValidationResult } from '../../../lib/errors/types/ValidationResult';
import { Maybe } from '../../../lib/types/maybe';
import { NotFound } from '../../../lib/types/not-found';
import { DTO } from '../../../types/DTO';
import { ResultOrError } from '../../../types/ResultOrError';
import formatAggregateCompositeIdentifier from '../../../view-models/presentation/formatAggregateCompositeIdentifier';
import { buildMultilingualTextWithSingleItem } from '../../common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../common/entities/multilingual-text';
import { AggregateRoot } from '../../decorators';
import { Valid, isValid } from '../../domainModelValidators/Valid';
import { AggregateCompositeIdentifier } from '../../types/AggregateCompositeIdentifier';
import { AggregateId } from '../../types/AggregateId';
import { AggregateType } from '../../types/AggregateType';
import { ResourceType } from '../../types/ResourceType';
import { Snapshot } from '../../types/Snapshot';
import { Resource } from '../resource.entity';
import InvalidExternalStateError from '../shared/common-command-errors/InvalidExternalStateError';
import { BaseEvent } from '../shared/events/base-event.entity';
import { CreateDigitalText } from './commands';
import { CREATE_DIGITAL_TEXT, DIGITAL_TEXT_CREATED } from './constants';
import { DuplicateDigitalTextTitleError } from './errors';

@AggregateRoot(AggregateType.digitalText)
@RegisterIndexScopedCommands([CREATE_DIGITAL_TEXT])
export class DigitalText extends Resource {
    readonly type = ResourceType.digitalText;

    @NestedDataType(MultilingualText, {
        label: 'title',
        description: 'the title of the digital text',
    })
    readonly title: MultilingualText;

    constructor(dto: DTO<DigitalText>) {
        super({ ...dto, type: ResourceType.digitalText });

        if (!dto) return;

        const { title } = dto;

        this.title = new MultilingualText(title);
    }

    getName(): MultilingualText {
        return this.title.clone();
    }

    protected getResourceSpecificAvailableCommands(): string[] {
        return [];
    }

    protected validateComplexInvariants(): InternalError[] {
        return [];
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
            title,
            languageCodeForTitle,
            aggregateCompositeIdentifier: { id, type },
        } = creationEvent.payload as CreateDigitalText;

        const initialInstance = new DigitalText({
            type,
            id,
            published: false,
            title: buildMultilingualTextWithSingleItem(title, languageCodeForTitle),
            eventHistory: [creationEvent],
        });

        const newDigitalText = updateEvents.reduce((digitalText, event) => {
            if (isInternalError(digitalText)) return digitalText;

            if (event.type === `RESOURCE_PUBLISHED`) {
                return digitalText.addEventToHistory(event).publish();
            }
        }, initialInstance);

        return newDigitalText;
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
}
