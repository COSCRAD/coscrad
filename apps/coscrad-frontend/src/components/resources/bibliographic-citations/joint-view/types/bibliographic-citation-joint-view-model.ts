/**
 * We sometimes want to consolidate the union type into a single view, for example,
 * when building a single index table.
 */
export type BibliographicCitationJointViewModel = {
    id: string;
    // Label for the bibliographic citation type
    type: string;
    title: string;
    citation: string;
};
