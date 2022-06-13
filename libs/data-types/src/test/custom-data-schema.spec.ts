import 'reflect-metadata';
import { NonEmptyString, URL, UUID } from '../index';
import { NestedDataType, NonNegativeFiniteNumber } from '../lib/decorators';
import getCoscradDataSchema from '../lib/utilities/getCoscradDataSchema';

describe('NonEmptyString', () => {
    class Whatsit {
        @NonEmptyString({ isOptional: true })
        whatsitName = 'whatsit 1';

        @UUID()
        whatsitId = '25c5824f-6b4b-4341-bb60-3145d8109568';
    }

    class Widget {
        @NonEmptyString()
        widgetName = 'Machine';

        @NonEmptyString({ isOptional: true })
        locationName = 'Back Red Room 12';

        @UUID()
        id = '25c5824f-6b4b-4341-bb60-3145d8109568';

        @UUID({ isOptional: true })
        locationId = '25c5824f-6b4b-4341-bb60-3145d8109568';

        @URL()
        iconUrl = 'https://www.mylink.com/uploads/123.png';

        @URL({ isOptional: true })
        specSheetUrl = undefined;

        @NonNegativeFiniteNumber()
        width = 134.5;

        @NonNegativeFiniteNumber({ isOptional: true })
        averageRating = 3.5;

        @NestedDataType(Whatsit)
        primaryWhatsit = {};

        @NestedDataType(Whatsit, { isOptional: true })
        secondaryWhatsit = {};
    }

    it('should populate the appropriate metadata', () => {
        const actualMetadata = getCoscradDataSchema(Widget);

        expect(actualMetadata).toMatchSnapshot();
    });
});
