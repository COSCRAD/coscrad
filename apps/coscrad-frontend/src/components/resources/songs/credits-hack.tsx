import { SinglePropertyPresenter } from '../../../utils/generic-components';
import { Optional } from '../../../utils/generic-components/presenters/optional';

export type CreditsMap = Map<string, string>;

interface CreditsHackProps {
    resourceId: string;
    creditsMap: CreditsMap;
}

export const CreditsHack = ({ resourceId, creditsMap }: CreditsHackProps): JSX.Element => (
    <Optional predicateValue={creditsMap.has(resourceId)}>
        <SinglePropertyPresenter display="Credits" value={creditsMap.get(resourceId)} />
    </Optional>
);
