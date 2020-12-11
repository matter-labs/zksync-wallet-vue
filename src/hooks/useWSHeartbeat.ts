import { WSTransport } from 'zksync/build/transport';
import { useCallback, useState } from 'react';
import { useStore } from 'src/store/context';
import { useMobxEffect } from './useMobxEffect';

const WS_HEARTBEAT_TIMEOUT = 5e3;
/**
 * Should be used in app root to prevent breaking WS connection
 * every time route changes
 */
export function useWSHeartBeat() {
  const store = useStore();
  const [refresh, setRefresh] = useState(0);

  const tryReOpen = useCallback(() => {
    const { wsTransport: transport } = store;
    if (transport?.ws?.isOpened) return;
    transport?.ws
      .open()
      .then(() => {
        store.wsTransport = transport;
        setRefresh(s => s + 1);
      })
      .catch(() => {
        setTimeout(tryReOpen, 1000);
      });
  }, [store]);

  const setHeartBeat = useCallback(
    (
      transport: WSTransport,
      pingTimeout = WS_HEARTBEAT_TIMEOUT,
      disconnectTimeout = WS_HEARTBEAT_TIMEOUT * 2,
    ) => {
      function disconnectHandler() {
        cleanup();
        // store.wsTransport = null;
        store.wsBroken = true;
        transport.ws.close().then(() => {
          tryReOpen();
        });
      }

      window['nativeWS'] = transport.ws.ws;

      function pongListener(m) {
        // Pong received
        if (m?.error?.code === -32600) {
          if (store.wsBroken) {
            store.wsBroken = false;
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
        if (!store.zkWallet) {
          cleanup();
        }
        transport.ws.send('{}');
      }, pingTimeout);

      transport.ws.onUnpackedMessage.addListener(pongListener);

      return cleanup;
    },
    [tryReOpen, store],
  );

  useMobxEffect(() => {
    if (!store.wsTransport) return;
    return setHeartBeat(store.wsTransport);
  }, [setHeartBeat, refresh]);
}
