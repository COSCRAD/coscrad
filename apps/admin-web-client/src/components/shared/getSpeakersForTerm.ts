import { IContributionSummary } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';

export const getSpeakersForTerm = (contributions: IContributionSummary[]): string => {
    const statementSearchTerm = 'spoken';

    console.log({ contributions });

    const contributors = contributions
        .filter(({ statement }) => {
            if (isNullOrUndefined(statement)) return false;

            return statement.toLowerCase().includes(statementSearchTerm);
        })
        .map(({ statement }) => statement);

    const [speakers] = contributors;

    return speakers;
};
