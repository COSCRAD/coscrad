import { IContributionSummary } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { CONTRIBUTION_TYPE } from '../resources/terms/add-speaker-to-term-form';

export const getSpeakersStatementForTerm = (
    contributions: IContributionSummary[]
): string | undefined => {
    const statementSearchTerm = 'spoken';

    console.log({ contributions });

    const contributors = contributions
        .filter(({ statement }) => {
            if (isNullOrUndefined(statement)) return false;

            const result = statement.toLowerCase().includes(statementSearchTerm);

            return result;
        })
        .map(({ statement }) => {
            const splitStatement = statement.split(': ');

            if (isNullOrUndefined(splitStatement[1])) return '';

            const speakerNames = splitStatement[1];

            return speakerNames;
        });

    if (contributors.length === 0) return undefined;

    console.log({ contributorsSpeakers: contributors });

    const speakerNames = contributors.join(', ');

    return `${CONTRIBUTION_TYPE} by: ${speakerNames}`;
};
