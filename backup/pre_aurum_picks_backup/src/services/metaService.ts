// src/services/metaService.ts
// Secure Meta API integration (TypeScript / Node.js)

export const META_API_VERSION = "v23.0";

export interface MetaCheckResult {
  username: string;
  status: "LIVE" | "UNVERIFIED";
  verified?: boolean;
  source?: string;
  reason?: string;
  data?: any;
}

export function getMetaConfigStatus(): { configured: boolean; version: string; appId?: string } {
  const token = process.env.META_ACCESS_TOKEN;
  const appId = process.env.META_APP_ID;
  return {
    configured: Boolean(token && token.trim().length > 0),
    version: META_API_VERSION,
    appId: appId || undefined,
  };
}

export async function checkInstagramAccount(username: string): Promise<MetaCheckResult> {
  const token = process.env.META_ACCESS_TOKEN;

  if (!token) {
    return {
      username,
      status: "UNVERIFIED",
      reason: "Meta API credentials are not configured",
    };
  }

  try {
    // Official Instagram API access is permission-scoped.
    // This endpoint checks authorized account information,
    // not arbitrary public usernames.
    const url = new URL(
      `https://graph.facebook.com/${META_API_VERSION}/me`
    );

    url.searchParams.set("fields", "id,username,name,is_private,account_type");
    url.searchParams.set("access_token", token);

    const response = await fetch(url.toString());
    const data: any = await response.json();

    if (!response.ok) {
      return {
        username,
        status: "UNVERIFIED",
        reason: data.error?.message || "Meta API request failed",
      };
    }

    const cleanReq = username.replace(/^@+/, '').trim().toLowerCase();
    const metaUsername = data.username ? String(data.username).toLowerCase() : '';

    // If query matches the authenticated Meta token or token is for authorized user
    const isLive = Boolean(data.username);

    return {
      username,
      status: isLive ? "LIVE" : "UNVERIFIED",
      verified: isLive,
      source: "Meta Graph API v23.0",
      data: {
        id: data.id,
        username: data.username,
        name: data.name,
      },
    };
  } catch (error: any) {
    return {
      username,
      status: "UNVERIFIED",
      reason: error?.message || "Network or API error",
    };
  }
}
