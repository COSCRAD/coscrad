import { Song } from '../domain/models/song/song.entity';
import { resourceTypes } from '../domain/types/resourceTypes';

export default (): Song[] =>
    [
        {
            type: resourceTypes.song,
            title: 'Song title in language',
            titleEnglish: 'Mary had a little lamb',
            lyrics: 'Mary had a little lamb, little lamb.',
            audioURL: 'https://www.myaudio.com/lamb.mp3',
            published: true,
            startMilliseconds: 0,
            lengthMilliseconds: 3500,
            contributorAndRoles: [
                {
                    contributorId: '1',
                    role: 'performer',
                },
            ],
        },
    ]
        .map((partialDTO, index) => ({
            ...partialDTO,
            id: `${index + 1}`,
        }))
        .map((dto) => new Song(dto));
