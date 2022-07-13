import { InternalError } from '../../../../lib/errors/InternalError';
import { Ctor } from '../../../../lib/types/Ctor';

export default (result: unknown, propertyKey: string, TopLevelErrorCtor: Ctor<InternalError>) => {
    expect(result).toBeInstanceOf(TopLevelErrorCtor);

    expect(result.toString().includes(propertyKey)).toBe(true);
};
