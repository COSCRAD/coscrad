import { Song } from '../domain/models/song/song.entity';
import { ResourceType } from '../domain/types/ResourceType';

export default (): Song[] =>
    [
        {
            type: ResourceType.song,
            title: 'Song title in language',
            titleEnglish: 'Mary had a little lamb',
            lyrics: 'Mary had a little lamb, little lamb.',
            audioURL: 'https://www.myaudio.com/lamb.mp3',
            published: true,
            startMilliseconds: 0,
            lengthMilliseconds: 3500,
            contributions: [
                {
                    contributorId: '1',
                    role: 'performer',
                },
            ],
        },
        {
            type: ResourceType.song,
            title: 'Unpublished Song Title (lang)',
            titleEnglish: 'Unpublished Song Title (Engl)',
            lyrics: "Ain't gonna see the light of day, light of day, light of day",
            audioURL: 'https://www.myaudio.com/badsong.wav',
            published: false,
            startMilliseconds: 0,
            lengthMilliseconds: 33000,
            contributions: [
                {
                    contributorId: '33',
                    role: 'author',
                },
            ],
        },
    ].map(
        (partialDTO, index) =>
            new Song({
                ...partialDTO,
                id: `${index + 1}`,
                type: ResourceType.song,
            })
    );
