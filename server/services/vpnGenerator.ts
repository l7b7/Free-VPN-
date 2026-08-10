import { VpnConfig, VpnProtocol, DurationDays } from '../../src/types';

// Sample server nodes for realistic VPN config generation
const SERVER_NODES = [
  { location: '🇩🇪 Germany (Frankfurt - High Speed)', host: 'de1.fre0vpn.net', port: 443, sshPort: 22 },
  { location: '🇫🇷 France (Paris - Ultra Low Latency)', host: 'fr1.fre0vpn.net', port: 443, sshPort: 22 },
  { location: '🇳🇱 Netherlands (Amsterdam - Unlimited)', host: 'nl1.fre0vpn.net', port: 8080, sshPort: 22 },
  { location: '🇸🇬 Singapore (Fast Asia Node)', host: 'sg1.fre0vpn.net', port: 443, sshPort: 22 },
  { location: '🇺🇸 USA (New York - Streaming Optimized)', host: 'us1.fre0vpn.net', port: 443, sshPort: 22 },
];

function generateRandomHex(length: number): string {
  const chars = 'abcdef0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateUUID(): string {
  return `${generateRandomHex(8)}-${generateRandomHex(4)}-4${generateRandomHex(3)}-a${generateRandomHex(3)}-${generateRandomHex(12)}`;
}

export function createVpnConfig(
  userId: string,
  protocol: VpnProtocol,
  durationDays: DurationDays,
  userName?: string
): VpnConfig {
  const node = SERVER_NODES[Math.floor(Math.random() * SERVER_NODES.length)];
  const now = new Date();
  const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);
  const id = `CFG-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`.toUpperCase();

  let configUrl = '';
  let rawPayload = '';

  const uuid = generateUUID();
  const password = `fre0_${generateRandomHex(6)}`;

  switch (protocol) {
    case 'vmess': {
      const vmessObj = {
        v: '2',
        ps: `FRE0BOT | VMess ${durationDays}D [${node.location.split(' ')[0]}]`,
        add: node.host,
        port: node.port.toString(),
        id: uuid,
        aid: '0',
        scy: 'auto',
        net: 'ws',
        type: 'none',
        host: node.host,
        path: '/vmess-ws',
        tls: 'tls',
        sni: node.host,
        alpn: 'h2,http/1.1',
        fp: 'chrome'
      };
      const base64Vmess = Buffer.from(JSON.stringify(vmessObj)).toString('base64');
      configUrl = `vmess://${base64Vmess}`;
      break;
    }
    case 'vless': {
      const psName = encodeURIComponent(`FRE0BOT | VLESS ${durationDays}D (${node.location.split(' ')[0]})`);
      configUrl = `vless://${uuid}@${node.host}:${node.port}?type=ws&security=tls&encryption=none&host=${node.host}&path=%2Fvless-ws&sni=${node.host}#${psName}`;
      break;
    }
    case 'trojan': {
      const psName = encodeURIComponent(`FRE0BOT | Trojan ${durationDays}D (${node.location.split(' ')[0]})`);
      configUrl = `trojan://${password}@${node.host}:${node.port}?security=tls&sni=${node.host}&type=ws&host=${node.host}&path=%2Ftrojan-ws#${psName}`;
      break;
    }
    case 'shadowsocks': {
      const psName = encodeURIComponent(`FRE0BOT | SS ${durationDays}D (${node.location.split(' ')[0]})`);
      const userPassBase64 = Buffer.from(`aes-256-gcm:${password}`).toString('base64');
      configUrl = `ss://${userPassBase64}@${node.host}:${node.port}#${psName}`;
      break;
    }
    case 'ssh': {
      const username = `fre0_user_${generateRandomHex(4)}`;
      configUrl = `ssh://${username}:${password}@${node.host}:${node.sshPort}`;
      rawPayload = `GET / HTTP/1.1[crlf]Host: ${node.host}[crlf]Upgrade: websocket[crlf]Connection: Upgrade[crlf][crlf]`;
      break;
    }
  }

  return {
    id,
    userId,
    userName: userName || `User_${userId}`,
    protocol,
    durationDays,
    serverLocation: node.location,
    serverHost: node.host,
    port: protocol === 'ssh' ? node.sshPort : node.port,
    configUrl,
    rawPayload,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    isActive: true,
    downloadsCount: 1,
  };
}

export function formatConfigMessage(config: VpnConfig): string {
  const expiryDate = new Date(config.expiresAt).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC'
  });

  return `🎉 *Your Free VPN / SSH Config is Ready!*
🤖 *Provided by:* @FRE0BOT
📢 *Official Channel:* @FR7l7

━━━━━━━━━━━━━━━━━━━━
🆔 *Config ID:* \`${config.id}\`
⚡ *Protocol:* \`${config.protocol.toUpperCase()}\`
⏱️ *Validity:* *${config.durationDays} Day(s)* (Expires: \`${expiryDate} UTC\`)
🌍 *Server:* ${config.serverLocation}
🌐 *Host:* \`${config.serverHost}\`
🔌 *Port:* \`${config.port}\`
━━━━━━━━━━━━━━━━━━━━

📋 *Import Code (Tap to Copy):*
\`\`\`
${config.configUrl}
\`\`\`
${config.rawPayload ? `\n⚙️ *SSH WebSocket Payload:*\n\`\`\`\n${config.rawPayload}\n\`\`\`\n` : ''}
💡 *How to use:*
1. Copy the code above.
2. Open *v2rayNG / Shadowrocket / NekoBox / HTTP Custom*.
3. Choose "Import config from Clipboard".
4. Connect and enjoy your secure internet!

⚠️ *Note:* Re-generate a new config anytime from @FRE0BOT after expiration.`;
}
