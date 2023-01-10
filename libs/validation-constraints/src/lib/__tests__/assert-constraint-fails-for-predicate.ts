import { PredicateFunction } from '../types';
import { ActAndAssert, buildConstraintAssertion } from './build-constraint-assertion';

export const assertConstraintFailsForPredicate = <T = unknown>(
    predicateFunction: PredicateFunction<T>
): ActAndAssert<T> => buildConstraintAssertion(predicateFunction, false);
