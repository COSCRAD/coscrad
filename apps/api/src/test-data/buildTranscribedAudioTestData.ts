import { TranscribedAudio } from '../domain/models/transcribed-audio/entities/transcribed-audio.entity';
import { ResourceType } from '../domain/types/ResourceType';
import { DTO } from '../types/DTO';

const partialDtos: DTO<Omit<TranscribedAudio, 'type'>>[] = [
    {
        id: '110',
        audioFilename: 'Gaas',
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
    {
        id: '111',
        audioFilename: 'Chinaay',
        startMilliseconds: 0,
        lengthMilliseconds: 23409,
        published: true,
        transcript: {
            timeRanges: [
                {
                    inPoint: 3400,
                    outPoint: 3670,
                    data: 'While she went down to the river',
                },
                {
                    inPoint: 3700,
                    outPoint: 3980,
                    data: 'someone had already filled the water tank.',
                },
                {
                    inPoint: 4010,
                    outPoint: 4290,
                    data: 'These were the types of problems we had.',
                },
            ],
        },
    },
    {
        id: '113',
        audioFilename: 'Kwa',
        startMilliseconds: 0,
        lengthMilliseconds: 32989,
        published: true,
        transcript: {
            timeRanges: [
                {
                    inPoint: 120,
                    outPoint: 848,
                    data: 'this type of spoon is used in ceremonies',
                },
                {
                    inPoint: 930,
                    outPoint: 1080,
                    data: 'by members of the opposite clan of the house chief',
                },
            ],
        },
    },
];

export default () =>
    partialDtos.map(
        (partialDto) => new TranscribedAudio({ ...partialDto, type: ResourceType.transcribedAudio })
    );
