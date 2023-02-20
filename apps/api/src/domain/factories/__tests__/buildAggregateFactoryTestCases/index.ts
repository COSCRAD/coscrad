import {
    AggregateType,
    AggregateTypeToAggregateInstance,
} from '../../../../domain/types/AggregateType';
import { DTO } from '../../../../types/DTO';
import { buildAudioItemFactoryTestSet } from './audio-item.aggregate-factory.test-set';
import { buildBibliographicReferenceFactoryTestSet } from './bibliographic-reference.aggregate-factory.test-set';
import { buildBookAggregateFactoryTestSet } from './book.aggregate-factory.test-set';
import { buildMediaItemFactoryTestSet } from './media-item.aggregate-factory.test-set';
import { buildPhotographFactoryTestSet } from './photograph.aggregate-factory.test-set';
import { buildSongFactoryTestSet } from './song.aggregate-factory.test-set';
import { buildSpatialFeatureFactoryTestSet } from './spatial-feature.aggregate-factory.test-set';
import { buildTermAggregateFactoryTestSet } from './term.aggregate-factory.test-set';
import { buildVideoFactoryTestSet } from './video.aggregate-factory.test-set';
import { buildVocabularyListAggregateFactoryTestSet } from './vocabulary-list.aggregate-factory.test-set';

export type AggregateFactoryValidTestCase<TAggregateType extends AggregateType> = {
    dto: DTO<AggregateTypeToAggregateInstance[TAggregateType]>;
    description: string;
};

export type AggregateFactoryInalidTestCase = {
    description: string;
    dto: unknown;
    checkError: (result: unknown) => void;
};

export type FactoryTestSuiteForAggregate<TAggregateType extends AggregateType = AggregateType> = {
    aggregateType: TAggregateType;
    validCases: AggregateFactoryValidTestCase<TAggregateType>[];
    invalidCases: AggregateFactoryInalidTestCase[];
};

export default (): FactoryTestSuiteForAggregate[] => [
    buildBibliographicReferenceFactoryTestSet(),
    buildBookAggregateFactoryTestSet(),
    buildMediaItemFactoryTestSet(),
    buildPhotographFactoryTestSet(),
    buildSongFactoryTestSet(),
    buildSpatialFeatureFactoryTestSet(),
    buildTermAggregateFactoryTestSet(),
    buildAudioItemFactoryTestSet(),
    buildVideoFactoryTestSet(),
    buildVocabularyListAggregateFactoryTestSet(),
];
