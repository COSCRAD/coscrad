import { Criterion } from './Criterion';

/**
 * A specification includes logic for determning if an instance of a model
 * of type `TModel` satisfies the criterion parametrized by a value of type
 * `UValue`. We also store the criterion so that we can convert this to
 * a db query in the appropriate layer. I.e. we will make concrete db implementation(s)
 * interpret the criterion.
 */
export interface ISpecification<TModel, UValue = string | boolean> {
    criterion: Criterion<UValue>;

    isSatisfiedBy(model: TModel): boolean;
}
