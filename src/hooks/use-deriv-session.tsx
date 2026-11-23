import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AppState, Linking, Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

import {
  subscribeToDerivMarket,
  type MarketFeedStatus,
} from '@/services/deriv-market-feed';
import {
  getOverlayBotState,
  hasOverlayPermission,
  setOverlayBotState,
  startOverlay,
  stopOverlay,
  subscribeToOverlayToggle,
} from '@/services/overlay';

type BotConfiguration = {
  market: string;
  tradeType: string;
  riskAmount: number;
  takeProfit: number;
};

type DerivSession = {
  isConnected: boolean;
  isConfigured: boolean;
  isRunning: boolean;
  accountBalance: number;
  market: string;
  tradeType: string;
  riskAmount: number;
  takeProfit: number;
  marketPrice: number | null;
  marketFeedStatus: MarketFeedStatus;
  marketFeedError: string | null;
  connectAccount: (method: 'oauth' | 'token', token?: string) => Promise<void>;
  disconnectAccount: () => void;
  configureBot: (configuration: BotConfiguration) => void;
  toggleBot: () => Promise<void>;
};

const DerivSessionContext = createContext<DerivSession | null>(null);

export function DerivSessionProvider({ children }: PropsWithChildren) {
  const [isConnected, setConnected] = useState(false);
  const [isConfigured, setConfigured] = useState(false);
  const [isRunning, setRunning] = useState(false);
  const [market, setMarket] = useState('Volatility 75 (1s) Index');
  const [marketPrice, setMarketPrice] = useState<number | null>(null);
  const [marketFeedStatus, setMarketFeedStatus] = useState<MarketFeedStatus>('connecting');
  const [marketFeedError, setMarketFeedError] = useState<string | null>(null);
  const [tradeType, setTradeType] = useState('Over/Under');
  const [riskAmount, setRiskAmount] = useState(10);
  const [takeProfit, setTakeProfit] = useState(20);

  // Check internet connection status
  const checkInternetConnection = async (): Promise<boolean> => {
    const netState = await NetInfo.fetch();
    return netState.isConnected ?? false;
  };

  useEffect(() => {
    return subscribeToDerivMarket(market, (update) => {
      setMarketFeedStatus(update.status);
      setMarketPrice(update.status === 'live' ? update.quote ?? null : null);
      setMarketFeedError(update.message ?? null);
    });
  }, [market]);

  const toggleBot = useCallback(async () => {
    const online = await checkInternetConnection();
    if (!online) {
      throw new Error('No internet connection. Derivo requires an active internet connection to trade.');
    }

    const shouldRun = !isRunning;
    if (shouldRun && Platform.OS === 'android') {
      if (!(await hasOverlayPermission())) {
        throw new Error('Allow Derivo to display over other apps before starting the trading bot.');
      }
      setOverlayBotState(true);
      try {
        await startOverlay();
      } catch (error) {
        setOverlayBotState(false);
        throw error;
      }
    } else if (!shouldRun) {
      setOverlayBotState(false);
      stopOverlay();
    }
    setRunning(shouldRun);
  }, [isRunning]);

  useEffect(() => {
    const subscription = subscribeToOverlayToggle(() => {
      void toggleBot().catch((error: unknown) => {
        console.error('[OVERLAY] Could not toggle the trading bot from the floating control', error);
      });
    });
    return () => subscription?.remove();
  }, [toggleBot]);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      void getOverlayBotState()
        .then(setRunning)
        .catch((error: unknown) => {
          console.error('[OVERLAY] Could not restore floating bot state', error);
        });
    });
    return () => subscription.remove();
  }, []);

  const connectAccount = async (method: 'oauth' | 'token', token?: string) => {
    const online = await checkInternetConnection();
    if (!online) {
      throw new Error('No internet connection. Please check your network connection to connect your Deriv account.');
    }

    if (method === 'oauth') {
      const appId = process.env.EXPO_PUBLIC_DERIV_APP_ID || '1089';
      const oauthUrl = `https://oauth.deriv.com/oauth2/authorize?app_id=${appId}&l=EN`;
      const supported = await Linking.canOpenURL(oauthUrl);
      if (supported) {
        await Linking.openURL(oauthUrl);
      } else {
        throw new Error('Unable to open Deriv OAuth authorization URL.');
      }
    } else {
      if (!token || token.trim().length < 5) {
        throw new Error('Please enter a valid Deriv API token.');
      }
    }
    setConnected(true);
  };

  const value = useMemo<DerivSession>(
    () => ({
      isConnected,
      isConfigured,
      isRunning,
      accountBalance: 10000,
      market,
      tradeType,
      riskAmount,
      takeProfit,
      marketPrice,
      marketFeedStatus,
      marketFeedError,
      connectAccount,
      disconnectAccount: () => {
        setRunning(false);
        setConfigured(false);
        setConnected(false);
        setOverlayBotState(false);
        stopOverlay();
      },
      configureBot: (configuration) => {
        setMarket(configuration.market);
        setTradeType(configuration.tradeType);
        setRiskAmount(configuration.riskAmount);
        setTakeProfit(configuration.takeProfit);
        setConfigured(true);
      },
      toggleBot,
    }),
    [
      connectAccount,
      isConnected,
      isConfigured,
      isRunning,
      market,
      marketFeedError,
      marketFeedStatus,
      marketPrice,
      riskAmount,
      takeProfit,
      toggleBot,
      tradeType,
    ],
  );

  return <DerivSessionContext.Provider value={value}>{children}</DerivSessionContext.Provider>;
}

export function useDerivSession() {
  const session = useContext(DerivSessionContext);
  if (!session) {
    throw new Error('useDerivSession must be used within DerivSessionProvider');
  }
  return session;
}
