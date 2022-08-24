import {
    AggregateType,
    AggregateTypeToAggregateInstance,
} from '../../../../domain/types/AggregateType';
import { DTO } from '../../../../types/DTO';
import { buildBookAggregateFactoryTestCaseSet } from './book.aggregate-factory.test-cases';
import { buildTermAggregateFactoryTestCaseSet } from './term.aggregate-factory.test-cases';

type AggregateFactoryValidTestCase<TAggregateType extends AggregateType> = {
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
    buildBookAggregateFactoryTestCaseSet(),
    buildTermAggregateFactoryTestCaseSet(),
];
