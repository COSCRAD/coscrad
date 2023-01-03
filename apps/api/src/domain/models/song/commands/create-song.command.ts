import { ICommandBase } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType, NonEmptyString, RawDataObject, URL, UUID } from '@coscrad/data-types';
import { Equals } from '@coscrad/validation';
import { AggregateCompositeIdentifier } from '../../../types/AggregateCompositeIdentifier';
import { AggregateType } from '../../../types/AggregateType';

class SongCompositeId {
    /**
     * This is a bit of a hack. It circumvents our `CoscradDataTypes` and may
     * cause problems for
     * - Schema management
     * - Anyone using our API directly (not via front-end)
     *
     * The simple answer is that you always have to tack on an
     * `aggregateCompositeIdentifier`.
     */
    @Equals(AggregateType.song)
    type = AggregateType.song;

    @UUID({
        label: 'ID',
        description: 'unique identifier',
    })
    id: string;
}

@Command({
    type: 'CREATE_SONG',
    label: 'Create Song',
    description: 'Creates a new song',
})
export class CreateSong implements ICommandBase {
    /**
     * TODO
     * We need a migration for this schema change. The migration will
     * remove `id`
     * add `aggregateId` = `id` => ({id, type: AggregateType.song})
     *
     * Before merging this in, we need to get a 'snapshot' of the previous
     * schema (system-wide), which will become v1. We want to persist the history
     * of such changes for posterity.
     */
    // @UUID({
    //     label: 'ID (generated)',
    //     description: 'unique identifier for the song that will be created',
    // })
    // readonly id: AggregateId;

    @NestedDataType(SongCompositeId, {
        label: 'Composite Identifier',
        description: 'system-wide unique identifier',
    })
    readonly aggregateCompositeIdentifier: AggregateCompositeIdentifier<typeof AggregateType.song>;

    @NonEmptyString({
        isOptional: true,
        label: 'title',
        description: "song's title in the language",
    })
    readonly title?: string;

    @NonEmptyString({
        isOptional: true,
        label: 'title (colonial language)',
        description: "song's title in the colonial language",
    })
    readonly titleEnglish?: string;

    /**
     * TODO This property is being removed in favor of edge connections to a
     * separate `Contributor` resource.  For now, we use a config to map in
     * media credits. Be sure to remove this property from existing data. It can
     * simply be ignored in sourcing V1 events.
     */
    // @NestedDataType(ContributorAndRole, {
    //     isArray: true,
    //     label: 'contributions',
    //     description: 'acknowledgement of all contributors who worked on this song',
    // })
    // readonly contributions: ContributorAndRole[];

    @NonEmptyString({
        isOptional: true,
        label: 'lyrics',
        description: "plain text representation of this song's lyrics",
    })
    readonly lyrics?: string;

    @URL({
        label: 'audio link',
        description: 'a web URL link to the audio for this song',
    })
    readonly audioURL: string;

    @RawDataObject({
        isOptional: true,
        label: 'raw data',
        description: 'additional data from a legacy \\ third-party system source of the data',
    })
    readonly rawData?: Record<string, unknown>;

    // the length can be set later
}
