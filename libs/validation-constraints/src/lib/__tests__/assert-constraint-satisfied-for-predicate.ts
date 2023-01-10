import { PredicateFunction } from '../types';
import { ActAndAssert, buildConstraintAssertion } from './build-constraint-assertion';

export const assertConstraintSatisfiedForPredicate = <T = unknown>(
    predicateFunction: PredicateFunction<T>
): ActAndAssert<T> => buildConstraintAssertion(predicateFunction, true);
