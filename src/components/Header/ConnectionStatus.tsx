import React, { useState, useEffect } from 'react';
import { useRootData } from 'src/hooks/useRootData';
import { Transition } from '../Transition/Transition';
import { useTimeout } from 'src/hooks/timers';

enum ConnStatus {
  DISCONNECTED,
  RECONNECTED,
  CONNECTED,
}

export const ConnectionStatus = () => {
  const wsTransport = useRootData(s => s.wsTransport.get());
  const [status, setStatus] = useState<ConnStatus>(ConnStatus.RECONNECTED);

  useEffect(() => {
    if (status === ConnStatus.RECONNECTED) {
      setStatus(ConnStatus.CONNECTED);
      return;
    }
    setStatus(wsTransport ? ConnStatus.RECONNECTED : ConnStatus.DISCONNECTED);
  }, [wsTransport]);

  useTimeout(
    () => {
      if (wsTransport !== null && status === ConnStatus.RECONNECTED) {
        setStatus(ConnStatus.CONNECTED);
      }
    },
    1e3,
    [wsTransport, status],
  );

  return (
    <Transition
      trigger={[ConnStatus.RECONNECTED, ConnStatus.DISCONNECTED].includes(
        status,
      )}
      timeout={200}
      type='opacity'
    >
      {status === ConnStatus.DISCONNECTED ? (
        <div className='ws-status__disconnected'>
          {'Websocket connection closed.'}
        </div>
      ) : (
        <div className='ws-status__reconnected'>{'Websocket connected'}</div>
      )}
    </Transition>
  );
};
