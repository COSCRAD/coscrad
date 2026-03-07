import { IMemoryMatchRound } from '@coscrad/api-interfaces';
import { NOT_FOUND } from '../../interfaces/maybe-loadable.interface';

export type MemoryMatchIndexState = {
    entities: Record<string, IMemoryMatchRound | NOT_FOUND>;
    active?: IMemoryMatchRound;
    selected: IMemoryMatchRound[];
    page: number;
    count?: number;
};
