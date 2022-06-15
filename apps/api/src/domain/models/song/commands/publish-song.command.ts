import { Command, ICommand } from '@coscrad/commands';
import { UUID } from '@coscrad/data-types';

@Command('PUBLISH_SONG')
export class PublishSong implements ICommand {
    @UUID()
    readonly id: string;
}
