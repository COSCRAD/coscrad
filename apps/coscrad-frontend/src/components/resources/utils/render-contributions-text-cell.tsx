import { ContributorWithId } from '@coscrad/api-interfaces';

export const renderContributionsTextCell = (contributions: ContributorWithId[]): JSX.Element => {
    const contributors = contributions.map(({ fullName }) => fullName);

    return <span>{contributors.join(', ')}</span>;
};
