import { WSTransport } from 'zksync/build/transport';
import { useEffect, useCallback } from 'react';
import { useRootData } from './useRootData';

const WS_HEARTBEAT_TIMEOUT = 5e3;
/**
 * Should be used in app root to prevent breaking WS connection
 * every time route changes
 */
export function useWSHeartBeat() {
  const { wsTransport: transport, setWSTransport, setWsStatus } = useRootData(
    s => ({
      ...s,
      wsTransport: s.wsTransport.get(),
    }),
  );

  const tryReOpen = useCallback(() => {
    if (transport?.ws?.isOpened) return;
    transport?.ws
      .open()
      .then(() => {
        setWSTransport(transport);
        setWsStatus(false);
      })
      .catch(() => {
        setTimeout(tryReOpen, 1000);
      });
  }, [transport, setWSTransport, setWsStatus]);

  const setHeartBeat = useCallback(
    (
      transport: WSTransport,
      pingTimeout = WS_HEARTBEAT_TIMEOUT,
      disconnectTimeout = WS_HEARTBEAT_TIMEOUT * 2,
    ) => {
      function disconnectHandler() {
        cleanup();
        // TODO: connection does not close immediately when network destroyed
        // even when calling `close` implicitly
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
    [setWsStatus, setWSTransport, tryReOpen],
  );

  useEffect(() => {
    if (!transport) return;
    const hb = setHeartBeat(transport);

    return hb;
  }, [transport, setHeartBeat]);
}
