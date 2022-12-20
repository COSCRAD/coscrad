import 'reflect-metadata';
import { CoscradDataType } from '../types/CoscradDataType';
import getCoscradDataSchema from '../utilities/getCoscradDataSchema';
import { NonEmptyString } from './NonEmptyString';

const widgetNameLabelAndDescription = {
    label: 'Widget Name',
    description: "the widget's name",
};

const locationNameLabelAndDescription = {
    label: 'Location Name',
    description: "the name of the widget's current location",
};

describe('NonEmptyString', () => {
    class Widget {
        @NonEmptyString(widgetNameLabelAndDescription)
        widgetName = 'Machine';

        @NonEmptyString({
            isOptional: true,
            ...locationNameLabelAndDescription,
        })
        locationName = 'Back Red Room 12';
    }

    it('should populate the appropriate metadata', () => {
        const actualMetadata = getCoscradDataSchema(Widget); //Reflect.getMetadata('__coscrad-data-types__', Widget.prototype);

        expect(actualMetadata).toEqual({
            widgetName: {
                coscradDataType: CoscradDataType.NonEmptyString,
                isOptional: false,
                isArray: false,
                ...widgetNameLabelAndDescription,
            },
            locationName: {
                coscradDataType: CoscradDataType.NonEmptyString,
                isOptional: true,
                isArray: false,
                ...locationNameLabelAndDescription,
            },
        });
    });
});
