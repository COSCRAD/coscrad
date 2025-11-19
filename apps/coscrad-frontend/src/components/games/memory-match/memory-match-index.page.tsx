import { IMemoryMatchRound } from '@coscrad/api-interfaces';
import { NotFoundPresenter } from '../../not-found';

export interface MemoryMatchIndexPageProps {
    entities: IMemoryMatchRound[];
}

export const MemoryMatchIndexPage = () => {
    const rounds = [];

    if (rounds.length === 0) {
        return <NotFoundPresenter />;
    }

    return <div>TO DO</div>;
};
