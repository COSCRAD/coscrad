import { TranscribedAudio } from '../domain/models/transcribed-audio/entities/transcribed-audio.entity';
import { PartialDTO } from '../types/partial-dto';

const dtos: PartialDTO<TranscribedAudio>[] = [
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

export default () => dtos.map((dto) => new TranscribedAudio(dto));
