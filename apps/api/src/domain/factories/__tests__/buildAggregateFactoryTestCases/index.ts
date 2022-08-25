import {
    AggregateType,
    AggregateTypeToAggregateInstance,
} from '../../../../domain/types/AggregateType';
import { DTO } from '../../../../types/DTO';
import { buildBibliographicReferenceFactoryTestSet } from './bibliographic-reference.aggregate-factory.test-cases';
import { buildBookAggregateFactoryTestCaseSet } from './book.aggregate-factory.test-cases';
import { buildMediaItemFactoryTestCaseSet } from './media-item.aggregate-factory.test-cases';
import { buildPhotographFactoryTestSet } from './photograph.aggregate-factory.test-cases';
import { buildSongFactoryTestSet } from './song.aggregate-factory.test-cases';
import { buildTermAggregateFactoryTestCaseSet } from './term.aggregate-factory.test-cases';
import { buildTranscribedAudioFactoryTestCaseSet } from './transcribed-audio.aggregate-factory.test-cases';
import { buildVocabularyListAggregateFactoryTestCases } from './vocabulary-list.aggregate-factory.test-cases';

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
    buildBookAggregateFactoryTestCaseSet(),
    buildMediaItemFactoryTestCaseSet(),
    buildPhotographFactoryTestSet(),
    buildSongFactoryTestSet(),
    buildTermAggregateFactoryTestCaseSet(),
    buildTranscribedAudioFactoryTestCaseSet(),
    buildVocabularyListAggregateFactoryTestCases(),
];
