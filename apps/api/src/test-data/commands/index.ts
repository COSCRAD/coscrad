import { CommandFSA } from '../../app/controllers/command/command-fsa/command-fsa.entity';
import { CreateSong } from '../../domain/models/song/commands/create-song.command';
import { AggregateType } from '../../domain/types/AggregateType';

const createSong: CommandFSA<CreateSong> = {
    // TODO Import a const for this
    type: 'CREATE_SONG',
    payload: {
        aggregateCompositeIdentifier: { id: 'dummy-song', type: AggregateType.song },
        title: 'test-song-name (language)',
        titleEnglish: 'test-song-name (English)',
        lyrics: 'la la la',
        audioURL: 'https://www.mysound.org/song.mp3',
    },
};

const buildSongTestCommandFsas = () => [createSong];

export const buildTestCommandFsaMap = () =>
    [...buildSongTestCommandFsas()].reduce(
        (fsaMap, nextFsa) => fsaMap.set(nextFsa.type, nextFsa),
        new Map<string, CommandFSA>()
    );
