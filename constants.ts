
import { Box, ShoppingBag, LayoutDashboard, LogOut, User, ClipboardList, Megaphone, Settings } from 'lucide-react';

export const APP_NAME = "ARFurniture";
export const CURRENCY = "₱";

// Get API base URL from environment or construct it
export const getApiBaseUrl = (): string => {
  // In production (Vercel), use the env variable if provided
  const envBase = (import.meta as any).env?.VITE_AUTH_API_BASE;
  const isLocalhost = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  
  // Detect LAN IP (e.g., 192.168.x.x, 10.x.x.x)
  const isLanIp = typeof window !== 'undefined' && 
    /^(\d{1,3}\.){3}\d{1,3}$/.test(window.location.hostname) &&
    !window.location.hostname.startsWith('127.');

  // Use the env variable if it's valid AND it's not a localhost fallback being forced on production
  if (envBase !== undefined && envBase !== 'undefined' && envBase !== '') {
    const sanitizedBase = envBase.replace(/\/$/, '');
    
    // If we have a localhost env var but we are on a real domain, ignore it and use relative paths
    if (!isLocalhost && !isLanIp && sanitizedBase.includes('localhost')) {
      return '';
    }
    
    return sanitizedBase;
  }
  
  // In local development or LAN testing, default to port 4000 on the current host
  if (typeof window !== 'undefined' && (isLocalhost || isLanIp)) {
    return `${window.location.protocol}//${window.location.hostname}:4000`;
  }
  
  // If no valid env var, and we are on a real domain, default to relative paths
  if (typeof window !== 'undefined') {
    return '';
  }
  
  return 'http://localhost:4000';
};

// Resolve asset URLs to work from any host (localhost, LAN IP, or tunnel)
// Handles relative paths, absolute URLs, and localhost URLs
export const resolveAssetUrl = (url: string | undefined): string => {
  if (!url) return '';
  
  // If it's already an absolute URL (http/https), return as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // For relative paths, resolve against the API server
  const apiBase = getApiBaseUrl();
  
  // Ensure path starts with /
  const path = url.startsWith('/') ? url : `/${url}`;
  
  // Final URL
  const resolved = `${apiBase}${path}`;

  // For AR compatibility, ensure the final URL is absolute
  if (!resolved.startsWith('http') && typeof window !== 'undefined') {
    return `${window.location.origin}${resolved}`;
  }
  
  return resolved;
};

export const NAV_ITEMS_CUSTOMER = [
  { label: 'Shop', path: '/', icon: ShoppingBag },
  { label: 'About', path: '/about', icon: User },
];

export const NAV_ITEMS_ADMIN = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { label: 'Products', path: '/admin/products', icon: Box },
  { label: 'Orders', path: '/admin/orders', icon: ClipboardList },
  { label: 'Marketing', path: '/admin/marketing', icon: Megaphone },
  { label: 'Settings', path: '/admin/settings', icon: Settings },
];
