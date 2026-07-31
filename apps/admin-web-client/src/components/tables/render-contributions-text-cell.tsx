import { IContributionSummary } from '@coscrad/api-interfaces';
import { getSpeakersForTerm } from '../shared/getSpeakersForTerm';

export const renderContributionsTextCell = (contributions: IContributionSummary[]): JSX.Element => {
    const contributors = getSpeakersForTerm(contributions);

    return <span>{contributors}</span>;
};
