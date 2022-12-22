import { Command, ICommand } from '@coscrad/commands';
import { ReferenceTo, UUID } from '@coscrad/data-types';
import { AggregateType } from '../../../types/AggregateType';

@Command({
    type: 'PUBLISH_SONG',
    label: 'Publish Song',
    description: 'Publish a song for the world!',
})
export class PublishSong implements ICommand {
    // TODO Remove `ReferenceTo` decorator- just for testing since we don't have a visible command with an external reference
    @ReferenceTo(AggregateType.mediaItem)
    @UUID({
        label: 'ID',
        description: 'unique identifier of the song to publish',
    })
    readonly id: string;
}
