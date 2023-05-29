import { CoscradMultilingualText, NestedDataType } from '@coscrad/data-types';
import { RegisterIndexScopedCommands } from '../../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { InternalError } from '../../../../lib/errors/InternalError';
import { DTO } from '../../../../types/DTO';
import { MultilingualText } from '../../../common/entities/multilingual-text';
import { isValid } from '../../../domainModelValidators/Valid';
import { AggregateCompositeIdentifier } from '../../../types/AggregateCompositeIdentifier';
import { AggregateType } from '../../../types/AggregateType';
import { ResourceType } from '../../../types/ResourceType';
import { Resource } from '../../resource.entity';
import { PlaylistItem } from './playlist-item.entity';

@RegisterIndexScopedCommands(['CREATE_PLAYLIST'])
export class Playlist extends Resource {
    readonly type = ResourceType.playlist;

    @CoscradMultilingualText({
        label: 'name',
        description: 'the name of the playlist',
    })
    readonly name: MultilingualText;

    // TODO add refrence to a photograph

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

    getName(): MultilingualText {
        return this.name;
    }

    has(aggregateCompositeIdentifierToFind: AggregateCompositeIdentifier): boolean {
        return this.items.some(
            ({ resourceCompositeIdentifier }) =>
                resourceCompositeIdentifier === aggregateCompositeIdentifierToFind
        );
    }

    addItem(item: PlaylistItem) {
        // TODO validate the item
        // TODO make sure the item is not already on this playlist
        return this.safeClone<Playlist>({
            items: this.items.concat(item),
        });
    }

    protected getResourceSpecificAvailableCommands(): string[] {
        return [];
    }

    protected validateComplexInvariants(): InternalError[] {
        const nameValidationResult = this.name.validateComplexInvariants();

        return isValid(nameValidationResult) ? [] : [nameValidationResult];
    }

    protected getExternalReferences(): AggregateCompositeIdentifier<AggregateType>[] {
        return this.items.map(({ resourceCompositeIdentifier }) => resourceCompositeIdentifier);
    }
}
