import { useSelector } from 'react-redux';
import { selectAuthenticatedUserId } from '../selectors';

export const useAuthenticatedUserId = () => useSelector(selectAuthenticatedUserId);
