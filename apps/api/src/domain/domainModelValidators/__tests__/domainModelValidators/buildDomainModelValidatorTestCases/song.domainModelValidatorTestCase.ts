import { InternalError } from 'apps/api/src/lib/errors/InternalError';
import { Song } from '../../../../models/song/song.entity';
import { resourceTypes } from '../../../../types/resourceTypes';
import songValidator from '../../../songValidator';
import { DomainModelValidatorTestCase } from '../../types/DomainModelValidatorTestCase';
import getValidEntityInstaceForTest from '../utilities/getValidEntityInstaceForTest';

const validDTO = getValidEntityInstaceForTest(resourceTypes.song).toDTO();

export const buildSongTestCase = (): DomainModelValidatorTestCase<Song> => ({
    resourceType: resourceTypes.song,
    validator: songValidator,
    validCases: [
        {
            dto: validDTO,
        },
    ],
    invalidCases: [
        {
            description: 'audioURL is an empty string',
            invalidDTO: {
                ...validDTO,
                audioURL: '',
            },
            expectedError: new InternalError('bad'),
        },
    ],
});
