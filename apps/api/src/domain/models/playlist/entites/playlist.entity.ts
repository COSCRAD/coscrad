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

    readonly name: MultilingualText;

    // TODO add refrence to photograph

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
