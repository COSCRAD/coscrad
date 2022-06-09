import 'reflect-metadata';
import { NonEmptyString, NON_EMPTY_STRING } from './NonEmptyString';

describe('NonEmptyString', () => {
    class Widget {
        @NonEmptyString()
        widgetName = 'Machine';

        @NonEmptyString({ isOptional: true })
        locationName = 'Back Red Room 12';
    }

    it('should populate the appropriate metadata', () => {
        const actualMetadata = Reflect.getMetadata('__coscrad-data-types__', Widget.prototype);

        expect(actualMetadata).toEqual({
            widgetName: { type: NON_EMPTY_STRING, isOptional: false },
            locationName: { type: NON_EMPTY_STRING, isOptional: true },
        });
    });
});
