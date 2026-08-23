import { IContributionSummary } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { getSpeakersStatementForTerm } from '../getSpeakersStatementForTerm';

export const renderSpeakersForTermTextCell = (
    contributions: IContributionSummary[]
): JSX.Element => {
    const speakersStatementForTerm = getSpeakersStatementForTerm(contributions);

    if (isNullOrUndefined(speakersStatementForTerm)) return null;

    return <span>{speakersStatementForTerm}</span>;
};
