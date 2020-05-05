import { WSTransport } from 'zksync/build/transport';
import { useEffect, useCallback } from 'react';
import { useRootData } from './useRootData';

const WS_HEARTBEAT_TIMEOUT = 5e3;
/**
 * Should be used in app root to prevent breaking WS connection
 * every time route changes
 */
export function useWSHeartBeat() {
  const {
    wsTransport: transport,
    wsBroken,
    setWSTransport,
    setWsStatus,
  } = useRootData(s => ({
    ...s,
    wsTransport: s.wsTransport.get(),
    wsBroken: s.wsBroken.get(),
  }));

  const tryReOpen = useCallback(() => {
    if (transport?.ws?.isOpened) return;
    transport?.ws
      .open()
      .then(() => {
        setWSTransport(transport);
      })
      .catch(() => {
        setTimeout(tryReOpen, 1000);
      });
  }, [transport, setWSTransport]);

  const setHeartBeat = useCallback(
    (
      transport: WSTransport,
      pingTimeout = WS_HEARTBEAT_TIMEOUT,
      disconnectTimeout = WS_HEARTBEAT_TIMEOUT * 2,
    ) => {
      function disconnectHandler() {
        cleanup();
        setWSTransport(null);
        setWsStatus(true);
        transport.ws.close().then(() => {
          tryReOpen();
        });
      }

      window['nativeWS'] = transport.ws.ws;

      function pongListener(m) {
        // Pong received
        if (m?.error?.code === -32600) {
          if (wsBroken) {
            setWsStatus(false);
          }
          clearTimeout(waitTimer);
          waitTimer = setTimeout(disconnectHandler, disconnectTimeout);
        }
      }

      function cleanup() {
        clearInterval(pingTimer);
        clearTimeout(waitTimer);
        clearInterval(pingTimer);
        transport.ws.onUnpackedMessage.removeListener(pongListener);
      }

      let waitTimer = setTimeout(disconnectHandler, disconnectTimeout);
      const pingTimer = setInterval(() => {
        transport.ws.send('{}');
      }, pingTimeout);

      transport.ws.onUnpackedMessage.addListener(pongListener);

      return cleanup;
    },
    [setWsStatus, setWSTransport, tryReOpen, wsBroken],
  );

  useEffect(() => {
    if (!transport) return;
    const hb = setHeartBeat(transport);

    return hb;
  }, [transport, setHeartBeat]);
}
