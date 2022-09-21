import { AppInfoDisplay } from './AppInfoDisplay';
import AppInfo from './data/AppInfo';

export interface AppsDisplayProps {
    appInfos: AppInfo[];
}

export function AppsDisplay({ appInfos }: AppsDisplayProps) {
    const listItems = appInfos.map((appInfo ,index) => <AppInfoDisplay {...appInfo} key={index.toString()} />);

    return <div>{listItems}</div>;
}
