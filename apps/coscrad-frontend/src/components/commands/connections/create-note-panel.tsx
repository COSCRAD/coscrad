import { useState } from 'react';

export const CreateNotePanel = (): JSX.Element =>{
const [isLoading,setIsLoading] = useState(false);

return isLoading ? <Loading></Loading>
}