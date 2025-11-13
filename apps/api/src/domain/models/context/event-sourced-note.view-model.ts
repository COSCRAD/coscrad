import {
    AggregateType,
    CategorizableType,
    EdgeConnectionType,
    IEdgeConnectionContext,
    ResourceCompositeIdentifier,
} from '@coscrad/api-interfaces';
import { NestedDataType, UUID } from '@coscrad/data-types';
import { isNonEmptyObject } from '@coscrad/validation-constraints';
import cloneToPlainObject from '../../../lib/utilities/cloneToPlainObject';
import { TagViewModel } from '../../../queries/buildViewModelForResource/viewModels';
import { EventSourcedTagViewModel } from '../../../queries/buildViewModelForResource/viewModels/tag.view-model.event-sourced';
import { CoscradDataExample } from '../../../test-data/utilities';
import { DTO } from '../../../types/DTO';
import { buildMultilingualTextWithSingleItem } from '../../common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../common/entities/multilingual-text';
import { AggregateId } from '../../types/AggregateId';
import buildDummyUuid from '../__tests__/utilities/buildDummyUuid';
import { MultilingualAudio } from '../shared/multilingual-audio/multilingual-audio.entity';

class EdgeConnectionMemberViewModel {
    resource: ResourceCompositeIdentifier;

    context: IEdgeConnectionContext;

    constructor(dto: DTO<EdgeConnectionMemberViewModel>) {
        if (!dto) {
            return;
        }

        const { resource, context } = dto;

        this.resource = resource;

        if (isNonEmptyObject(context)) {
            this.context = context;
        }
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
        // name: buildMultilingualTextWithSingleItem('breeze'),
        text: buildMultilingualTextWithSingleItem('this is the note for breeze'),
        audio: MultilingualAudio.buildEmpty(),
        tags: [],
        connectedResources: {
            // Because of the way our clone \ merge utils work, you have to specify this property every time
            // self: {
            //     context: {
            //         type: EdgeConnectionContextType.general,
            //     },
            //     resource: {
            //         type: ResourceType.term,
            //         id: buildDummyUuid(6),
            //     },
            // },
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

    @NestedDataType(MultilingualText, {
        label: 'text',
        description: 'text for this note, including translations',
    })
    text: MultilingualText;

    connectedResources: ConnectedResources;

    @NestedDataType(TagViewModel, {
        label: 'tags',
        description: 'a summary of the tags that have been applied to this resource',
        isArray: true,
    })
    tags: EventSourcedTagViewModel[];

    //    TODO Do we need this?
    // name: MultilingualText;

    @NestedDataType(MultilingualAudio, {
        label: 'audio',
        description: 'audio to accompany the note and its translations',
    })
    audio: MultilingualAudio;

    constructor({
        connectionType,
        text,
        connectedResources,
        id,
        tags,
        audio,
    }: DTO<EventSourcedNoteViewModel>) {
        this.id = id;

        this.connectionType = connectionType;

        if (isNonEmptyObject(text)) {
            this.text = new MultilingualText(text);
        }

        if (connectedResources) {
            this.connectedResources = connectedResources;
        }

        this.tags = Array.isArray(tags) ? tags.map((t) => new EventSourcedTagViewModel(t)) : [];

        if (isNonEmptyObject(audio)) {
            this.audio = MultilingualAudio.fromDto<MultilingualAudio>(audio);
        } else {
            this.audio = MultilingualAudio.buildEmpty();
        }
    }

    public toDto(): DTO<EventSourcedNoteViewModel> {
        return cloneToPlainObject(this);
    }

    public static fromDto(dto: DTO<EventSourcedNoteViewModel>) {
        const instance = new EventSourcedNoteViewModel(cloneToPlainObject(dto));

        return instance;
    }
}
