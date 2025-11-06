import {
    ExternalEnum,
    NestedDataType,
    NonEmptyString,
    NonNegativeFiniteNumber,
    PositiveInteger,
    UUID,
} from '../../decorators';
import { getCoscradDataSchema } from '../../utilities';
import { validateFieldPathForCoscradModel } from './validate-field-path-for-coscrad-model';

const buildLabel = (field) => ({
    label: field,
    description: `description for test field: ${field}`,
});

class AccessControlList {
    @UUID({
        ...buildLabel('allowedUserIds'),
        isArray: true,
    })
    allowedUserIds: string[];
}

enum WidgetType {
    red = 'RED',
}

class Alias {
    @NonEmptyString({
        ...buildLabel('nickname'),
    })
    nickname: string;

    @NonNegativeFiniteNumber({
        ...buildLabel('priority'),
        isOptional: true,
    })
    priority?: number;

    @NonEmptyString({
        ...buildLabel('revisions'),
        isArray: true,
        isOptional: true,
    })
    revisions: string[];
}

enum WhatsitType {
    big = 'big',
}

class Whatsit {
    @NestedDataType(Alias, {
        ...buildLabel('aliases'),
        isArray: true,
    })
    aliases: Alias[];

    @PositiveInteger(buildLabel('id'))
    id: number;

    @ExternalEnum(
        {
            enumName: 'whatsitType',
            enumLabel: 'Whatsit Type',
            labelsAndValues: [
                {
                    label: 'big',
                    value: 'big',
                },
            ],
        },
        buildLabel('type')
    )
    type: WhatsitType;
}

class Widget {
    @ExternalEnum(
        {
            enumName: 'widgetType',
            enumLabel: 'Widget Type',
            labelsAndValues: [
                {
                    label: 'red',
                    value: 'RED',
                },
            ],
        },
        buildLabel('type')
    )
    type: WidgetType;

    @NonNegativeFiniteNumber(buildLabel('count'))
    count: number;

    @NonEmptyString({
        ...buildLabel('tags'),
        isArray: true,
    })
    tags: string[];

    @NonNegativeFiniteNumber({
        ...buildLabel('age'),
        isOptional: true,
    })
    age: number;

    @NestedDataType(Whatsit, {
        ...buildLabel('whatsits'),
        isArray: true,
    })
    whatsits: Whatsit[];

    @NestedDataType(Alias, {
        ...buildLabel('alias'),
        isOptional: true,
    })
    alias?: Alias;

    @NestedDataType(AccessControlList, {
        ...buildLabel('acl'),
        isPrivate: true,
    })
    accessControlList: AccessControlList;
}

const schema = getCoscradDataSchema(Widget);

describe(`validateFieldPathForCoscradModel`, () => {
    describe(`when the path is valid`, () => {
        describe(`when given a primitive type, top-level property`, () => {
            /**
             * Optionality shouldn't matter, but we added an extra test
             * case to be thorough.
             */
            describe(`when the field is a required field`, () => {
                const validPath = 'count';

                it(`should return no errors`, () => {
                    const result = validateFieldPathForCoscradModel(validPath, schema);

                    expect(result).toEqual([]);
                });
            });

            describe(`when the field is an optional field`, () => {
                const validPath = 'age';

                it(`should return no errors`, () => {
                    const result = validateFieldPathForCoscradModel(validPath, schema);

                    expect(result).toEqual([]);
                });
            });
        });

        describe(`when given a top-level enum-valued type`, () => {
            it(`should return no errors`, () => {
                const result = validateFieldPathForCoscradModel(`type`, schema);

                expect(result).toEqual([]);
            });
        });

        describe(`when given an object-valued, top-level property`, () => {
            it(`should return no errors`, () => {
                const result = validateFieldPathForCoscradModel('alias', schema);

                expect(result).toEqual([]);
            });
        });

        describe(`when given a top-level array-valued property`, () => {
            describe(`when the array property contains primitive elements`, () => {
                const validPath = 'tags[*]';

                it(`should return no errors`, () => {
                    const result = validateFieldPathForCoscradModel(validPath, schema);

                    expect(result).toEqual([]);
                });
            });

            describe(`when the array property contains object-valued elements`, () => {
                it(`should return no errors`, () => {
                    const result = validateFieldPathForCoscradModel(`whatsits[*]`, schema);

                    expect(result).toEqual([]);
                });
            });
        });

        describe(`when given a second-level property`, () => {
            describe(`of primitive type`, () => {
                const result = validateFieldPathForCoscradModel('alias.nickname', schema);

                expect(result).toEqual([]);
            });

            describe(`nested property on an array`, () => {
                it(`should return no errors`, () => {
                    const result = validateFieldPathForCoscradModel(`whatsits[*].id`, schema);

                    expect(result).toEqual([]);
                });
            });

            describe(`nested enum property on an array element`, () => {
                it(`should return no errors`, () => {
                    const result = validateFieldPathForCoscradModel('whatsits[*].type', schema);

                    expect(result).toEqual([]);
                });
            });

            describe(`array elements on a nested property`, () => {
                it(`should return no errors`, () => {
                    const result = validateFieldPathForCoscradModel(`alias.revisions[*]`, schema);

                    expect(result).toHaveLength(0);
                });
            });
        });
    });

    describe(`when the path is invalid`, () => {
        describe(`when a private top level property is referenced`, () => {
            const invalidPath = 'accessControlList';

            it(`should return the expected error`, () => {
                const result = validateFieldPathForCoscradModel(invalidPath, schema);

                expect(result).toHaveLength(1);

                const { message } = result[0];

                expect(message).toContain(invalidPath);
            });
        });

        describe(`when an unknown top level property is referenced`, () => {
            const invalidPath = 'missingFieldName';

            it(`should return the expected error`, () => {
                const result = validateFieldPathForCoscradModel(invalidPath, schema);

                expect(result).toHaveLength(1);

                const { message } = result[0];

                expect(message).toContain(invalidPath);
            });
        });

        describe(`when the reference is invalid at the second level`, () => {
            describe(`when the parent field is of a primitive type`, () => {
                const invalidSecondLevelFieldName = `barz`;

                const invalidPath = `alias.${invalidSecondLevelFieldName}`;

                it(`should return the expected error`, () => {
                    const result = validateFieldPathForCoscradModel(invalidPath, schema);

                    expect(result).toHaveLength(1);

                    const { message } = result[0];

                    expect(message).toContain(invalidPath);
                });
            });

            describe(`when accessing a nested property on an enum`, () => {
                it(`should return the expected error`, () => {
                    const result = validateFieldPathForCoscradModel('type.id', schema);

                    expect(result).toHaveLength(1);

                    const { message } = result[0];

                    expect(message).toContain('enum');

                    expect(message).toContain('widgetType');
                });
            });

            describe(`when the parent field is object-valued, but the property is unknown`, () => {
                const missingChildField = `bogus`;

                const fieldPath = `alias.${missingChildField}`;

                it(`should return the expected error`, () => {
                    const result = validateFieldPathForCoscradModel(fieldPath, schema);

                    expect(result).toHaveLength(1);

                    const { message } = result[0];

                    expect(message).toContain(`unknown`);

                    expect(message).toContain(missingChildField);
                });
            });
        });

        describe(`when a property is referenced as an array, but it is not an array`, () => {
            describe(`at top level`, () => {
                const invalidPath = `count[*]`;

                it(`should return the expected error`, () => {
                    const result = validateFieldPathForCoscradModel(invalidPath, schema);

                    expect(result).toHaveLength(1);

                    const { message } = result[0];

                    expect(message).toContain(invalidPath);

                    expect(message).toContain(`Unexpected array reference in field path`);
                });
            });
        });
    });
});
