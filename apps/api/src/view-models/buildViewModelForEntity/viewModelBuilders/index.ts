import buildAudioWithTranscriptViewModels from './buildAudioWithTranscriptViewModels';
import buildSpatialFeatureViewModels from './buildSpatialFeatureViewModels';
import buildTagViewModels from './buildTagViewModels';
import buildTermViewModels from './buildTermViewModels';
import buildVocabularyListViewModels from './buildVocabularyListViewModels';

export default [
    buildTermViewModels,
    buildVocabularyListViewModels,
    buildTagViewModels,
    buildAudioWithTranscriptViewModels,
    buildSpatialFeatureViewModels,
];
