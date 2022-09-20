import { buildSimpleValidationFunction } from '@coscrad/validation';
import 'reflect-metadata';
import { NonEmptyString, URL, UUID } from '../index';
import {
    DiscriminatedBy,
    Enum,
    ISBN,
    NestedDataType,
    NonNegativeFiniteNumber,
    PositiveInteger,
    RawDataObject,
    Union,
    Year,
} from '../lib/decorators';
import { BibliographicSubjectCreatorType, CoscradEnum, MIMEType } from '../lib/enums';
import { CoscradUserRole } from '../lib/enums/CoscradUserRole';
import getCoscradDataSchema from '../lib/utilities/getCoscradDataSchema';

const isOptional = true;

describe('NonEmptyString', () => {
    class Whatsit {
        @NonEmptyString({ isOptional })
        whatsitName = 'whatsit 1';

        @UUID()
        whatsitId = '25c5824f-6b4b-4341-bb60-3145d8109568';
    }

    @DiscriminatedBy('one')
    class ThingDataOne {
        type = 'one';

        @NonNegativeFiniteNumber()
        strength = 99.5;
    }

    @DiscriminatedBy('two')
    class ThingDataTwo {
        type = 'two';

        @PositiveInteger()
        rating = 5;
    }

    class Widget {
        @NonEmptyString()
        widgetName = 'Machine';

        @NonEmptyString({ isOptional })
        locationName = 'Back Red Room 12';

        // @IsString({ each: true })
        // @IsNotEmpty()
        @NonEmptyString({ isArray: true })
        aliases: ['super machine', 'widget king'];

        @UUID()
        id = '25c5824f-6b4b-4341-bb60-3145d8109568';

        @UUID({ isOptional })
        locationId = '25c5824f-6b4b-4341-bb60-3145d8109568';

        @URL()
        iconUrl = 'https://www.mylink.com/uploads/123.png';

        @URL({ isOptional })
        specSheetUrl = undefined;

        @NonNegativeFiniteNumber()
        width = 134.5;

        @NonNegativeFiniteNumber({ isOptional })
        averageRating = 3.5;

        @NestedDataType(Whatsit)
        primaryWhatsit = {};

        @NestedDataType(Whatsit, { isOptional })
        secondaryWhatsit = {};

        @RawDataObject()
        rawDataObject = { foo: 72 };

        @RawDataObject({ isOptional })
        optionalRawData = undefined;

        @Enum(CoscradEnum.MIMEType)
        mimeType = MIMEType.mp3;

        @Enum(CoscradEnum.CoscradUserRole)
        role = CoscradUserRole.viewer;

        @Enum(CoscradEnum.BibliographicSubjectCreatorType)
        creatorType = BibliographicSubjectCreatorType.artist;

        @Year()
        year = 1998;

        @Year({ isOptional })
        yearUploaded = 2002;

        @PositiveInteger()
        numberOfLikes = 22;

        @PositiveInteger({ isOptional })
        numberOfDownvotes = 2;

        @ISBN()
        requiredISBN = `978-3-16-148410-0`;

        @ISBN({ isOptional })
        optionalISBN = `979-3-16-148410-0`;

        @Union([ThingDataOne, ThingDataTwo], 'data.type')
        data: ThingDataOne | ThingDataTwo = {
            type: 'one',

            strength: 67.3,
        };

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

        creatorType: BibliographicSubjectCreatorType.artist,

        year: 1945,

        yearUploaded: 1999,

        numberOfLikes: 2,

        numberOfDownvotes: 501,

        requiredISBN: `978-3-16-148410-0`,

        optionalISBN: `978-3-16-148410-0`,

        data: {
            type: 'one',
            strength: 85,
        },
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
