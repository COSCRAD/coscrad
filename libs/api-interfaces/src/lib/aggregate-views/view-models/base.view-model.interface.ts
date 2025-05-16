import { ICommandFormAndLabels } from '../../commands';
import { HasId } from './has-id.interface';
import { IMultilingualText } from './resources/common';

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
    contributions: IContributionSummary[];
    actions: ICommandFormAndLabels[];
}
