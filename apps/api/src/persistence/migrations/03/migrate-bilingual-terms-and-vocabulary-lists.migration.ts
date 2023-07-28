import { LanguageCode } from '@coscrad/api-interfaces';
import { buildMultilingualTextFromBilingualText } from '../../../domain/common/build-multilingual-text-from-bilingual-text';
import { MultilingualText } from '../../../domain/common/entities/multilingual-text';
import { Term } from '../../../domain/models/term/entities/term.entity';
import { VocabularyList } from '../../../domain/models/vocabulary-list/entities/vocabulary-list.entity';
import { DTO } from '../../../types/DTO';
import { ArangoCollectionId } from '../../database/collection-references/ArangoCollectionId';
import { ArangoDatabaseDocument } from '../../database/utilities/mapEntityDTOToDatabaseDTO';
import { ICoscradMigration } from '../coscrad-migration.interface';
import { ICoscradQueryRunner } from '../coscrad-query-runner.interface';
import { Migration } from '../decorators';

type TermDocument = ArangoDatabaseDocument<DTO<Term>>;

type OldTermDocument = Omit<TermDocument, 'text'> & {
    term: string;
    termEnglish: string;
};

type VocabularyListDocument = ArangoDatabaseDocument<DTO<VocabularyList>>;

type OldVocabularyListDocument = Omit<VocabularyListDocument, 'name'> & {
    name: string;
    nameEnglish: string;
};

const buildMultilingualText = (term: string, termEnglish: string): DTO<MultilingualText> => {
    return buildMultilingualTextFromBilingualText(
        { text: term, languageCode: LanguageCode.Chilcotin },
        {
            text: termEnglish,
            languageCode: LanguageCode.English,
        }
    ).toDTO();
};

const extract = (
    languageCodeToExtract: LanguageCode,
    multilingualTextDto: DTO<MultilingualText>
): string | null =>
    multilingualTextDto.items.find(({ languageCode }) => languageCode === languageCodeToExtract)
        ?.text || null;

@Migration({
    description: `convert bilingual terms and vocabulary lists to multilingual`,
    dateAuthored: `20230727`,
})
export class MigrateBilingualTermsAndVocabularyLists implements ICoscradMigration {
    sequenceNumber = 3;

    name = `MigrateBilignualTermsAndVocabularyLists`;

    async up(queryRunner: ICoscradQueryRunner): Promise<void> {
        // migrate terms
        await queryRunner.update<OldTermDocument, TermDocument>(
            ArangoCollectionId.terms,
            ({ term, termEnglish }: OldTermDocument) => {
                if (!term && !termEnglish) return {};

                return {
                    term: null,
                    termEnglish: null,
                    text: buildMultilingualText(term, termEnglish),
                };
            }
        );

        // migrate vocabulary lists
        await queryRunner.update<OldVocabularyListDocument, VocabularyListDocument>(
            ArangoCollectionId.vocabulary_lists,
            ({ name, nameEnglish }: OldVocabularyListDocument) => {
                if (!name && !nameEnglish) return {};

                return {
                    nameEnglish: null,
                    name: buildMultilingualText(name, nameEnglish),
                };
            }
        );
    }

    async down(queryRunner: ICoscradQueryRunner): Promise<void> {
        await queryRunner.update<TermDocument, OldTermDocument>(
            ArangoCollectionId.terms,
            ({ text }: TermDocument) => {
                return {
                    text: null,
                    term: extract(LanguageCode.Chilcotin, text),
                    termEnglish: extract(LanguageCode.English, text),
                };
            }
        );

        await queryRunner.update<VocabularyListDocument, OldVocabularyListDocument>(
            ArangoCollectionId.vocabulary_lists,
            ({ name }: VocabularyListDocument) => {
                return {
                    name: extract(LanguageCode.Chilcotin, name),
                    nameEnglish: extract(LanguageCode.English, name),
                };
            }
        );
    }
}
