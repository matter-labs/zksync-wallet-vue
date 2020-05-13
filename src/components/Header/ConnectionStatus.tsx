import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';

import { useStore } from 'src/store/context';

import { Transition } from '../Transition/Transition';

import { useMobxEffect } from 'src/hooks/useMobxEffect';
import { useTimeout } from 'src/hooks/timers';
import { usePrevious } from 'src/hooks/usePreviousValue';

enum ConnStatus {
  DISCONNECTED,
  RECONNECTED,
  CONNECTED,
}

export const ConnectionStatus = observer(() => {
  const store = useStore();
  const { wsBroken } = store;
  const [status, setStatus] = useState<ConnStatus>(ConnStatus.CONNECTED);
  const hadBroken = usePrevious(wsBroken);

  useMobxEffect(() => {
    if (!hadBroken && wsBroken) {
      setStatus(ConnStatus.DISCONNECTED);
    } else if (hadBroken && !wsBroken) {
      setStatus(ConnStatus.RECONNECTED);
    }
  }, [wsBroken, hadBroken]);

  useTimeout(
    () => {
      if (status === ConnStatus.RECONNECTED) {
        setStatus(ConnStatus.CONNECTED);
      }
    },
    1e3,
    [setStatus, status],
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
});
