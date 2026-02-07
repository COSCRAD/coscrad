import {
    AggregateType,
    CategorizableType,
    EdgeConnectionType,
    IEdgeConnectionContext,
    ResourceCompositeIdentifier,
} from '@coscrad/api-interfaces';
import { BooleanDataType, NestedDataType, UUID } from '@coscrad/data-types';
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
import { AccessControlList } from '../shared/access-control/access-control-list.entity';
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
        isPublished: false,
        accessControlList: new AccessControlList(),
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

    @BooleanDataType({
        label: 'is published',
        description: 'is this note published?',
    })
    isPublished: boolean;

    // TODO remove this in queries
    @NestedDataType(AccessControlList, {
        label: 'query ACL',
        description: 'a list of users and groups that can access this note',
    })
    accessControlList: AccessControlList;

    constructor({
        connectionType,
        id,
        isPublished,
        text,
        connectedResources,
        tags,
        audio,
        accessControlList: queryAccessControlList,
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

        if (audio.items.length > 1) {
            console.log('foo u 2');
        }

        if (isNonEmptyObject(queryAccessControlList)) {
            this.accessControlList = new AccessControlList(queryAccessControlList);
        }

        this.isPublished = typeof isPublished === 'boolean' ? isPublished : false;
    }

    public toDto(): DTO<EventSourcedNoteViewModel> {
        return cloneToPlainObject(this);
    }

    public getCompositeIdentifier() {
        return {
            type: AggregateType.note,
            id: this.id,
        } as const;
    }

    public static fromDto(dto: DTO<EventSourcedNoteViewModel>) {
        const instance = new EventSourcedNoteViewModel(cloneToPlainObject(dto));

        return instance;
    }
}
