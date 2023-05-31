import { getCoscradDataSchema } from '@coscrad/data-types';
import { Test } from '@nestjs/testing';
import { CreateNoteAboutResource } from '../domain/models/context/commands';
import { FreeMultilineContext } from '../domain/models/context/free-multiline-context/free-multiline-context.entity';
import { DynamicDataTypeFinderService } from './dynamic-data-type-finder.service';
import { DynamicDataTypeModule } from './dynamic-data-type.module';

describe('DynamicDataTypeFinderService', () => {
    let dynamicDataTypeFinderService: DynamicDataTypeFinderService;

    beforeAll(async () => {
        const testModule = await Test.createTestingModule({
            imports: [DynamicDataTypeModule],
            providers: [CreateNoteAboutResource, FreeMultilineContext],
        }).compile();

        dynamicDataTypeFinderService = testModule.get<DynamicDataTypeFinderService>(
            DynamicDataTypeFinderService
        );
    });

    describe(`when there is a valid union type definition for a class`, () => {
        it(`should bootstrap the schema definitions`, async () => {
            await dynamicDataTypeFinderService.registerAllUnions();

            const dataSchema = getCoscradDataSchema(CreateNoteAboutResource);

            expect(dataSchema['resourceContext']).toMatchSnapshot();
        });
    });
});
