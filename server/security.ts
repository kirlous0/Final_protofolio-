import dns from 'dns/promises';
import { URL } from 'url';

/**
 * Validates a URL against Server-Side Request Forgery (SSRF).
 * Blocks private IP ranges, loopback addresses, cloud metadata endpoints, and non-HTTP(S) schemes.
 */
export async function validateSafeUrl(rawUrl: string): Promise<{ valid: boolean; error?: string; normalizedUrl?: string }> {
  try {
    if (!rawUrl || typeof rawUrl !== 'string') {
      return { valid: false, error: 'URL must be a non-empty string' };
    }

    const trimmed = rawUrl.trim();
    const urlObj = new URL(trimmed);

    // Protocol check
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return { valid: false, error: 'Only HTTP and HTTPS protocols are allowed' };
    }

    const hostname = urlObj.hostname.toLowerCase();

    // Loopback & generic forbidden hostnames
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '::1' ||
      hostname === '0.0.0.0' ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal') ||
      hostname.endsWith('.localhost')
    ) {
      return { valid: false, error: 'Access to localhost and internal hostnames is prohibited' };
    }

    // Cloud metadata endpoints
    if (
      hostname === '169.254.169.254' ||
      hostname === 'metadata.google.internal' ||
      hostname === 'metadata' ||
      hostname === 'instance-data'
    ) {
      return { valid: false, error: 'Access to cloud metadata services is strictly forbidden' };
    }

    // Resolve DNS to verify IP isn't private
    try {
      const addresses = await dns.lookup(hostname, { all: true });
      
      for (const addr of addresses) {
        if (isPrivateIp(addr.address)) {
          return { valid: false, error: `Host resolves to private IP address (${addr.address}) which is blocked for security.` };
        }
      }
    } catch (dnsErr: any) {
      // If DNS lookup fails for an external URL that might be valid format, we record error
      return { valid: false, error: `Could not resolve domain name: ${hostname}` };
    }

    return { valid: true, normalizedUrl: urlObj.toString() };
  } catch (err: any) {
    return { valid: false, error: `Malformed URL: ${err.message || 'Invalid format'}` };
  }
}

/**
 * Checks if an IPv4 or IPv6 address belongs to private or reserved ranges
 */
export function isPrivateIp(ip: string): boolean {
  // IPv4 checks
  if (ip.includes('.')) {
    const parts = ip.split('.').map(p => parseInt(p, 10));
    if (parts.length !== 4 || parts.some(isNaN)) return true;

    // 10.0.0.0/8
    if (parts[0] === 10) return true;
    // 127.0.0.0/8 (Loopback)
    if (parts[0] === 127) return true;
    // 0.0.0.0/8
    if (parts[0] === 0) return true;
    // 172.16.0.0/12
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    // 192.168.0.0/16
    if (parts[0] === 192 && parts[1] === 168) return true;
    // 169.254.0.0/16 (Link-Local & Cloud Metadata)
    if (parts[0] === 169 && parts[1] === 254) return true;
    // 100.64.0.0/10 (Carrier-grade NAT)
    if (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127) return true;
    // 224.0.0.0/4 (Multicast)
    if (parts[0] >= 224) return true;
  }

  // IPv6 checks
  if (ip.includes(':')) {
    const lower = ip.toLowerCase();
    if (lower === '::1' || lower === '::') return true;
    if (lower.startsWith('fe80:')) return true; // link-local
    if (lower.startsWith('fc00:') || lower.startsWith('fd00:')) return true; // unique local
    if (lower.startsWith('ff00:')) return true; // multicast
  }

  return false;
}
