import { PredicateFunction } from '../types';
import { ActAndAssert, buildConstraintAssertion } from './build-constraint-assertion';

export const assertConstraintFailsForPredicate = (
    predicateFunction: PredicateFunction
): ActAndAssert => buildConstraintAssertion(predicateFunction, false);
