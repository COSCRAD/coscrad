import 'reflect-metadata';
import CoscradDataType from '../types/CoscradDataType';
import { NonEmptyString } from './NonEmptyString';

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
            widgetName: { type: CoscradDataType.NonEmptyString, isOptional: false },
            locationName: { type: CoscradDataType.NonEmptyString, isOptional: true },
        });
    });
});
