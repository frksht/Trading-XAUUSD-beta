import { execSync } from 'child_process';
import { existsSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let notificationQueue = [];
let lastNotified = {};

export function sendDesktopNotification({ title, message, urgency = 'normal' }) {
  const key = `${title}:${message}`;
  const now = Date.now();

  if (lastNotified[key] && now - lastNotified[key] < 60000) {
    return { sent: false, reason: 'duplicate_suppressed' };
  }

  lastNotified[key] = now;

  if (process.platform === 'win32') {
    try {
      const psScript = `
        [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] > $null
        $template = [Windows.UI.Notifications.ToastNotificationManager]::GetTemplateContent([Windows.UI.Notifications.ToastTemplateType]::ToastText02)
        $textNodes = $template.GetElementsByTagName("text")
        $textNodes.Item(0).AppendChild($template.CreateTextNode("${title.replace(/"/g, '`"')}")) > $null
        $textNodes.Item(1).AppendChild($template.CreateTextNode("${message.replace(/"/g, '`"')}")) > $null
        $toast = [Windows.UI.Notifications.ToastNotification]::new($template)
        [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier("Trading XAUUSD").Show($toast)
      `;
      writeFileSync(join(__dirname, '..', 'temp_notify.ps1'), psScript);
      execSync(`powershell -ExecutionPolicy Bypass -File "${join(__dirname, '..', 'temp_notify.ps1')}"`, { timeout: 5000 });
      return { sent: true, method: 'toast' };
    } catch (e) {
      try {
        execSync(`msg * "${title}: ${message.substring(0, 100)}"`, { timeout: 3000 });
        return { sent: true, method: 'msg' };
      } catch { }
    }
  }

  if (process.platform === 'darwin') {
    try {
      execSync(`osascript -e 'display notification "${message.replace(/"/g, '\\"')}" with title "${title.replace(/"/g, '\\"')}"'`, { timeout: 3000 });
      return { sent: true, method: 'osascript' };
    } catch { }
  }

  if (process.platform === 'linux') {
    try {
      execSync(`notify-send "${title}" "${message}"`, { timeout: 3000 });
      return { sent: true, method: 'notify-send' };
    } catch { }
  }

  return { sent: false, reason: 'unsupported_platform' };
}

export function notifyTradeSetup({ direction, entry, confidence, risk_reward, reason }) {
  const title = `XAUUSD — Setup ${direction.toUpperCase()}`;
  const message = `Entry: ${entry} | R:R: 1:${risk_reward} | Confidence: ${confidence} | ${reason}`;
  return sendDesktopNotification({ title, message, urgency: 'high' });
}

export function notifyTradeResult({ direction, pnl, pnl_pct }) {
  const emoji = pnl > 0 ? 'WIN' : 'LOSS';
  const title = `XAUUSD — ${emoji} ${direction.toUpperCase()}`;
  const message = `P&L: ${pnl > 0 ? '+' : ''}${pnl}$ (${pnl_pct > 0 ? '+' : ''}${pnl_pct}%)`;
  return sendDesktopNotification({ title, message, urgency: 'normal' });
}

export function notifyMacroBlock(reason) {
  return sendDesktopNotification({
    title: 'XAUUSD — Trade Blocked',
    message: reason,
    urgency: 'high',
  });
}

export function notifyError(error) {
  return sendDesktopNotification({
    title: 'XAUUSD — Error',
    message: error.substring(0, 200),
    urgency: 'high',
  });
}
