import { TranscribedAudio } from '../domain/models/transcribed-audio/entities/transcribed-audio.entity';
import { resourceTypes } from '../domain/types/resourceTypes';
import { DTO } from '../types/DTO';

const dto: DTO<TranscribedAudio> = {
    id: '110',
    type: resourceTypes.transcribedAudio,
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
};
export default () => [dto].map((dto) => new TranscribedAudio(dto));
