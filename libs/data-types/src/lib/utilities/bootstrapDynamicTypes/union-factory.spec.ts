import {
    THING_UNION,
    ThingDataOne,
    ThingDataTwo,
    Widget,
    bootstrapWidgetDataTypes,
} from '../../../test/widget';
import { UnionFactory } from './union-factory';

const thingOneDto = {
    // this is the discriminant for a `ThingDataOne`
    type: 'one',

    strength: 67.3,
};

const allCtors = [Widget, ThingDataOne, ThingDataTwo];

describe(`UnionFactory`, () => {
    beforeAll(() => {
        // Ensure dynamic union metadta is available for dummy data
        bootstrapWidgetDataTypes();
    });

    describe(`when there is a valid union definition`, () => {
        (
            [
                [ThingDataOne, thingOneDto],
                [
                    ThingDataTwo,
                    {
                        type: 'two',
                        rating: 10,
                    },
                ],
            ] as const
        ).forEach(([UnionMemberCtor, dto]) => {
            describe(`when the discriminant is: ${dto.type}`, () => {
                it(`should build an instance`, () => {
                    const factory = new UnionFactory<unknown, ThingDataOne | ThingDataTwo>(
                        allCtors,
                        THING_UNION
                    );

                    const instance = factory.build(dto.type, dto);

                    expect(instance).toBeInstanceOf(UnionMemberCtor);
                });
            });
        });
    });

    describe(`when there is no union with the given name`, () => {
        it(`should throw`, () => {
            const act = () =>
                new UnionFactory([], THING_UNION).build(thingOneDto.type, thingOneDto);

            expect(act).toThrow();
        });
    });

    describe(`when the dto has an invalid discriminant value`, () => {
        it(`should throw`, () => {
            const factory = new UnionFactory<unknown, ThingDataOne | ThingDataTwo>(
                allCtors,
                THING_UNION
            );

            const act = () =>
                factory.build('ninety-five', {
                    type: 'ninety-five',
                });

            expect(act).toThrow();
        });
    });
});
