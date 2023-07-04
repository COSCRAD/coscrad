import { CommandHandler } from '@coscrad/commands';
import { BaseCommandHandler } from '../../../shared/command-handlers/base-command-handler';
import { Song } from '../../song.entity';
import { AddLyricsForSong } from './add-lyrics-for-song.command';

@CommandHandler(AddLyricsForSong)
export class AddLyricsForSongCommandHandler extends BaseCommandHandler<Song> {}
