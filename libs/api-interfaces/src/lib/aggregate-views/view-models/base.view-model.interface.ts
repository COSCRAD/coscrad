import { ICommandFormAndLabels } from '../../commands';
import { HasId } from './has-id.interface';
import {
    IMultilingualTextRecord,
    INoteRecordForResource,
} from './resources/term.view-model.interface';

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
    name: IMultilingualTextRecord;
}

export interface IBaseResourceViewModel extends IBaseViewModel {
    contributions: IContributionSummary[];

    actions: ICommandFormAndLabels[];

    // Lookup table where the keys are note IDs
    notes: Record<string, INoteRecordForResource>;
}
