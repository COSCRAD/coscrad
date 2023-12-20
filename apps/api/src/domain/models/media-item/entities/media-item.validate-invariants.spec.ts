import { MIMEType } from '@coscrad/api-interfaces';
import assertErrorAsExpected from '../../../../lib/__tests__/assertErrorAsExpected';
import getValidAggregateInstanceForTest from '../../../__tests__/utilities/getValidAggregateInstanceForTest';
import InvariantValidationError from '../../../domainModelValidators/errors/InvariantValidationError';
import { AggregateType } from '../../../types/AggregateType';

describe(`MediaItem.validateInvariants`, () => {
    describe(`when a length is provided for a media item not of type audio or video`, () => {
        [MIMEType.png].forEach((inconsistentMimeType) => {
            describe(`when the mimeType is: ${inconsistentMimeType}`, () => {
                it(`should return the expected errors`, () => {
                    const mediaItem = getValidAggregateInstanceForTest(
                        AggregateType.mediaItem
                    ).clone({
                        mimeType: inconsistentMimeType,
                        lengthMilliseconds: 12345,
                    });

                    const result = mediaItem.validateInvariants();

                    assertErrorAsExpected(
                        result,
                        new InvariantValidationError(mediaItem.getCompositeIdentifier(), [])
                    );
                });
            });
        });
    });
});
