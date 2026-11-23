import { useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DerivoIcon } from '@/components/derivo-icon';
import { FeedbackBottomSheet } from '@/components/feedback-bottom-sheet';
import { DerivoHeader } from '@/components/derivo-header';
import { colors } from '@/constants/derivo-theme';
import { useDerivSession } from '@/hooks/use-deriv-session';
import { useLocalRefresh } from '@/hooks/use-local-refresh';
import { openOverlayPermissionSettings } from '@/services/overlay';

const markets = [
  'Volatility 75 (1s) Index',
  'Volatility 100 Index',
  'Volatility 90 (1s) Index',
  'Volatility 25 (1s) Index',
  'Volatility 100 (1s) Index',
  'Volatility 30 (1s) Index',
  'Volatility 10 (1s) Index',
  'Volatility 50 Index',
  'Volatility 15 (1s) Index',
  'Volatility 10 Index',
  'Volatility 75 Index',
  'Volatility 25 Index',
  'Volatility 50 (1s) Index',
];

const tradeTypes = ['Over/Under', 'Even/Odd', 'Matches/Differs'];

export default function HomeScreen() {
  const {
    isConnected,
    isConfigured,
    isRunning,
    accountBalance,
    market,
    marketPrice,
    marketFeedStatus,
    marketFeedError,
    tradeType,
    riskAmount,
    takeProfit,
    connectAccount,
    configureBot,
    toggleBot,
  } = useDerivSession();
  const [inputMarket, setInputMarket] = useState(markets[0]);
  const [inputTradeType, setInputTradeType] = useState(tradeTypes[0]);
  const [inputRisk, setInputRisk] = useState('10');
  const [inputTakeProfit, setInputTakeProfit] = useState('20');
  const [apiTokenInput, setApiTokenInput] = useState('');
  const [showApiTokenInput, setShowApiTokenInput] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showMarketDropdown, setShowMarketDropdown] = useState(false);
  const [showTradeTypeDropdown, setShowTradeTypeDropdown] = useState(false);
  const [feedback, setFeedback] = useState({ title: '', message: '', actionLabel: 'GOT IT' });
  const [showFeedback, setShowFeedback] = useState(false);
  const { refreshing, refresh } = useLocalRefresh();

  const showMessage = (title: string, message: string, actionLabel = 'GOT IT') => {
    setFeedback({ title, message, actionLabel });
    setShowFeedback(true);
  };

  const openConfig = () => {
    setInputMarket(market);
    setInputTradeType(tradeType);
    setInputRisk(String(riskAmount));
    setInputTakeProfit(String(takeProfit));
    setShowConfigModal(true);
  };

  const saveConfig = () => {
    const risk = Number(inputRisk);
    const target = Number(inputTakeProfit);
    if (!Number.isFinite(risk) || risk <= 0) {
      showMessage('Invalid risk amount', 'Enter a risk amount greater than zero.');
      return;
    }
    if (!Number.isFinite(target) || target <= 0) {
      showMessage('Invalid take profit', 'Enter a take-profit amount greater than zero.');
      return;
    }
    if (risk > accountBalance) {
      showMessage('Risk exceeds demo balance', 'Risk must be less than or equal to your demo balance.');
      return;
    }
    configureBot({
      market: inputMarket,
      tradeType: inputTradeType,
      riskAmount: risk,
      takeProfit: target,
    });
    setShowConfigModal(false);
  };

  const handleOAuthConnect = async () => {
    try {
      await connectAccount('oauth');
      setShowConnectModal(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not connect via OAuth.';
      showMessage('Connection Error', message);
    }
  };

  const handleTokenConnect = async () => {
    try {
      await connectAccount('token', apiTokenInput);
      setShowConnectModal(false);
      setApiTokenInput('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not connect with API token.';
      showMessage('Connection Error', message);
    }
  };

  const closeConnectModal = () => {
    setShowConnectModal(false);
  };

  const handleWhatsApp = async () => {
    try {
      await Linking.openURL('https://wa.me/254704182603');
    } catch (error) {
      console.error('[SUPPORT] Could not open WhatsApp', error);
      showMessage('Unable to open WhatsApp', 'Please contact support by phone at 0704182603.');
    }
  };

  const handleCall = async () => {
    try {
      await Linking.openURL('tel:0704182603');
    } catch (error) {
      console.error('[SUPPORT] Could not start phone call', error);
      showMessage('Unable to place call', 'Please call support at 0704182603.');
    }
  };

  const handleToggleBot = async () => {
    try {
      await toggleBot();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not start the demo bot.';
      if (message.includes('display over other apps')) {
        setFeedback({
          title: 'Floating window permission required',
          message: 'Allow Derivo to display over other apps so its floating control can stay visible while you use other apps.',
          actionLabel: 'OPEN SETTINGS',
        });
        setShowFeedback(true);
        return;
      }
      console.error('[BOT] Could not toggle the demo bot', error);
      showMessage('Could not start demo bot', message);
    }
  };

  const handleFeedbackAction = () => {
    if (feedback.actionLabel === 'OPEN SETTINGS') {
      void openOverlayPermissionSettings().catch((error: unknown) => {
        console.error('[OVERLAY] Could not open permission settings', error);
        showMessage('Unable to open settings', 'Open Android Settings, find Derivo, and allow “Display over other apps”.');
      });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <DerivoHeader />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            onRefresh={refresh}
            refreshing={refreshing}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }>
        <View style={styles.body}>
          <View style={styles.screenIntro}>
            <View>
              <Text style={styles.screenTitle}>Dashboard</Text>
              <Text style={styles.screenSubtitle}>Your trading at a glance</Text>
            </View>
            <View style={styles.sessionPill}>
              <View style={styles.sessionDot} />
              <Text style={styles.sessionPillText}>DERIV MARKETS</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <View>
                <Text style={styles.infoEyebrow}>MARKET OVERVIEW</Text>
                <Text style={styles.infoTitle}>Market overview</Text>
              </View>
              <View style={styles.marketBadge}>
                <View style={styles.marketDot} />
                <Text style={styles.marketBadgeText}>DEMO</Text>
              </View>
            </View>

            <Text style={styles.descriptionText}>
              Review live public Deriv market data before managing your demo automation.
            </Text>

            <View style={styles.livePriceRow}>
              <View>
                <Text style={styles.livePriceLabel}>{market.toUpperCase()}</Text>
                <Text style={styles.sessionText}>Deriv synthetic index · Public feed</Text>
              </View>
              <View style={styles.priceColumn}>
                <Text style={styles.livePriceText}>
                  {marketPrice === null
                    ? '—'
                    : marketPrice.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 4,
                      })}
                </Text>
                <Text style={styles.waitingText}>
                  {marketFeedStatus === 'live'
                    ? 'LIVE DERIV TICK'
                    : marketFeedStatus === 'connecting'
                      ? 'CONNECTING TO DERIV'
                      : 'LIVE FEED UNAVAILABLE'}
                </Text>
              </View>
            </View>
            {marketFeedError && (
              <Text style={styles.marketFeedError}>{marketFeedError}</Text>
            )}

            <View style={styles.cautionRow}>
              <DerivoIcon name="warning" size={16} color={colors.warning} />
              <Text style={styles.cautionText}>
                Trading carries risk. The bot does not guarantee profits. Only risk what you can afford to lose.
              </Text>
            </View>

            {isConnected && (
              <Text style={styles.minBalanceText}>Account Balance: ${accountBalance.toFixed(2)}</Text>
            )}
          </View>

          <View style={styles.actionContainer}>
            {!isConnected ? (
              <>
                <Pressable
                  onPress={() => setShowConnectModal(true)}
                  style={styles.primaryButton}>
                  <View style={styles.primaryButtonInner}>
                    <Text style={styles.primaryButtonText}>CONNECT YOUR DERIV ACCOUNT</Text>
                  </View>
                </Pressable>
                <Pressable onPress={() => setShowSupportModal(true)} style={styles.supportButton}>
                  <DerivoIcon name="headset" size={20} color={colors.accent} />
                  <Text style={styles.supportButtonText}>Contact Support</Text>
                </Pressable>
              </>
            ) : !isConfigured ? (
              <>
                <View style={styles.balanceRow}>
                  <Text style={styles.balanceLabel}>Account Balance</Text>
                  <Text style={styles.balanceValue}>${accountBalance.toFixed(2)}</Text>
                </View>
                <Pressable onPress={openConfig} style={styles.configureButton}>
                  <DerivoIcon name="settings" size={19} color={colors.accent} />
                  <Text style={styles.configureButtonText}>CONFIGURE BOT</Text>
                </Pressable>
              </>
            ) : (
              <>
                <View style={styles.balanceRow}>
                  <Text style={styles.balanceLabel}>Account Balance</Text>
                  <Text style={styles.balanceValue}>${accountBalance.toFixed(2)}</Text>
                </View>

                <View style={styles.configSummary}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Market</Text>
                    <Text style={styles.summaryValue}>{market}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Trade type</Text>
                    <Text style={styles.summaryValue}>{tradeType}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Amount to risk</Text>
                    <Text style={styles.summaryValue}>${Number(riskAmount).toFixed(2)}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Take profit</Text>
                    <Text style={styles.summaryValue}>${takeProfit.toFixed(2)}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Status</Text>
                    <Text style={[styles.summaryValue, { color: isRunning ? colors.success : colors.warning }]}>
                      {isRunning ? 'ACTIVE · LIVE' : 'READY'}
                    </Text>
                  </View>
                </View>

                {!isRunning && (
                  <Pressable onPress={openConfig} style={styles.editConfigButton}>
                    <DerivoIcon name="edit" size={15} color={colors.accent} />
                    <Text style={styles.editConfigText}>Edit Config</Text>
                  </Pressable>
                )}

                <View style={styles.playPauseContainer}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => void handleToggleBot()}
                    style={styles.playPauseOuter}>
                    <View style={[styles.playPauseInner, isRunning && styles.pauseButton]}>
                      <DerivoIcon name={isRunning ? 'pause' : 'play'} size={34} color="#FFFFFF" />
                    </View>
                  </Pressable>
                  <Text style={styles.playPauseText}>
                    {isRunning ? 'PAUSE TRADING BOT' : 'START TRADING BOT'}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        onRequestClose={closeConnectModal}
        transparent
        visible={showConnectModal}
        statusBarTranslucent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
          style={styles.bottomSheetDim}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.bottomSheetContent}>
              <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Connect Your Deriv Account</Text>
                  <Pressable accessibilityLabel="Close" onPress={closeConnectModal}>
                    <DerivoIcon name="close" size={22} color={colors.textSecondary} />
                  </Pressable>
                </View>
                <Text style={styles.connectionDescription}>
                  Authorize your Deriv account securely using OAuth or by pasting your API token.
                </Text>

                <Pressable onPress={handleOAuthConnect} style={styles.submitButton}>
                  <Text style={styles.submitButtonText}>CONNECT VIA DERIV OAUTH</Text>
                </Pressable>

                <View style={{ marginVertical: 14, alignItems: 'center' }}>
                  <Text style={{ color: colors.textSecondary, fontSize: 13 }}>— OR —</Text>
                </View>

                <Text style={styles.inputLabel}>DERIV API TOKEN</Text>
                <TextInput
                  secureTextEntry
                  placeholder="Paste your Deriv API token here"
                  placeholderTextColor={colors.textSecondary}
                  onChangeText={setApiTokenInput}
                  style={styles.inputLarge}
                  value={apiTokenInput}
                />

                <Pressable onPress={handleTokenConnect} style={[styles.submitButton, { backgroundColor: colors.cardAlt, borderWidth: 1, borderColor: colors.accent, marginTop: 10 }]}>
                  <Text style={[styles.submitButtonText, { color: colors.accent }]}>AUTHORIZE WITH API TOKEN</Text>
                </Pressable>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        animationType="slide"
        onRequestClose={() => setShowSupportModal(false)}
        transparent
        visible={showSupportModal}
        statusBarTranslucent>
        <View style={styles.bottomSheetDim}>
          <Pressable
            accessibilityLabel="Dismiss support"
            onPress={() => setShowSupportModal(false)}
            style={StyleSheet.absoluteFill}
          />
            <View style={styles.supportModalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Need Help?</Text>
                <Pressable
                  accessibilityLabel="Close support"
                  onPress={() => setShowSupportModal(false)}>
                  <DerivoIcon name="close" size={22} color={colors.textSecondary} />
                </Pressable>
              </View>
              <Text style={styles.supportSubtitle}>
                Our support team is ready to assist you with your account, connection, or trading bot.
              </Text>
              <Pressable onPress={handleWhatsApp} style={styles.supportOptionButton}>
                <DerivoIcon name="whatsapp" size={22} color="#25D366" />
                <Text style={styles.supportOptionText}>Chat on WhatsApp</Text>
              </Pressable>
              <Pressable onPress={handleCall} style={styles.supportOptionButton}>
                <DerivoIcon name="phone" size={21} color={colors.accent} />
                <Text style={styles.supportOptionText}>Call Support</Text>
              </Pressable>
            </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        onRequestClose={() => setShowConfigModal(false)}
        transparent
        visible={showConfigModal}>
        <KeyboardAvoidingView
          behavior="padding"
          style={styles.bottomSheetDim}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.configSheetContent}>
              <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Bot Configuration</Text>
                  <Pressable onPress={() => setShowConfigModal(false)}>
                    <DerivoIcon name="close" size={22} color={colors.textSecondary} />
                  </Pressable>
                </View>

                <Text style={styles.inputLabel}>SELECT MARKET</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Select market"
                  onPress={() => {
                    setShowMarketDropdown(!showMarketDropdown);
                    setShowTradeTypeDropdown(false);
                  }}
                  style={styles.selectInput}>
                  <Text style={styles.selectText}>{inputMarket}</Text>
                  <DerivoIcon
                    name={showMarketDropdown ? 'chevron-up' : 'chevron-down'}
                    size={19}
                    color={colors.textSecondary}
                  />
                </Pressable>
                {showMarketDropdown && (
                  <View style={styles.inlineDropdownList}>
                    {markets.map((item) => (
                      <Pressable
                        key={item}
                        onPress={() => {
                          setInputMarket(item);
                          setShowMarketDropdown(false);
                        }}
                        style={styles.dropdownItem}>
                        <Text style={styles.dropdownItemText}>{item}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}

                <Text style={styles.inputLabel}>SELECT TRADE TYPE</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Select trade type"
                  onPress={() => {
                    setShowTradeTypeDropdown(!showTradeTypeDropdown);
                    setShowMarketDropdown(false);
                  }}
                  style={styles.selectInput}>
                  <Text style={styles.selectText}>{inputTradeType}</Text>
                  <DerivoIcon
                    name={showTradeTypeDropdown ? 'chevron-up' : 'chevron-down'}
                    size={19}
                    color={colors.textSecondary}
                  />
                </Pressable>
                {showTradeTypeDropdown && (
                  <View style={styles.inlineDropdownList}>
                    {tradeTypes.map((item) => (
                      <Pressable
                        key={item}
                        onPress={() => {
                          setInputTradeType(item);
                          setShowTradeTypeDropdown(false);
                        }}
                        style={styles.dropdownItem}>
                        <Text style={styles.dropdownItemText}>{item}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}

                <Text style={styles.inputLabel}>AMOUNT TO RISK ($)</Text>
                <TextInput
                  keyboardType="decimal-pad"
                  onChangeText={setInputRisk}
                  style={styles.inputLarge}
                  value={inputRisk}
                />
                <Text style={styles.inputLabel}>TAKE PROFIT ($)</Text>
                <TextInput
                  keyboardType="decimal-pad"
                  onChangeText={setInputTakeProfit}
                  style={styles.inputLarge}
                  value={inputTakeProfit}
                />
                <Pressable onPress={saveConfig} style={styles.submitButton}>
                  <Text style={styles.submitButtonText}>SAVE CONFIG</Text>
                </Pressable>
                <Text style={styles.configNote}>Configuration applies to this demo session only.</Text>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
      <FeedbackBottomSheet
        actionLabel={feedback.actionLabel}
        message={feedback.message}
        onAction={handleFeedbackAction}
        onClose={() => setShowFeedback(false)}
        title={feedback.title}
        visible={showFeedback}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, paddingBottom: 120 },
  body: { flex: 1, paddingHorizontal: 20, paddingTop: 8 },
  screenIntro: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  screenTitle: { color: colors.textPrimary, fontSize: 22, fontWeight: '800', letterSpacing: -0.4 },
  screenSubtitle: { color: colors.textSecondary, fontSize: 12, marginTop: 3 },
  sessionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sessionDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent, marginRight: 6 },
  sessionPillText: { color: colors.textSecondary, fontSize: 8, fontWeight: '800', letterSpacing: 0.5 },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
    elevation: 3,
  },
  infoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  infoEyebrow: { color: colors.accent, fontSize: 9, fontWeight: '800', letterSpacing: 1.5, marginBottom: 4 },
  infoTitle: { color: colors.textPrimary, fontSize: 17, fontWeight: '800' },
  marketBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  marketDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.textSecondary, marginRight: 6 },
  marketBadgeText: { color: colors.textSecondary, fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
  descriptionText: { color: colors.textSecondary, fontSize: 12, lineHeight: 18, marginBottom: 14 },
  livePriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  livePriceLabel: { color: colors.textSecondary, fontSize: 11, fontWeight: '800', letterSpacing: 0.7 },
  sessionText: { color: colors.accent, fontSize: 12, fontWeight: '800', marginTop: 5 },
  priceColumn: { alignItems: 'flex-end' },
  livePriceText: { color: colors.textPrimary, fontSize: 24, fontWeight: '800', fontVariant: ['tabular-nums'] },
  waitingText: { color: colors.textSecondary, fontSize: 8, fontWeight: '700', marginTop: 4, letterSpacing: 0.5 },
  marketFeedError: { color: colors.danger, fontSize: 11, lineHeight: 16, marginTop: 8 },
  cautionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.08)',
    padding: 11,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.2)',
  },
  cautionText: { color: colors.warning, fontSize: 11, fontWeight: '600', marginLeft: 8, flex: 1 },
  minBalanceText: { color: colors.textSecondary, fontSize: 10, marginTop: 9, marginLeft: 2 },
  actionContainer: { marginBottom: 20 },
  primaryButton: { borderRadius: 16, overflow: 'hidden', marginBottom: 14, elevation: 3, backgroundColor: colors.accent },
  primaryButtonInner: {
    minHeight: 56,
    paddingVertical: 16,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: { color: '#FFF', fontSize: 14, fontWeight: '900', letterSpacing: 0.7 },
  supportButton: { minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255, 68, 79, 0.08)', paddingVertical: 12, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255, 68, 79, 0.3)' },
  supportButtonText: { color: colors.accent, fontSize: 14, fontWeight: '700', marginLeft: 8 },
  balanceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, paddingHorizontal: 4, paddingVertical: 4 },
  balanceLabel: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  balanceValue: { color: colors.textPrimary, fontSize: 18, fontWeight: '800' },
  configureButton: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceLight,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  configureButtonText: { color: colors.accent, fontSize: 14, fontWeight: '900', letterSpacing: 1 },
  configSummary: { backgroundColor: colors.surface, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: colors.border },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 6 },
  summaryLabel: { color: colors.textSecondary, fontSize: 12 },
  summaryValue: { color: colors.textPrimary, fontSize: 12, fontWeight: '700', maxWidth: '60%', textAlign: 'right' },
  playPauseContainer: { alignItems: 'center', marginTop: 24 },
  playPauseOuter: {
    width: 86,
    height: 86,
    borderRadius: 43,
    padding: 6,
    backgroundColor: 'rgba(255, 68, 79, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255, 68, 79, 0.42)',
  },
  playPauseInner: { flex: 1, borderRadius: 40, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  pauseButton: { backgroundColor: colors.danger },
  playPauseText: { color: colors.textSecondary, fontSize: 10, fontWeight: '800', letterSpacing: 1, marginTop: 12 },
  editConfigButton: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', paddingVertical: 10, paddingHorizontal: 6 },
  editConfigText: { color: colors.accent, fontSize: 12, fontWeight: '700', marginLeft: 6 },
  bottomSheetDim: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(3, 7, 18, 0.88)' },
  bottomSheetContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 25,
    paddingBottom: 30,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalDim: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(3, 7, 18, 0.85)' },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 26,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  configSheetContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 30,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  modalTitle: { color: colors.textPrimary, fontSize: 19, fontWeight: '800', flex: 1, marginRight: 10 },
  connectionDescription: { color: colors.textSecondary, fontSize: 13, lineHeight: 19, marginBottom: 15 },
  connectionNotice: {
    backgroundColor: colors.background,
    borderRadius: 13,
    padding: 12,
    marginTop: 12,
  },
  connectionNoticeText: { color: colors.textSecondary, fontSize: 11, lineHeight: 16, textAlign: 'center' },
  supportModalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 36,
    borderWidth: 1,
    borderColor: colors.border,
  },
  supportSubtitle: { color: colors.textSecondary, fontSize: 13, lineHeight: 19, marginBottom: 18 },
  supportOptionButton: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 14,
    paddingHorizontal: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  supportOptionText: { color: colors.textPrimary, fontSize: 14, fontWeight: '700', marginLeft: 12 },
  inputLabel: { color: colors.accent, fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 8, marginTop: 13 },
  input: {
    backgroundColor: colors.background,
    color: colors.textPrimary,
    borderRadius: 12,
    padding: 15,
    fontSize: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
  },
  inputLarge: {
    backgroundColor: colors.background,
    color: colors.textPrimary,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 4,
  },
  submitButton: { backgroundColor: colors.accent, paddingVertical: 15, borderRadius: 12, alignItems: 'center', marginTop: 18 },
  submitButtonText: { color: '#FFF', fontSize: 14, fontWeight: '900', letterSpacing: 1 },
  selectInput: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 15,
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectText: { color: colors.textPrimary, fontSize: 14, flex: 1 },
  inlineDropdownList: { backgroundColor: colors.background, borderRadius: 12, marginTop: 6, borderWidth: 1, borderColor: colors.border, maxHeight: 180, overflow: 'scroll' },
  dropdownItem: { paddingVertical: 12, paddingHorizontal: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  dropdownItemText: { color: colors.textPrimary, fontSize: 13 },
  configNote: { color: colors.textSecondary, textAlign: 'center', fontSize: 11, lineHeight: 17, marginTop: 12 },
});
