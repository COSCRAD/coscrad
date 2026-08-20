import { IContributionSummary } from '@coscrad/api-interfaces';
import { getSpeakersStatementForTerm } from '../getSpeakersStatementForTerm';

export const renderContributionsTextCell = (contributions: IContributionSummary[]): JSX.Element => {
    const contributors = getSpeakersStatementForTerm(contributions);

    return <span>{contributors}</span>;
};
