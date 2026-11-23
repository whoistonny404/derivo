export type MarketFeedStatus = 'connecting' | 'live' | 'error';

export type MarketFeedUpdate = {
  status: MarketFeedStatus;
  quote?: number;
  message?: string;
};

const APP_ID = process.env.EXPO_PUBLIC_DERIV_APP_ID || '1089';
const SOCKET_URL = `wss://ws.derivws.com/websockets/v3?app_id=${encodeURIComponent(APP_ID)}`;
const RECONNECT_DELAY_MS = 3000;
const MAX_RECONNECT_DELAY_MS = 30000;

export function subscribeToDerivMarket(
  marketName: string,
  onUpdate: (update: MarketFeedUpdate) => void,
) {
  let socket: WebSocket | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let reconnectDelay = RECONNECT_DELAY_MS;
  let isClosed = false;

  const scheduleReconnect = () => {
    if (isClosed || reconnectTimer) return;
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      connect();
    }, reconnectDelay);
    reconnectDelay = Math.min(reconnectDelay * 2, MAX_RECONNECT_DELAY_MS);
  };

  const connect = () => {
    if (isClosed) return;
    onUpdate({ status: 'connecting' });

    try {
      const currentSocket = new WebSocket(SOCKET_URL);
      socket = currentSocket;

      currentSocket.onopen = () => {
        if (socket !== currentSocket) return;
        currentSocket.send(JSON.stringify({
          active_symbols: 'brief',
          product_type: 'basic',
          req_id: 1,
        }));
      };

      currentSocket.onmessage = (event) => {
        if (socket !== currentSocket) return;
        if (typeof event.data !== 'string') {
          onUpdate({ status: 'error', message: 'Deriv returned an unsupported market-data response.' });
          return;
        }

        let response: {
          active_symbols?: { display_name?: string; symbol?: string }[];
          error?: { message?: string };
          tick?: { quote?: number | string };
        };
        try {
          response = JSON.parse(event.data) as typeof response;
        } catch (error) {
          console.error('[DERIV MARKET] Could not parse market-data response', error);
          onUpdate({ status: 'error', message: 'Deriv returned an unreadable market-data response.' });
          return;
        }

        if (response.error) {
          const message = response.error.message || 'Deriv could not provide market data.';
          onUpdate({ status: 'error', message });
          return;
        }

        if (response.active_symbols) {
          const selectedSymbol = response.active_symbols.find(
            (item) => item.display_name === marketName,
          )?.symbol;
          if (!selectedSymbol) {
            onUpdate({ status: 'error', message: `${marketName} is not available from Deriv right now.` });
            return;
          }
          currentSocket.send(JSON.stringify({
            ticks: selectedSymbol,
            subscribe: 1,
            req_id: 2,
          }));
          return;
        }

        if (response.tick) {
          const quote = Number(response.tick.quote);
          if (!Number.isFinite(quote)) {
            onUpdate({ status: 'error', message: 'Deriv returned an invalid market price.' });
            return;
          }
          reconnectDelay = RECONNECT_DELAY_MS;
          onUpdate({ status: 'live', quote });
        }
      };

      currentSocket.onerror = () => {
        if (socket !== currentSocket) return;
        onUpdate({
          status: 'error',
          message: 'Unable to reach Deriv. Check your internet connection and try again.',
        });
      };

      currentSocket.onclose = () => {
        if (socket !== currentSocket) return;
        socket = null;
        onUpdate({
          status: 'error',
          message: 'Deriv market-data connection closed. Reconnecting...',
        });
        scheduleReconnect();
      };
    } catch (error) {
      console.error('[DERIV MARKET] Could not open market-data connection', error);
      onUpdate({
        status: 'error',
        message: 'Unable to open the Deriv market-data connection.',
      });
      scheduleReconnect();
    }
  };

  connect();

  return () => {
    isClosed = true;
    if (reconnectTimer) clearTimeout(reconnectTimer);
    reconnectTimer = null;
    const currentSocket = socket;
    socket = null;
    if (currentSocket) {
      currentSocket.onclose = null;
      currentSocket.close();
    }
  };
}
