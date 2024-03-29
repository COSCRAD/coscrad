import 'reflect-metadata';
import { bootstrapDynamicTypes, NonEmptyString, URL, UUID } from '../index';
import {
    BindToViewState,
    Enum,
    FiniteNumber,
    ISBN,
    NestedDataType,
    NonNegativeFiniteNumber,
    PositiveInteger,
    RawDataObject,
    ReferenceTo,
    Union,
    UnionMember,
    UnionType,
    Year,
} from '../lib/decorators';
import { BooleanDataType } from '../lib/decorators/Boolean';
import { PageNumber } from '../lib/decorators/PageNumber';
import { TypeDecoratorOptions } from '../lib/decorators/types/TypeDecoratorOptions';
import { BibliographicSubjectCreatorType, CoscradEnum } from '../lib/enums';
import { CoscradUserRole } from '../lib/enums/CoscradUserRole';

const buildDummyLabelAndDescription = (name: string): { label: string; description: string } => ({
    label: `label for property: ${name}`,
    description: `description of property: ${name}`,
});

const isOptional = true;

export class Whatsit {
    @NonEmptyString({ isOptional, ...buildDummyLabelAndDescription('whatsitName') })
    whatsitName = 'whatsit 1';

    @UUID({ ...buildDummyLabelAndDescription('whatsitId') })
    whatsitId = '25c5824f-6b4b-4341-bb60-3145d8109568';
}

export const THING_UNION = 'THING_UNION';

export const ThingUnionType = (options: TypeDecoratorOptions) => UnionType(THING_UNION, options);

@Union(THING_UNION, 'type')
export class ThingUnion {}

@UnionMember(THING_UNION, 'one')
export class ThingDataOne {
    type = 'one';

    @NonNegativeFiniteNumber({
        ...buildDummyLabelAndDescription('strength'),
    })
    strength = 99.5;
}

@UnionMember(THING_UNION, 'two')
export class ThingDataTwo {
    type = 'two';

    @PositiveInteger({ ...buildDummyLabelAndDescription('rating') })
    rating = 5;
}

export class Widget {
    @NonEmptyString({ ...buildDummyLabelAndDescription('widgetName') })
    widgetName = 'Machine';

    @NonEmptyString({ isOptional, ...buildDummyLabelAndDescription('locationName') })
    locationName = 'Back Red Room 12';

    // @IsString({ each: true })
    // @IsNotEmpty()
    @NonEmptyString({ isArray: true, ...buildDummyLabelAndDescription('aliases') })
    aliases: ['super machine', 'widget king'];

    @UUID({ ...buildDummyLabelAndDescription('id') })
    id = '25c5824f-6b4b-4341-bb60-3145d8109568';

    @UUID({ isOptional, ...buildDummyLabelAndDescription('locationId') })
    locationId = '25c5824f-6b4b-4341-bb60-3145d8109568';

    @URL({ ...buildDummyLabelAndDescription('iconUrl') })
    iconUrl = 'https://www.mylink.com/uploads/123.png';

    @URL({ isOptional, ...buildDummyLabelAndDescription('specSheetUrl') })
    specSheetUrl = undefined;

    @NonNegativeFiniteNumber({ ...buildDummyLabelAndDescription('width') })
    width = 134.5;

    @NonNegativeFiniteNumber({ isOptional, ...buildDummyLabelAndDescription('averageRating') })
    averageRating = 3.5;

    @FiniteNumber(buildDummyLabelAndDescription('muchness'))
    muchness = 1234.56;

    @FiniteNumber({ isOptional, ...buildDummyLabelAndDescription('maybeANumber') })
    maybeANumber = -20;

    @NestedDataType(Whatsit, { ...buildDummyLabelAndDescription('primaryWhatsit') })
    primaryWhatsit = {};

    @NestedDataType(Whatsit, { isOptional, ...buildDummyLabelAndDescription('secondaryWhatsit') })
    secondaryWhatsit = {};

    @RawDataObject({ ...buildDummyLabelAndDescription('rawDataObject') })
    rawDataObject = { foo: 72 };

    @RawDataObject({ isOptional, ...buildDummyLabelAndDescription('optionalRawData') })
    optionalRawData = undefined;

    @Enum(CoscradEnum.CoscradUserRole, { ...buildDummyLabelAndDescription('role') })
    role = CoscradUserRole.viewer;

    @Enum(CoscradEnum.BibliographicSubjectCreatorType, {
        ...buildDummyLabelAndDescription('creatorType'),
    })
    creatorType = BibliographicSubjectCreatorType.artist;

    @Year({ ...buildDummyLabelAndDescription('year') })
    year = 1998;

    @Year({ isOptional, ...buildDummyLabelAndDescription('yearUploaded') })
    yearUploaded = 2002;

    @PositiveInteger({ ...buildDummyLabelAndDescription('numkberOfLikes') })
    numberOfLikes = 22;

    @PositiveInteger({ isOptional, ...buildDummyLabelAndDescription('numberOfDownvotes') })
    numberOfDownvotes = 2;

    @ISBN({ ...buildDummyLabelAndDescription('requiredISBN') })
    requiredISBN = `978-3-16-148410-0`;

    @ISBN({ isOptional, ...buildDummyLabelAndDescription('optionalISBN') })
    optionalISBN = `979-3-16-148410-0`;

    @ThingUnionType({ ...buildDummyLabelAndDescription('data') })
    data: ThingDataOne | ThingDataTwo = {
        type: 'one',

        strength: 67.3,
    };

    @ReferenceTo('widget')
    @NonEmptyString({ ...buildDummyLabelAndDescription('parentWidgetId') })
    parentWidgetId = '123';

    @ReferenceTo('widget')
    @UUID({ ...buildDummyLabelAndDescription('catalogId') })
    catalogId = '25c5824f-6b4b-4341-bb60-3145d8109577';

    @ReferenceTo('widget')
    @NonEmptyString({ isArray: true, ...buildDummyLabelAndDescription('siblingWidgetIds') })
    siblingWidgetIds = ['1', '2', '33'];

    @PageNumber({ ...buildDummyLabelAndDescription('pageNumber') })
    pageNumber = 'XII';

    @BooleanDataType(buildDummyLabelAndDescription('isActive'))
    isActive = true;

    @BindToViewState(`selectedPoint`)
    @NonNegativeFiniteNumber(buildDummyLabelAndDescription('rivetPoint'))
    rivetPoint = 66.74; // presumably this is less than the `width` in the toy model

    constructor(dto: Widget) {
        Object.assign(this, dto);
    }
}

export const bootstrapWidgetDataTypes = (): void => {
    bootstrapDynamicTypes([Widget, ThingDataOne, ThingDataTwo, Whatsit, ThingUnion]);
};

export const buildValidWidgetDto = (): Widget => ({
    widgetName: 'Machine',

    locationName: 'Back Red Room 12',

    aliases: ['super machine', 'widget king'],

    id: '25c5824f-6b4b-4341-bb60-3145d8109568',

    locationId: '25c5824f-6b4b-4341-bb60-3145d8109568',

    iconUrl: 'https://www.mylink.com/uploads/123.png',

    specSheetUrl: undefined,

    width: 134.5,

    averageRating: 3.5,

    muchness: -3443.405,

    maybeANumber: 506,

    primaryWhatsit: {
        whatsitName: 'whatsit 1',

        whatsitId: '25c5824f-6b4b-4341-bb60-3145d8109568',
    },

    secondaryWhatsit: undefined,

    rawDataObject: { foo: 72 },

    optionalRawData: undefined,

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

    catalogId: '25c5824f-6b4b-4341-bb60-3145d8109577',

    parentWidgetId: '55',

    siblingWidgetIds: ['4', '33'],

    isActive: false,

    rivetPoint: 20.123,

    pageNumber: '1230',
});
