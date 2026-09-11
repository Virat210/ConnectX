import crypto from 'crypto';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export interface RTCIceServerConfig {
  urls: string | string[];
  username?: string;
  credential?: string;
}

export class WebrtcService {
  /**
   * Generates a complete array of RTCIceServer configurations for WebRTC peer connections.
   * Supports standard STUN, Coturn STUN, Coturn TURN UDP, Coturn TURN TCP, and Coturn TURNS (TLS).
   * Uses time-limited HMAC-SHA1 tokens (RFC 5766 TURN REST API) if WEBRTC_TURN_SECRET is configured,
   * or static long-term credentials if WEBRTC_TURN_USERNAME / WEBRTC_TURN_CREDENTIAL are provided.
   */
  static getIceServers(userId?: string): RTCIceServerConfig[] {
    const iceServers: RTCIceServerConfig[] = [];

    // 1. Primary Public STUN servers
    iceServers.push({
      urls: [
        env.WEBRTC_STUN_SERVER || 'stun:stun.l.google.com:19302',
        'stun:global.stun.twilio.com:3478',
      ],
    });

    // 2. Check if Coturn TURN server is configured
    const turnServerRaw = env.WEBRTC_TURN_SERVER?.trim();

    if (turnServerRaw) {
      // Clean host address (strip turn: or turns: prefix if user entered it)
      const cleanHost = turnServerRaw.replace(/^(turn:|turns:|stun:)/, '').split(':')[0];
      const port = env.WEBRTC_TURN_PORT || 3478;
      const tlsPort = env.WEBRTC_TURN_TLS_PORT || 5349;

      // Add Coturn's own STUN server
      iceServers.push({
        urls: [`stun:${cleanHost}:${port}`],
      });

      let username = '';
      let credential = '';

      // A) Ephemeral HMAC-SHA1 credentials (RFC 5766 standard)
      if (env.WEBRTC_TURN_SECRET) {
        const ttlSeconds = 24 * 3600; // 24 hours validity
        const expiry = Math.floor(Date.now() / 1000) + ttlSeconds;
        const cleanUser = userId ? userId.replace(/:/g, '_') : 'connectx-client';
        username = `${expiry}:${cleanUser}`;
        credential = crypto
          .createHmac('sha1', env.WEBRTC_TURN_SECRET)
          .update(username)
          .digest('base64');
      } else if (env.WEBRTC_TURN_USERNAME && env.WEBRTC_TURN_CREDENTIAL) {
        // B) Long-term static credentials
        username = env.WEBRTC_TURN_USERNAME;
        credential = env.WEBRTC_TURN_CREDENTIAL;
      }

      if (username && credential) {
        // TURN UDP (optimal for audio/video speed)
        iceServers.push({
          urls: [`turn:${cleanHost}:${port}?transport=udp`],
          username,
          credential,
        });

        // TURN TCP (fallback for UDP-blocked networks)
        iceServers.push({
          urls: [`turn:${cleanHost}:${port}?transport=tcp`],
          username,
          credential,
        });

        // TURNS / TLS (encrypted relay on port 5349 for corporate deep-packet inspection firewalls)
        iceServers.push({
          urls: [`turns:${cleanHost}:${tlsPort}?transport=tcp`],
          username,
          credential,
        });

        logger.info(`WebRTC ICE: Generated Coturn TURN/TURNS servers for host ${cleanHost}`);
      } else {
        logger.warn('WEBRTC_TURN_SERVER is specified, but neither WEBRTC_TURN_SECRET nor WEBRTC_TURN_USERNAME/CREDENTIAL are provided.');
      }
    } else {
      logger.debug('WebRTC ICE: No TURN server configured in environment. Using standard STUN servers.');
    }

    return iceServers;
  }
}
