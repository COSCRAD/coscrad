import { SinglePropertyPresenter } from '../../../utils/generic-components';

export type ContributionsMap = Map<string, string>;

interface ContributionsHackProps {
    resourceId: string;
    contributionsMap: ContributionsMap;
}

export const ContributionsHack = ({
    resourceId,
    contributionsMap,
}: ContributionsHackProps): JSX.Element => {
    if (!contributionsMap.has(resourceId)) return <div>No Contributions Found</div>;

    return (
        <SinglePropertyPresenter display="Contibutions" value={contributionsMap.get(resourceId)} />
    );
};
