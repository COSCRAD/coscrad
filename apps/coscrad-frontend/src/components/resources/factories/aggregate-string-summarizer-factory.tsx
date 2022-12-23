import {
    AggregateType,
    IBaseViewModel,
    IBibliographicReferenceViewModel,
    IMediaItemViewModel,
} from '@coscrad/api-interfaces';
import { buildBibliographicReferenceJointViewModel } from '../bibliographic-references/joint-view';
import { formatBilingualText } from '../vocabulary-lists/utils/formatBilingualText';

export type AggregateStringSummarizer<T extends IBaseViewModel> = (viewModel: T) => string;

export const aggregateStringSummarizerFactory = (
    aggregateType: AggregateType
    // TODO correlate the return type with aggregate type
): AggregateStringSummarizer<IBaseViewModel> => {
    if (aggregateType === AggregateType.bibliographicReference)
        return (viewModel: IBibliographicReferenceViewModel) => {
            const consolidateViewModel = buildBibliographicReferenceJointViewModel(viewModel);

            return consolidateViewModel.title;
        };

    if (aggregateType === AggregateType.mediaItem)
        return ({ title, titleEnglish }: IMediaItemViewModel): string =>
            formatBilingualText(title, titleEnglish);

    // TODO Support string summarizers for other aggregate types as needed

    // Fallback to simply showing the ID (common to all models)
    return (viewModel: IBaseViewModel) => viewModel.id;
};