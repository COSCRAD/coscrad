import { Module } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { AddSong } from './commands/add-song.command';
import { AddSongHandler } from './commands/add-song.command-handler';

@Module({
    providers: [
        AddSong,
        AddSongHandler,
        {
            provide: 'ID_GENERATOR',
            useFactory: () => ({
                generate: () => Promise.resolve(uuidv4()),
            }),
        },
    ],
})
export class SongModule {}
