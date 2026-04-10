import { IMemoryMatchRound } from '@coscrad/api-interfaces';
import { NOT_FOUND } from '../../interfaces/maybe-loadable.interface';
import { MemoryMatchActiveRound } from './memory-match-active-round';

export type MemoryMatchIndexState = {
    entities: Record<string, IMemoryMatchRound | NOT_FOUND>;
    active?: MemoryMatchActiveRound;
    selected: IMemoryMatchRound[];
    page: number;
    count?: number;
};
