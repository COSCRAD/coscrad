import { ICommandFormAndLabels } from '../../commands';
import { HasId } from './has-id.interface';
import { IMultilingualText } from './resources/common';
import { INoteRecordForResource } from './resources/term.view-model.interface';

interface ICoscradDate {
    // can we make this number as well?
    month: string;
    year: number;
    day: number;
}

export interface IContributionSummary {
    contributorIds: string[];
    statement: string;
    type: string;
    date: ICoscradDate;
    timestamp: number;
}

export interface IBaseViewModel extends HasId {
    name: IMultilingualText;
}

export interface IBaseResourceViewModel extends IBaseViewModel {
    /**
     * This is an array because order is the primary identity. The items are
     * immutable once pushed. Additionoal items will be appended as commands
     * succeed.
     */
    contributions: IContributionSummary[];

    /**
     * TODO We should phase out this property as we move away from the dynamic
     * command form admin UX approach.
     */
    actions: ICommandFormAndLabels[];

    // Lookup table where the keys are note IDs
    notes: Record<string, INoteRecordForResource>;
}
