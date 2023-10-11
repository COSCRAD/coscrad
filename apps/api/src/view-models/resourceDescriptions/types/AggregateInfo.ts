import { IAggregateInfo } from '@coscrad/api-interfaces';
import { AggregateTypesWhoseViewsAreSourcedFromSnapshots } from '../../buildViewModelForResource/viewModels/utilities/ViewModelCtorFromResourceType';

export type AggregateInfo = IAggregateInfo<AggregateTypesWhoseViewsAreSourcedFromSnapshots>;
