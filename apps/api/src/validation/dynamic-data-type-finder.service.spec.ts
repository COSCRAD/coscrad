import {
    getCoscradDataSchema,
    NestedDataType,
    NonEmptyString,
    NonNegativeFiniteNumber,
    Union2,
    Union2Member,
} from '@coscrad/data-types';
import { Test } from '@nestjs/testing';
import { DynamicDataTypeFinderService } from './dynamic-data-type-finder.service';
import { DynamicDataTypeModule } from './dynamic-data-type.module';

describe('DynamicDataTypeFinderService', () => {
    let dynamicDataTypeFinderService: DynamicDataTypeFinderService;

    const DUMMY_CONTEXT_UNION = 'DUMMY_CONTEXT_UNION';

    @Union2Member(DUMMY_CONTEXT_UNION, 'one')
    class Context1 {
        type: 'one';

        @NonEmptyString({
            label: 'foo',
            description: 'foo',
        })
        foo: string;
    }

    @Union2Member(DUMMY_CONTEXT_UNION, 'two')
    class Context2 {
        type: 'two';

        @NonNegativeFiniteNumber({
            label: 'bar',
            description: 'bar',
        })
        bar: number;
    }

    class EdgeConnectionMember {
        @NonEmptyString({
            label: 'ID',
            description: 'unique identifier',
        })
        id: string;

        @Union2(DUMMY_CONTEXT_UNION, 'type', {
            label: 'context',
            description: 'contextualizes the connection within the resource context',
        })
        context: Context1 | Context2;
    }

    class EdgeConnection {
        @NestedDataType(EdgeConnectionMember, {
            isArray: true,
            label: `members`,
            description: `information about resources that participate in this connection`,
        })
        members: EdgeConnectionMember[];
    }

    beforeAll(async () => {
        const testModule = await Test.createTestingModule({
            imports: [DynamicDataTypeModule],
            providers: [EdgeConnection, EdgeConnectionMember, Context1, Context2],
        }).compile();

        dynamicDataTypeFinderService = testModule.get<DynamicDataTypeFinderService>(
            DynamicDataTypeFinderService
        );
    });

    describe(`when there is a valid union type definition for a class`, () => {
        it(`should bootstrap the schema definitions`, async () => {
            await dynamicDataTypeFinderService.bootstrapDynamicTypes();

            const dataSchema = getCoscradDataSchema(EdgeConnection);

            const nestedUnionMemberSchemaDefinitions =
                dataSchema['members']['schema']['context']['schemaDefinitions'];

            expect(nestedUnionMemberSchemaDefinitions).toHaveLength(2);

            expect(dataSchema).toMatchSnapshot();
        });
    });
});
