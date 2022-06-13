import { Module } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CreateSong } from './commands/create-song.command';
import { CreateSongCommandHandler } from './commands/create-song.command-handler';

@Module({
    providers: [
        CreateSong,
        CreateSongCommandHandler,
        {
            provide: 'ID_GENERATOR',
            useFactory: () => ({
                generate: () => Promise.resolve(uuidv4()),
            }),
        },
    ],
})
export class SongModule {}
