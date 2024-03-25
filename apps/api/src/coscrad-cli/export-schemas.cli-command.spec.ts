import { Test, TestingModule } from '@nestjs/testing';
import { existsSync, rmSync } from 'fs';
import { CommandTestFactory } from 'nest-commander-testing';
import { AppModule } from '../app/app.module';
import {
    AddLyricsForSong,
    CreateSong,
    LyricsAddedForSong,
    SongCreated,
    SongLyricsTranslated,
    SongTitleTranslated,
    TranslateSongLyrics,
    TranslateSongTitle,
} from '../domain/models/song/commands';
import { Song } from '../domain/models/song/song.entity';
import { DynamicDataTypeModule } from '../validation';
import { CoscradCliModule } from './coscrad-cli.module';

const cliCommandName = 'export-schemas';

const outputDir = `__cli-command-test-files__/__export-schemas__`;

describe(`CLI Command: **export-schemas**`, () => {
    let commandInstance: TestingModule;

    beforeAll(async () => {
        // TODO use generic `Widget` domain model and related events, commands, views, etc. to avoid maintenance costs
        const testAppModule = await Test.createTestingModule({
            imports: [DynamicDataTypeModule],
            providers: [
                // Domain Model
                Song,
                // Commands
                CreateSong,
                AddLyricsForSong,
                TranslateSongLyrics,
                TranslateSongTitle,
                // Events
                SongCreated,
                SongTitleTranslated,
                LyricsAddedForSong,
                SongLyricsTranslated,
                // TODO Add remaining song events
            ].map((ctor) => ({
                provide: ctor,
                useValue: ctor,
            })),
        }).compile();

        await testAppModule.init();

        commandInstance = await CommandTestFactory.createTestingCommand({
            imports: [CoscradCliModule],
        })
            .overrideProvider(AppModule)
            .useValue(testAppModule)
            .compile();
    });

    beforeEach(() => {
        if (existsSync(outputDir)) {
            rmSync(outputDir, { recursive: true, force: true });
        }

        // the command will make the directory if necessary
    });

    describe(`when exporting event schemas`, () => {
        it(`should write the correct schemas`, async () => {
            await CommandTestFactory.run(commandInstance, [
                cliCommandName,
                `--directory=${outputDir}`,
            ]);

            const commandSchemasDirectoryPath = `${outputDir}/commands`;

            const doesDirectoryExist = existsSync(commandSchemasDirectoryPath);

            expect(doesDirectoryExist).toBe(true);
        });
    });
});
