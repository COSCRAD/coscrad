import { isAggregateType } from '@coscrad/api-interfaces';
import { Outlet } from 'react-router-dom';
import { Footer } from '../components/footer/footer';
import { Header } from '../components/header/header';
import { getConfig } from '../config';
import { fetchFreshState } from '../store/slices/utils/fetch-fresh-state';
import { CoscradLayoutContainer } from './coscrad-layout-container';
import { useAppDispatch } from './hooks';

export function App() {
    const dispatch = useAppDispatch();

    const eventSource = new EventSource(`${getConfig().apiUrl}/commands/notifications`);

    eventSource.onmessage = (result) => {
        /**
         * TODO Move the following somewhere else. `store`?
         *
         */
        const message = JSON.parse(result.data);

        const aggregateTypeFromMessage = message.aggregateCompositeIdentifier?.type;

        if (isAggregateType(aggregateTypeFromMessage))
            fetchFreshState(dispatch, aggregateTypeFromMessage);
    };

    return (
        <>
            <Header />
            <CoscradLayoutContainer>
                <Outlet />
            </CoscradLayoutContainer>
            <Footer />
        </>
    );
}

export default App;
