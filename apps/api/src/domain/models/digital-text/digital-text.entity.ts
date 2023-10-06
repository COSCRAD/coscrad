import { NestedDataType } from '@coscrad/data-types';
import { RegisterIndexScopedCommands } from '../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { InternalError } from '../../../lib/errors/InternalError';
import { DTO } from '../../../types/DTO';
import { MultilingualText } from '../../common/entities/multilingual-text';
import { AggregateCompositeIdentifier } from '../../types/AggregateCompositeIdentifier';
import { ResourceType } from '../../types/ResourceType';
import { Resource } from '../resource.entity';

@RegisterIndexScopedCommands(['CREATE_DIGITAL_TEXT'])
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
        const allErrors: InternalError[] = [];

        return allErrors;
    }

    protected getExternalReferences(): AggregateCompositeIdentifier[] {
        return [];
    }

    // static fromEventHistory(
    //     eventStream: BaseEvent[],
    //     idOfDigitalTextToCreate: AggregateId
    // ): Maybe<ResultOrError<DigitalText>> {
    //     const eventsForThisDigitalText = eventStream.filter(({ payload }) =>
    //         isDeepStrictEqual((payload as ICommandBase)[AGGREGATE_COMPOSITE_IDENTIFIER], {
    //             type: AggregateType.digitalText,
    //             id: idOfDigitalTextToCreate,
    //         })
    //     );
    //     if (eventsForThisDigitalText.length === 0) return NotFound;

    //     const [creationEvent, ...updateEvents] = eventsForThisDigitalText;

    //     if (creationEvent.type !== `DIGITAL_TEXT_CREATED`) {
    //         throw new InternalError(
    //             `The first event for ${formatAggregateCompositeIdentifier({
    //                 type: AggregateType.digitalText,
    //                 id: idOfDigitalTextToCreate,
    //             })} should have been of type DIGITAL_TEXT_CREATED, but found: ${
    //                 creationEvent?.type
    //             }`
    //         );
    //     }

    //     const { title } = creationEvent.payload as CreateDigitalText;
    // }
}
