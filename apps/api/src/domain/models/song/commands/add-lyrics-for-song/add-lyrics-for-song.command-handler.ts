import { CommandHandler } from '@coscrad/commands';
import { BaseUpdateCommandHandler } from '../../../shared/command-handlers/base-update-command-handler';
import { Song } from '../../song.entity';
import { AddLyricsForSong } from './add-lyrics-for-song.command';

@CommandHandler(AddLyricsForSong)
export class AddLyricsForSongCommandHandler extends BaseUpdateCommandHandler<Song> {}
