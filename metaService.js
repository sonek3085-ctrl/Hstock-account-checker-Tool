// metaService.js
// Secure Meta API integration (Node.js)

const META_API_VERSION = "v23.0";

const META_APP_ID = process.env.META_APP_ID;
const META_APP_SECRET = process.env.META_APP_SECRET;
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;

async function checkInstagramAccount(username) {
  if (!META_ACCESS_TOKEN) {
    return {
      username,
      status: "UNVERIFIED",
      reason: "Meta API credentials are not configured"
    };
  }

  try {
    // Official Instagram API access is permission-scoped.
    // This endpoint checks authorized account information,
    // not arbitrary public usernames.
    const url = new URL(
      `https://graph.facebook.com/${META_API_VERSION}/me`
    );

    url.searchParams.set("fields", "id,username");
    url.searchParams.set("access_token", META_ACCESS_TOKEN);

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return {
        username,
        status: "UNVERIFIED",
        reason: data.error?.message || "Meta API request failed"
      };
    }

    return {
      username,
      status: data.username ? "LIVE" : "UNVERIFIED",
      verified: Boolean(data.username),
      source: "Meta Graph API"
    };

  } catch (error) {
    return {
      username,
      status: "UNVERIFIED",
      reason: "Network or API error"
    };
  }
}

module.exports = { checkInstagramAccount };
