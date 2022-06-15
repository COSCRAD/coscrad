import { Command, ICommand } from '@coscrad/commands';
import { UUID } from '@coscrad/data-types';

@Command({
    type: 'PUBLISH_SONG',
    label: 'Publish Song',
    description: 'Publish a song for the world!',
})
export class PublishSong implements ICommand {
    @UUID()
    readonly id: string;
}
