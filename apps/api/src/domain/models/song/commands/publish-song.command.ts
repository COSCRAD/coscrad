import { ICommand } from '@coscrad/commands';
import { UUID } from '@coscrad/data-types';

/**
 * This command is deprecated and will be removed in favour of `PUBLISH_RESOURCE`.
 *
 * TODO [https://www.pivotaltracker.com/story/show/184111389]
 * Remove this command once the new command has been written.
 */
// @Command({
//     type: 'PUBLISH_SONG',
//     label: 'Publish Song',
//     description: 'Publish a song for the world!',
// })
export class PublishSong implements ICommand {
    @UUID({
        label: 'ID',
        description: 'unique identifier of the song to publish',
    })
    readonly id: string;
}
