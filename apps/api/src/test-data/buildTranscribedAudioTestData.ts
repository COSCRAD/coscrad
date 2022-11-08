import { TranscribedAudio } from '../domain/models/transcribed-audio/entities/transcribed-audio.entity';
import { ResourceType } from '../domain/types/ResourceType';
import { DTO } from '../types/DTO';

const partialDtos: DTO<Omit<TranscribedAudio, 'type'>>[] = [
    {
        id: '110',
        audioFilename: '123.mp3',
        startMilliseconds: 0,
        lengthMilliseconds: 20000,
        published: true,
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

export default () =>
    partialDtos.map(
        (partialDto) => new TranscribedAudio({ ...partialDto, type: ResourceType.transcribedAudio })
    );
