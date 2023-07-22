import { LanguageCode } from '@coscrad/api-interfaces';
import {
    MultilingualText,
    MultilingualTextItem,
} from '../../../domain/common/entities/multilingual-text';
import { AudioItem } from '../../../domain/models/audio-item/entities/audio-item.entity';
import { DTO } from '../../../types/DTO';
import { ArangoCollectionId } from '../../database/collection-references/ArangoCollectionId';
import { DatabaseDTO } from '../../database/utilities/mapEntityDTOToDatabaseDTO';
import { ICoscradMigration } from '../coscrad-migration.interface';
import { ICoscradQueryRunner } from '../coscrad-query-runner.interface';

const OLD_ENGLISH_LANGUAGE_CODE = 'eng';

type AudioDocument = DatabaseDTO<DTO<AudioItem>>;

type OldAudioDocument = Omit<AudioDocument, 'name'> & {
    name: Omit<MultilingualText, 'items'> & {
        items: (Omit<MultilingualTextItem, 'languageCode'> & {
            languageCode: LanguageCode | typeof OLD_ENGLISH_LANGUAGE_CODE;
        })[];
    };
};

export class UpdateEnglishLanguageCode implements ICoscradMigration {
    readonly sequenceNumber = 2;

    readonly name = `UpdateEnglishLanguageCode`;

    async up(queryRunner: ICoscradQueryRunner): Promise<void> {
        await queryRunner.update<OldAudioDocument, AudioDocument>(
            ArangoCollectionId.audio_items,
            ({ name }) => {
                if (
                    !name.items.some(
                        ({ languageCode }) => languageCode === OLD_ENGLISH_LANGUAGE_CODE
                    )
                )
                    return {};

                return {
                    name: {
                        ...name,
                        items: name.items.map((item: MultilingualTextItem) => ({
                            ...item,
                            languageCode:
                                item.languageCode === (OLD_ENGLISH_LANGUAGE_CODE as LanguageCode)
                                    ? LanguageCode.English
                                    : item.languageCode,
                        })),
                    },
                };
            }
        );
    }

    async down(queryRunner: ICoscradQueryRunner): Promise<void> {
        await queryRunner.update<AudioDocument, AudioDocument>(
            ArangoCollectionId.audio_items,
            // @ts-expect-error fix me
            ({ name }) => {
                if (!name.items.some(({ languageCode }) => languageCode === LanguageCode.English))
                    return {};

                return {
                    name: {
                        ...name,
                        items: name.items.map((item: MultilingualTextItem) => ({
                            ...item,
                            languageCode:
                                item.languageCode === LanguageCode.English
                                    ? OLD_ENGLISH_LANGUAGE_CODE
                                    : item.languageCode,
                        })),
                    },
                };
            }
        );
    }
}
