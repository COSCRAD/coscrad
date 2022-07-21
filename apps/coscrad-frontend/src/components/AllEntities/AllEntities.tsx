import { useEffect, useState } from 'react';
import { getConfig } from '../../config';
import './AllEntities.module.scss';

/* eslint-disable-next-line */
export interface AllEntitiesProps { }

type EntitiesAndDescriptions = Record<string, string>;

type ComponentState = {
  entitiesAndDescriptions: EntitiesAndDescriptions
}

export function AllEntities(props: AllEntitiesProps) {
  const [appState, setAppState] = useState<ComponentState>({
    entitiesAndDescriptions: {}
  });

  useEffect(() => {

    setAppState({ entitiesAndDescriptions: {} });

    const apiUrl = `${getConfig().apiUrl}/api/entities/`;

    fetch(apiUrl, { mode: 'cors' })
      .then((res) =>{
        const result = res.json();
        
        return result
      })
      .then((entitiesAndDescriptions) => {
        console.log({
          apiResult: entitiesAndDescriptions
        })
        setAppState({ ...appState, entitiesAndDescriptions });
      }).catch(rej => console.log(rej))
  }, [setAppState,appState]);

  if (Object.keys(appState.entitiesAndDescriptions).length === 0)
  return (
    <div>Loading...</div>
  )

  return (
    <div>
      <h1>Welcome to AllEntities!</h1>
      <div>{Object.entries(appState.entitiesAndDescriptions).map(([entityType, description]) => (<div key={entityType} data-cy-entity-type={entityType}><b>{entityType}:</b>&nbsp;{description}</div>))}</div>
    </div>
  );
}

export default AllEntities;
