import { NonNegativeFiniteNumber } from '../../decorators/NonNegativeFiniteNumber';
import getCoscradDataSchema from '../getCoscradDataSchema';
import { convertCoscradSchemaToOpenApiFormat } from './convert-coscrad-schema-to-open-api-format';

describe('convertCoscradSchemaToOpenApiFormat', () => {
    describe(`when there is a simple schmea with only basic data types`, () => {
        it(`should return the correct open API schema`, () => {
            class Simple {
                @NonNegativeFiniteNumber({
                    label: 'count',
                    description: 'how many are there?',
                })
                count: number;
            }

            const openApiSchema = convertCoscradSchemaToOpenApiFormat(getCoscradDataSchema(Simple));

            expect(openApiSchema).toMatchSnapshot();
        });
    });
});
