import { IContributionSummary } from '@coscrad/api-interfaces';

export const getSpeakersForTerm = (contributions: IContributionSummary[]): string => {
    const statementSearchTerm = 'spoken';

    const contributors = contributions
        .filter(({ statement }) => statement.toLowerCase().includes(statementSearchTerm))
        .map(({ statement }) => statement);

    const [speakers] = contributors;

    return speakers;
};
