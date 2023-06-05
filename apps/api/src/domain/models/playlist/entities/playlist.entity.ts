import { CoscradMultilingualText, NestedDataType } from '@coscrad/data-types';
import { isDeepStrictEqual } from 'util';
import { RegisterIndexScopedCommands } from '../../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { InternalError } from '../../../../lib/errors/InternalError';
import { DTO } from '../../../../types/DTO';
import { ResultOrError } from '../../../../types/ResultOrError';
import { MultilingualText, MultilingualTextItem } from '../../../common/entities/multilingual-text';
import { isValid } from '../../../domainModelValidators/Valid';
import { AggregateCompositeIdentifier } from '../../../types/AggregateCompositeIdentifier';
import { AggregateType } from '../../../types/AggregateType';
import { ResourceType } from '../../../types/ResourceType';
import { Resource } from '../../resource.entity';
import { CannotAddDuplicateItemToPlaylist } from '../errors';
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
        const result = this.items.some(({ resourceCompositeIdentifier }) =>
            isDeepStrictEqual(resourceCompositeIdentifier, aggregateCompositeIdentifierToFind)
        );

        return result;
    }

    addItem(item: PlaylistItem): ResultOrError<Playlist> {
        if (this.has(item.resourceCompositeIdentifier))
            return new CannotAddDuplicateItemToPlaylist(this.id, item);

        return this.safeClone<Playlist>({
            items: this.items.concat(item),
        });
    }

    translateName(textItem: MultilingualTextItem) {
        // TODO validate the item

        return this.safeClone<Playlist>({
            name: this.name.append(textItem).toDTO(),
        });
    }

    protected getResourceSpecificAvailableCommands(): string[] {
        return ['ADD_AUDIO_ITEM_TO_PLAYLIST'];
    }

    protected validateComplexInvariants(): InternalError[] {
        const nameValidationResult = this.name.validateComplexInvariants();

        return isValid(nameValidationResult) ? [] : [nameValidationResult];
    }

    protected getExternalReferences(): AggregateCompositeIdentifier<AggregateType>[] {
        return this.items.map(({ resourceCompositeIdentifier }) => resourceCompositeIdentifier);
    }
}
