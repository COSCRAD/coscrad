import { IContributionSummary } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { CONTRIBUTION_TYPE } from '../resources/terms/add-speaker-to-term-form';

export const getSpeakersStatementForTerm = (contributions: IContributionSummary[]): string => {
    const statementSearchTerm = 'spoken';

    // console.log({ contributions });

    const contributors = contributions
        .filter(({ statement }) => {
            if (isNullOrUndefined(statement)) return false;

            return statement.toLowerCase().includes(statementSearchTerm);
        })
        .map(({ statement }) => {
            const splitStatement = statement.split(': ');

            if (isNullOrUndefined(splitStatement[1])) return '';

            const speakerNames = splitStatement[1];

            return speakerNames;
        });

    const [speakerNames] = contributors;

    return `${CONTRIBUTION_TYPE} by: ${speakerNames}`;
};
