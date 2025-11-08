import {
    AggregateType,
    CategorizableType,
    EdgeConnectionContextType,
    EdgeConnectionType,
    ResourceType,
} from '@coscrad/api-interfaces';
import { NestedDataType, UUID } from '@coscrad/data-types';
import { isNonEmptyObject } from '@coscrad/validation-constraints';
import { TagViewModel } from '../../../queries/buildViewModelForResource/viewModels';
import { EventSourcedTagViewModel } from '../../../queries/buildViewModelForResource/viewModels/tag.view-model.event-sourced';
import { CoscradDataExample } from '../../../test-data/utilities';
import { DTO } from '../../../types/DTO';
import { buildMultilingualTextWithSingleItem } from '../../common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../common/entities/multilingual-text';
import { AggregateId } from '../../types/AggregateId';
import buildDummyUuid from '../__tests__/utilities/buildDummyUuid';
import { MultilingualAudio } from '../shared/multilingual-audio/multilingual-audio.entity';

class EdgeConnectionMemberViewModel<TContext = unknown> {
    type: ResourceType;
    id: string;
    context: TContext;

    constructor(dto: DTO<EdgeConnectionMemberViewModel>) {
        if (!dto) {
            return;
        }

        const { type, id, context } = dto;

        this.type = type;

        this.id = id;

        // @ts-expect-error Deal with the generic type here properly
        this.context = context;
    }
}

class ConnectedResources {
    to?: EdgeConnectionMemberViewModel;
    from?: EdgeConnectionMemberViewModel;
    self?: EdgeConnectionMemberViewModel;

    constructor(dto: DTO<ConnectedResources>) {
        if (!dto) {
            return;
        }

        const { to, from, self } = dto;

        if (to) {
            this.to = new EdgeConnectionMemberViewModel(to);
        }

        if (from) {
            this.from = new EdgeConnectionMemberViewModel(from);
        }

        if (self) {
            this.self = new EdgeConnectionMemberViewModel(self);
        }
    }
}
@CoscradDataExample<EventSourcedNoteViewModel>({
    example: {
        type: AggregateType.note,
        id: buildDummyUuid(5),
        name: buildMultilingualTextWithSingleItem('breeze'),
        note: buildMultilingualTextWithSingleItem('this is the note for breeze'),
        audio: MultilingualAudio.buildEmpty(),
        tags: [],
        connectedResources: {
            self: {
                context: {
                    type: EdgeConnectionContextType.general,
                },
                type: ResourceType.term,
                id: buildDummyUuid(6),
            },
        },
        connectionType: EdgeConnectionType.self,
    },
})
export class EventSourcedNoteViewModel {
    type: CategorizableType = CategorizableType.note;

    @UUID({
        label: 'id',
        description: 'system identifier for this resource',
    })
    id: AggregateId;

    connectionType: EdgeConnectionType;

    note: MultilingualText;

    connectedResources: ConnectedResources;

    @NestedDataType(TagViewModel, {
        label: 'tags',
        description: 'a summary of the tags that have been applied to this resource',
        isArray: true,
    })
    tags: EventSourcedTagViewModel[];

    @NestedDataType(MultilingualText, {
        label: 'name',
        // note that we call it `name` not `text` for consistency with other models
        description: 'name (text) includes the text as well as any translations for this term',
    })
    name: MultilingualText;

    @NestedDataType(MultilingualAudio, {
        label: 'audio',
        description: 'audio to accompany the note and its translations',
    })
    audio: MultilingualAudio;

    constructor({
        connectionType,
        note,
        connectedResources,
        id,
        tags,
        name,
        audio,
    }: DTO<EventSourcedNoteViewModel>) {
        this.id = id;

        this.connectionType = connectionType;

        this.note = new MultilingualText(note);

        this.connectedResources = connectedResources;

        this.tags = Array.isArray(tags) ? tags.map((t) => new EventSourcedTagViewModel(t)) : [];

        if (isNonEmptyObject(name)) {
            this.name = new MultilingualText(name);
        }

        this.audio = new MultilingualAudio(audio);
    }

    public static fromDto(dto: DTO<EventSourcedNoteViewModel>) {
        return new EventSourcedNoteViewModel(dto);
    }
}
