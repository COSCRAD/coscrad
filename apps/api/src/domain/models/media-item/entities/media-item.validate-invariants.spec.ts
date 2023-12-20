import { MIMEType } from '@coscrad/api-interfaces';
import assertErrorAsExpected from '../../../../lib/__tests__/assertErrorAsExpected';
import getValidAggregateInstanceForTest from '../../../__tests__/utilities/getValidAggregateInstanceForTest';
import InvariantValidationError from '../../../domainModelValidators/errors/InvariantValidationError';
import { AggregateType } from '../../../types/AggregateType';
import { InconsistentMediaItemPropertyError } from '../errors';
import { MediaItemDimensions } from './media-item-dimensions';

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
                        new InvariantValidationError(mediaItem.getCompositeIdentifier(), [
                            new InconsistentMediaItemPropertyError(
                                'lengthMilliseconds',
                                inconsistentMimeType
                            ),
                        ])
                    );
                });
            });
        });
    });

    // TODO Do we inclue videos?
    describe(`when dimensions are provided for a media item not of type photograph`, () => {
        Object.values(MIMEType)
            .filter((mimeType) => ![MIMEType.png].includes(mimeType))
            .forEach((inconsistentMimeType) => {
                describe(`when the MIME Type is: ${inconsistentMimeType}`, () => {
                    it(`should return the expected error`, () => {
                        const mediaItem = getValidAggregateInstanceForTest(
                            AggregateType.mediaItem
                        ).clone({
                            mimeType: inconsistentMimeType,
                            // ensure there isn't a second error from this one
                            lengthMilliseconds: undefined,
                            dimensions: new MediaItemDimensions({
                                heightPx: 800,
                                widthPx: 800,
                            }),
                        });

                        const result = mediaItem.validateInvariants();

                        assertErrorAsExpected(
                            result,
                            new InvariantValidationError(mediaItem.getCompositeIdentifier(), [
                                new InconsistentMediaItemPropertyError(
                                    'dimensions',
                                    inconsistentMimeType
                                ),
                            ])
                        );
                    });
                });
            });
    });
});
