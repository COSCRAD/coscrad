import { buildSimpleValidationFunction } from '@coscrad/validation';
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

        // @IsString({ each: true })
        // @IsNotEmpty()
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

        constructor(dto: Widget) {
            Object.assign(this, dto);
        }
    }

    const validWidgetDTO: Widget = {
        widgetName: 'Machine',

        locationName: 'Back Red Room 12',

        aliases: ['super machine', 'widget king'],

        id: '25c5824f-6b4b-4341-bb60-3145d8109568',

        locationId: '25c5824f-6b4b-4341-bb60-3145d8109568',

        iconUrl: 'https://www.mylink.com/uploads/123.png',

        specSheetUrl: undefined,

        width: 134.5,

        averageRating: 3.5,

        primaryWhatsit: {},

        secondaryWhatsit: {},

        rawDataObject: { foo: 72 },

        optionalRawData: undefined,

        mimeType: MIMEType.mp3,

        role: CoscradUserRole.viewer,
    };

    it('should populate the appropriate metadata', () => {
        const actualMetadata = getCoscradDataSchema(Widget);

        expect(actualMetadata).toMatchSnapshot();
    });

    describe('the corresponding invariant validation', () => {
        describe('when the data is valid', () => {
            it('should return Valid', () => {
                const result = buildSimpleValidationFunction(Widget)(validWidgetDTO);

                expect(result).toStrictEqual([]);
            });
        });
    });

    /**
     * TODO [https://www.pivotaltracker.com/story/show/182578952]
     * test the invalid data cases
     *
     * It may be helpful to wait for the following story to be finished
     * [https://www.pivotaltracker.com/story/show/182217249]
     */
});
