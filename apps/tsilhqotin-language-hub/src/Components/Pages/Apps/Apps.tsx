import ScrollToTop from '../../Widgets/ScrollButton/ScrollToTop';
import { AppsDisplay } from './AppsDisplay';
import getAppInfos from './data/getAppInfos';

const appInfosReadResult = getAppInfos();

export function Apps() {
    if (appInfosReadResult instanceof Error)
        return (
            <div>
                <h1>Error Boundary</h1>
                <p>
                    The application has encountered the following error:
                    {appInfosReadResult.message}
                </p>
            </div>
        );

    return (
        <div style={{ paddingBottom: '30px' }} className="pages">
            <ScrollToTop />
            <div id="heading">
                <div id="container">
                    <div id="pageTitle">
                        <h1>Apps</h1>
                    </div>
                </div>
            </div>

            <AppsDisplay appInfos={appInfosReadResult} />
        </div>
    );
}

export default Apps;
