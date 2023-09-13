import { LanguageCode } from '@coscrad/api-interfaces';
import buildTestData from '../../test-data/buildTestData';
import { DTO } from '../../types/DTO';
import { buildMultilingualTextWithSingleItem } from '../common/build-multilingual-text-with-single-item';
import { ResourceType } from '../types/ResourceType';
import { VocabularyList } from './vocabulary-list/entities/vocabulary-list.entity';

describe('the (base) resource clone method', () => {
    describe('for a vocabularyList', () => {
        const initialVocabularyList = buildTestData().resources[ResourceType.vocabularyList][0];

        describe('when no updates are provided', () => {
            const updatedVocabularyList = initialVocabularyList.clone();

            it('should return an instance of VocabularyList', () => {
                expect(updatedVocabularyList).toBeInstanceOf(VocabularyList);
            });

            it('should return an equivalent instance', () => {
                expect(updatedVocabularyList.toDTO()).toEqual(initialVocabularyList.toDTO());
            });

            // Avoiding shared references is the reason we use clone in the first place
            it('should not return the original object', () => {
                expect(updatedVocabularyList).not.toBe(initialVocabularyList);
            });
        });

        describe('when some updates are provided', () => {
            const newName = 'new list name';

            const updates: Partial<DTO<VocabularyList>> = {
                name: buildMultilingualTextWithSingleItem(newName, LanguageCode.Haida).toDTO(),
            };

            const updatedVocabularyList = initialVocabularyList.clone(updates);

            const expectedNewDto = {
                ...initialVocabularyList.toDTO(),
                ...updates,
            };

            it('should return an instance of VocabularyList', () => {
                expect(updatedVocabularyList).toBeInstanceOf(VocabularyList);
            });

            it('a DTO for the updated instance should have the expected property values', () => {
                expect(updatedVocabularyList.toDTO()).toEqual(expectedNewDto);
            });

            // Avoiding shared references is the reason we use clone in the first place
            it('should not return the original object', () => {
                expect(updatedVocabularyList).not.toBe(initialVocabularyList);
            });
        });
    });
});
