import { WSTransport } from 'zksync/build/transport';
import { useEffect, useCallback, useState } from 'react';
import { useRootData } from './useRootData';
import { useSafeTimeout } from 'hooks/timers';

/**
 * Should be used in app root to prevent breaking WS connection
 * every time route changes
 */
export function useWSHeartBeat() {
  const [transport, setWSTransport] = useRootData(s => [
    s.wsTransport.get(),
    s.setWSTransport,
  ]);
  const setTimeout = useSafeTimeout();
  const [hbInterval, setHbInterval] = useState<number | undefined>();

  useEffect(() => {
    if (!transport) return;
    const hb = setHeartBeat(transport);

    if (process.env.NODE_ENV === 'development') {
      Object.assign(window, { transport });
    }

    return hb;
  }, [transport]);

  useEffect(
    () => () => {
      if (hbInterval) {
        clearInterval(hbInterval);
      }
    },
    [],
  );

  const tryReOpen = useCallback(() => {
    transport?.ws
      .open()
      .then(() => {
        console.log('reconnected.');
        setWSTransport(transport);
      })
      .catch(() => {
        setTimeout(tryReOpen, 1000);
      });
  }, [transport, setTimeout]);

  const setHeartBeat = useCallback(
    (
      transport: WSTransport,
      pingTimeout = 2000,
      disconnectTimeout = pingTimeout * 2,
    ) => {
      function disconnectHandler() {
        cleanup();
        // TODO: connection does not close immediately when network destroyed
        // even when calling `close` implicitly
        setWSTransport(null);
        transport.ws.close().then(() => {
          tryReOpen();
        });
      }

      window['nativeWS'] = transport.ws.ws;

      function pongListener(m) {
        // Pong received
        if (m?.error?.code === -32600) {
          clearTimeout(waitTimer);
          waitTimer = setTimeout(disconnectHandler, disconnectTimeout);
        }
      }

      function cleanup() {
        clearInterval(pingTimer);
        clearTimeout(waitTimer);
        setHbInterval(undefined);
        transport.ws.onUnpackedMessage.removeListener(pongListener);
      }

      let waitTimer = setTimeout(disconnectHandler, disconnectTimeout);
      const pingTimer = setInterval(() => {
        transport.ws.send('{}');
      }, pingTimeout);

      setHbInterval(pingTimer as any);
      transport.ws.onUnpackedMessage.addListener(pongListener);

      return cleanup;
    },
    [setHbInterval, hbInterval, setTimeout],
  );
}
