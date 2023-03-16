import { useContext } from 'react';
import { ConfigurableContentContext } from '../../configurable-front-matter/configurable-content-provider';
import { useLoadableTermById } from '../../store/slices/resources';
import { displayLoadableSearchResult } from '../higher-order-components/display-loadable-search-result';
import { TermDetailFullViewPresenter } from '../resources/terms/term-detail.full-view.presenter';
import { useDate } from './use-date';

export const TermOfTheDayContainer = (): JSX.Element => {

    const { termOfTheDayConfig } = useContext(ConfigurableContentContext);

    const getCurrentTermOfTheDay = useDate();

    const termOfTheDayId = termOfTheDayConfig[getCurrentTermOfTheDay];

    const loadableTermSearchResult = useLoadableTermById(termOfTheDayId);

    const Presenter = displayLoadableSearchResult(TermDetailFullViewPresenter);

    console.log(termOfTheDayId)

    return (
        <Presenter {...loadableTermSearchResult} />
    );
}
