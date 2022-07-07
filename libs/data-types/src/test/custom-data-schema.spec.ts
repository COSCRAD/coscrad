import 'reflect-metadata';
import { NonEmptyString, URL, UUID } from '../index';
import { Enum, NestedDataType, NonNegativeFiniteNumber, RawDataObject } from '../lib/decorators';
import { CoscradEnum, MIMEType } from '../lib/enums';
import { CoscradUserRole } from '../lib/enums/CoscradUserRole';
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

        @NonEmptyString({ isArray: true })
        aliases: ['super machine', 'widget king'];

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

        @RawDataObject()
        rawDataObject = { foo: 72 };

        @RawDataObject({ isOptional: true })
        optionalRawData = undefined;

        @Enum(CoscradEnum.MIMEType)
        mimeType = MIMEType.mp3;

        @Enum(CoscradEnum.CoscradUserRole)
        role = CoscradUserRole.viewer;
    }

    it('should populate the appropriate metadata', () => {
        const actualMetadata = getCoscradDataSchema(Widget);

        expect(actualMetadata).toMatchSnapshot();
    });
});
