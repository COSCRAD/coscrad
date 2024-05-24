import { getCoscradDataSchema } from '../utilities';
import { NestedDataType } from './NestedDataType';
import { NonEmptyString } from './NonEmptyString';

const booksPropDescription = 'the books that are part of this library';

const booksPropLabel = 'books';

describe(`NestedDataType`, () => {
    class DigitalBook {
        @NonEmptyString({
            label: 'name',
            description: 'the name of this book',
        })
        name = 'good book';
    }

    class Library {
        @NestedDataType(DigitalBook, {
            label: booksPropLabel,
            description: booksPropDescription,
            isArray: true,
        })
        books = [new DigitalBook()];
    }

    it(`should populate the appropriate metadata`, () => {
        const actualMetadata = getCoscradDataSchema(Library);

        const bookTypeDefinition = actualMetadata['books'];

        //     "complexDataType": "NESTED_TYPE",
        // +     "description": "the books that are part of this library",
        // +     "isArray": false,
        // +     "isOptional": false,
        // +     "label": "books",
        // +     "name": "F-",

        // TODO fix types
        const { description, isArray, isOptional, label, name } = bookTypeDefinition as any;

        expect(description).toBe(booksPropDescription);

        expect(label).toBe(booksPropLabel);

        expect(isArray).toBe(true);

        expect(isOptional).toBe(false);

        expect(name).toBe('DigitalBook');
    });
});
