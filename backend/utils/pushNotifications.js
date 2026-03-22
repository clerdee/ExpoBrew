const axios = require('axios');
const User = require('../models/User');

const EXPO_PUSH_ENDPOINT = 'https://exp.host/--/api/v2/push/send';
const EXPO_RECEIPT_ENDPOINT = 'https://exp.host/--/api/v2/push/getReceipts';
const MAX_MESSAGES_PER_REQUEST = 100;

const isExpoPushToken = (token) => typeof token === 'string' && /^ExponentPushToken\[.+\]$/.test(token);

const chunk = (items, size) => {
  const result = [];
  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size));
  }
  return result;
};

const clearStaleTokens = async (tokens = []) => {
  const uniqueTokens = [...new Set(tokens.filter(Boolean))];
  if (!uniqueTokens.length) return;

  try {
    await User.updateMany(
      { expoPushToken: { $in: uniqueTokens } },
      { $set: { expoPushToken: null } }
    );
    console.log(`Cleared ${uniqueTokens.length} stale Expo push token(s).`);
  } catch (error) {
    console.error('Failed to clear stale Expo push tokens:', error.message);
  }
};

const sendExpoPushNotifications = async (messages = []) => {
  const normalizedMessages = messages
    .filter((message) => isExpoPushToken(message?.to))
    .map((message) => ({
      sound: 'default',
      priority: 'high',
      channelId: 'default',
      ...message,
    }));

  if (!normalizedMessages.length) {
    return { sent: 0, rejected: [], ticketErrors: [], receiptErrors: [] };
  }

  const chunks = chunk(normalizedMessages, MAX_MESSAGES_PER_REQUEST);
  const tickets = [];
  const rejectedTokens = [];
  const ticketErrors = [];

  for (const messageChunk of chunks) {
    try {
      const { data } = await axios.post(EXPO_PUSH_ENDPOINT, messageChunk, {
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      });

      const responses = Array.isArray(data?.data) ? data.data : [];
      responses.forEach((ticket, index) => {
        tickets.push(ticket);
        if (ticket?.status === 'error') {
          const failedToken = messageChunk[index]?.to;
          ticketErrors.push({ token: failedToken, details: ticket?.details, message: ticket?.message });
          if (ticket?.details?.error === 'DeviceNotRegistered' && failedToken) {
            rejectedTokens.push(failedToken);
          }
        }
      });
    } catch (error) {
      ticketErrors.push({
        message: error.response?.data || error.message,
        details: 'Expo push ticket request failed',
      });
      console.error('Expo push send error:', error.response?.data || error.message);
    }
  }

  const receiptIds = tickets
    .filter((ticket) => ticket?.status === 'ok' && ticket.id)
    .map((ticket) => ticket.id);

  const receiptErrors = [];

  for (const receiptChunk of chunk(receiptIds, 100)) {
    try {
      const { data } = await axios.post(
        EXPO_RECEIPT_ENDPOINT,
        { ids: receiptChunk },
        {
          headers: {
            Accept: 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        }
      );

      const receipts = data?.data || {};
      Object.entries(receipts).forEach(([receiptId, receipt]) => {
        if (receipt?.status === 'error') {
          receiptErrors.push({ receiptId, details: receipt?.details, message: receipt?.message });
          if (receipt?.details?.error === 'DeviceNotRegistered') {
            const matchingIndex = tickets.findIndex((ticket) => ticket?.id === receiptId);
            const failedToken = matchingIndex >= 0 ? normalizedMessages[matchingIndex]?.to : null;
            if (failedToken) rejectedTokens.push(failedToken);
          }
        }
      });
    } catch (error) {
      receiptErrors.push({
        message: error.response?.data || error.message,
        details: 'Expo push receipt request failed',
      });
      console.error('Expo receipt fetch error:', error.response?.data || error.message);
    }
  }

  await clearStaleTokens(rejectedTokens);

  return {
    sent: normalizedMessages.length,
    rejected: [...new Set(rejectedTokens)],
    ticketErrors,
    receiptErrors,
  };
};

module.exports = { sendExpoPushNotifications, isExpoPushToken, clearStaleTokens };
