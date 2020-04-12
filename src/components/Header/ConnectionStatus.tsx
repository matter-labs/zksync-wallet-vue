import React from 'react';
import { useRootData } from 'src/hooks/useRootData';
import { Transition } from '../Transition/Transition';

export const ConnectionStatus = () => {
  const wsTransport = useRootData(s => s.wsTransport.get());

  return (
    <Transition trigger={wsTransport === null} timeout={200} type='opacity'>
      <div className='ws-status'>{'Websocket connection closed.'}</div>
    </Transition>
  );
};
