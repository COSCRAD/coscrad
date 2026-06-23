import { useSelector } from 'react-redux';
import { selectLoadableCommandStatus } from '../selectors';

export const useLoadableCommandResult = () => useSelector(selectLoadableCommandStatus);
