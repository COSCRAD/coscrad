import { InternalError } from '../../../../lib/errors/InternalError';
import { Ctor } from '../../../../lib/types/Ctor';

export default (
    error: InternalError,
    propertyKey: string,
    TopLevelErrorCtor: Ctor<InternalError>
) => {
    expect(error).toBeInstanceOf(TopLevelErrorCtor);

    expect(error.toString().includes(propertyKey)).toBe(true);
};
