import './Apps.module.css';
import { AppsDetail } from './AppsDetail';

/* eslint-disable-next-line */
export interface AppsProps {}

export function Apps(props: AppsProps) {
    return (
        <div className="pages">
            <div id="heading">
                <div id="container">
                    <div id="pageTitle">
                        <h1 style={{ margin: 0 }}>Apps</h1>
                    </div>
                </div>
            </div>

            <AppsDetail />
        </div>
    );
}

export default Apps;
