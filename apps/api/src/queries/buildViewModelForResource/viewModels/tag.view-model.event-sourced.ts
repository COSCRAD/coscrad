import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { FromDomainModel, NestedDataType } from '@coscrad/data-types';
import { ApiProperty } from '@nestjs/swagger';
import { buildMultilingualTextWithSingleItem } from '../../../domain/common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../../domain/common/entities/multilingual-text';
import buildDummyUuid from '../../../domain/models/__tests__/utilities/buildDummyUuid';
import { TagCreatedPayload } from '../../../domain/models/tag/commands/create-tag/tag-created.event';
import { Tag } from '../../../domain/models/tag/tag.entity';
import { AggregateId } from '../../../domain/types/AggregateId';
import { CoscradDataExample } from '../../../test-data/utilities';
import { DTO } from '../../../types/DTO';
import { BaseEvent } from '../../event-sourcing';

@CoscradDataExample<EventSourcedTagRecordForResourceViewModel>({
    example: {
        type: AggregateType.tag,
        id: buildDummyUuid(3),
        label: 'trees',
        name: buildMultilingualTextWithSingleItem('trees'),
    },
})
/**
 * We are moving to event sourcing of views for all resources and potentially all
 * aggregate roots. In the interim, we use our old state-based Tag view model
 * in the Tag query service. However, we need an event sourced tag model that
 * can help us create a denormalized representation of the tags for a given
 * resource. Hence the redundancy between this class and `TagViewModel`.
 */
export class EventSourcedTagRecordForResourceViewModel {
    readonly type = AggregateType.tag;

    @FromDomainModel(Tag)
    id: AggregateId;

    @ApiProperty({
        example: 'animals',
        description: 'the user-facing text for the tag',
    })
    @FromDomainModel(Tag)
    label: string;

    @NestedDataType(MultilingualText, {
        label: 'name',
        description: 'name',
    })
    name: MultilingualText;

    constructor({ id, label }: DTO<EventSourcedTagRecordForResourceViewModel>) {
        this.id = id;

        this.label = label;

        this.name = buildMultilingualTextWithSingleItem(this.label);
    }

    apply(event: BaseEvent): EventSourcedTagRecordForResourceViewModel {
        const { payload, type: eventType } = event;

        if (this.isForMe(payload)) {
            if (eventType === 'TAG_CREATED') {
                const { label } = payload as TagCreatedPayload;

                this.label = label;

                /**
                 * We currently only support tag labels in English.
                 *
                 * In the future, we may want to make these translateable.
                 */
                this.name = buildMultilingualTextWithSingleItem(label, LanguageCode.English);

                return this;
            }

            /**
             * TODO We eventually want to join in the full view model for each
             * resource or note that is a member for efficiency.
             */
            if (eventType === 'RESOURCE_OR_NOTE_CREATED') {
                // const { taggedMemberCompositeIdentifier } = payload as ResourceOrNoteTaggedPayload;

                // this.members = this.members.concat(taggedMemberCompositeIdentifier);

                return this;
            }
        }

        return this;
    }

    /**
     * @param events A temporally ordered event history, filtered for this particular aggregate.
     * @returns `DigitalTextViewModel`
     */
    applyStream(events: BaseEvent[]) {
        return events.reduce((viewModel, event) => viewModel.apply(event), this);
    }

    private isForMe({
        aggregateCompositeIdentifier: { type, id },
    }: {
        aggregateCompositeIdentifier: { type: string; id: string };
    }) {
        return type === this.type && id === this.id;
    }

    public static fromDto(dto: DTO<EventSourcedTagRecordForResourceViewModel>) {
        return new EventSourcedTagRecordForResourceViewModel(dto);
    }
}
