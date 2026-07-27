import { IContributionSummary } from '@coscrad/api-interfaces';

export const renderContributionsTextCell = (contributions: IContributionSummary[]): JSX.Element => {
    const contributors = contributions.map(({ statement }) => statement);

    return <span>{contributors.join(', ')}</span>;
};
