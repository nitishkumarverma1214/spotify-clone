export const ACCESS_TOKEN = "ACCESS_TOKEN";
export const TOKEN_TYPE = "TOKEN_TYPE";
export const EXPIRES_IN = "EXPIRES_IN";
const APP_URL = import.meta.env.VITE_APP_URL;

export const ENDPOINT = {
  userInfo: "me",
  featuredPlaylist: "browse/featured-playlists?limit=5",
};

export const logout = () => {
  localStorage.removeItem(ACCESS_TOKEN);
  localStorage.removeItem(TOKEN_TYPE);
  localStorage.removeItem(EXPIRES_IN);
  window.location.href = APP_URL;
};
