import { AudioWithTranscript } from '../domain/models/audio-with-transcript/entities/audio-with-transcript.entity';
import { PartialDTO } from '../types/partial-dto';

const dtos: PartialDTO<AudioWithTranscript>[] = [
    {
        id: '110',
        audioFilename: '123.mp3',
        startMilliseconds: 0,
        lengthMilliseconds: 20000,
        transcript: {
            timeRanges: [
                {
                    inPoint: 12000,
                    outPoint: 15550,
                    data: 'There once was a little wooden boy.',
                },
                {
                    inPoint: 18300,
                    outPoint: 19240,
                    data: 'His name was Pinocchio.',
                },
            ],
        },
    },
];

export default () => dtos.map((dto) => new AudioWithTranscript(dto));
