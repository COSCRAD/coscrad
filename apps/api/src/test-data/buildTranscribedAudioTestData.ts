import { Transcript } from '../domain/models/transcribed-audio/entities/transcribed-audio.entity';
import { ResourceType } from '../domain/types/ResourceType';
import { DTO } from '../types/DTO';

const partialDtos: DTO<Omit<Transcript, 'type'>>[] = [
    {
        id: '110',
        name: 'The Wooden Boy',
        mediaItemId: '1',
        lengthMilliseconds: 20000,
        published: true,
        participants: [
            {
                id: 'Jimmy H. Cricket',
                label: 'JHC',
            },
        ],
        items: [
            {
                inPoint: 12000,
                outPoint: 15550,
                text: 'There once was a little wooden boy.',
                label: 'JHC',
            },
            {
                inPoint: 18300,
                outPoint: 19240,
                text: 'His name was Pinocchio',
                label: 'JHC',
            },
        ],
    },
    {
        id: '111',
        name: 'Down at the River',
        participants: [
            {
                id: 'Bob LeRob',
                label: 'BL',
            },
            {
                id: 'Sue DeDue',
                label: 'SD',
            },
        ],
        mediaItemId: '1',
        lengthMilliseconds: 23409,
        published: true,
        items: [
            {
                inPoint: 3400,
                outPoint: 3670,
                text: 'While she went down to the river',
                label: 'BL',
            },
            {
                inPoint: 3700,
                outPoint: 3980,
                text: 'someone had already filled the water tank.',
                label: 'SD',
            },
            {
                inPoint: 4010,
                outPoint: 4290,
                text: 'These were the types of problems we had.',
                label: 'BL',
            },
        ],
    },
    {
        id: '113',
        name: 'Learning about Protocols',
        participants: [
            {
                id: 'Elder 1',
                label: 'E1',
            },
            {
                id: 'Elder 2',
                label: 'E2',
            },
        ],
        mediaItemId: '1',
        lengthMilliseconds: 32989,
        published: true,
        items: [
            {
                inPoint: 120,
                outPoint: 848,
                text: 'this type of spoon is used in ceremonies',
                label: 'E1',
            },
            {
                inPoint: 930,
                outPoint: 1080,
                text: 'by members of the opposite clan of the house chief',
                label: 'E2',
            },
        ],
    },
];

export default () =>
    partialDtos.map(
        (partialDto) => new Transcript({ ...partialDto, type: ResourceType.transcribedAudio })
    );
