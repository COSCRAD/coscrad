export interface IContributionSummary {
    contributorIds: string[];

    statement: string;

    type: string;

    date: {
        day: number;
        month: string;
        year: number;
    };

    timestamp: number;
}

export interface IContribution {
    contributor: {
        firstName: string;
        lastName: string;
    };
    /**
     * TODO [https://www.pivotaltracker.com/story/show/187557664]
     * Add a summary of the given contribution
     */
}
