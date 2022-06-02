import { Module } from '@nestjs/common';
import { AddSong } from './commands/add-song.command';
import { AddSongHandler } from './commands/add-song.command-handler';

@Module({
    providers: [AddSong, AddSongHandler],
})
export class SongModule {}
