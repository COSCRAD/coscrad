import { NestedDataType } from '@coscrad/data-types';
import { DTO } from '../../../..//types/DTO';
import { RegisterIndexScopedCommands } from '../../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { InternalError } from '../../../../lib/errors/InternalError';
import { MultilingualText } from '../../../common/entities/multilingual-text';
import { AggregateCompositeIdentifier } from '../../../types/AggregateCompositeIdentifier';
import { AggregateType } from '../../../types/AggregateType';
import { ResourceType } from '../../../types/ResourceType';
import { Resource } from '../../resource.entity';
import { PlaylistItem } from './playlist-item.entity';

@RegisterIndexScopedCommands([])
export class Playlist extends Resource {
    readonly type = ResourceType.playlist;

    // TODO Fix the aggregate factory test and comment this back in
    // @CoscradMultilingualText({
    //     label: 'name',
    //     description: 'the name of the playlist',
    // })
    readonly name: MultilingualText;

    // TODO add refrence to photograph

    @NestedDataType(PlaylistItem, {
        label: 'playlist items',
        description: "the resources from which the playlist's episodes are derived",
        isArray: true,
        // i.e. can be an empty array
        isOptional: true,
    })
    readonly items: PlaylistItem[];

    constructor(dto: DTO<Playlist>) {
        super(dto);

        if (!dto) return;

        const { name, items } = dto;

        this.name = new MultilingualText(name);

        if (Array.isArray(items)) this.items = items.map((item) => new PlaylistItem(item));
    }

    protected getResourceSpecificAvailableCommands(): string[] {
        return [];
    }

    protected validateComplexInvariants(): InternalError[] {
        // TODO validate invariants and tests
        return [];
    }

    protected getExternalReferences(): AggregateCompositeIdentifier<AggregateType>[] {
        return this.items.map(({ resourceCompositeIdentifier }) => resourceCompositeIdentifier);
    }
}
