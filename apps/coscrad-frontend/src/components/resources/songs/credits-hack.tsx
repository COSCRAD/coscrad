import { SinglePropertyPresenter } from '../../../utils/generic-components';

export type CreditsMap = Map<string, string>;

interface CreditsHackProps {
    resourceId: string;
    creditsMap: CreditsMap;
}

export const CreditsHack = ({ resourceId, creditsMap }: CreditsHackProps): JSX.Element => {
    if (!creditsMap.has(resourceId)) return <div>No Credits Found</div>;

    return <SinglePropertyPresenter display="Credits" value={creditsMap.get(resourceId)} />;
};
