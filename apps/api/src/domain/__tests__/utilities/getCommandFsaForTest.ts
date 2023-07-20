import { InternalError } from '../../../lib/errors/InternalError';
import { clonePlainObjectWithOverrides } from '../../../lib/utilities/clonePlainObjectWithOverrides';
import { buildTestCommandFsaMap } from '../../../test-data/commands';
import { DeepPartial } from '../../../types/DeepPartial';

type FSA<T> = {
    type: string;
    payload: T;
};

export const getCommandFsaForTest = <T = unknown>(
    commandType: string,
    payloadOverrides?: DeepPartial<T>
): FSA<T> => {
    const fsaMap = buildTestCommandFsaMap();

    if (!fsaMap.has(commandType)) {
        throw new InternalError(
            `Failed to find a test command FSA for command of type: ${commandType}`
        );
    }

    const dummyFsa = fsaMap.get(commandType) as FSA<T>;

    const fsaWithOverrides = clonePlainObjectWithOverrides(
        dummyFsa,
        payloadOverrides ? { payload: payloadOverrides } : {}
    );

    return fsaWithOverrides;
};
