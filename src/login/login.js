`use strict`;
import { ACCESS_TOKEN, TOKEN_TYPE, EXPIRES_IN } from "../common.js";
const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI;
const SCOPES =
  "user-top-read user-follow-read playlist-read-private user-library-read";

const APP_URL = import.meta.env.VITE_APP_URL;

const authorizeUser = () => {
  const url = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${REDIRECT_URI}&scope=${SCOPES}&show_dialog=true`;

  window.open(url, "login", "width=800,height=600");
};

const setItemInLocalStorage = ({ accessToken, tokenType, expiresIn }) => {
  localStorage.setItem(ACCESS_TOKEN, accessToken);
  localStorage.setItem(TOKEN_TYPE, tokenType);
  localStorage.setItem(EXPIRES_IN, expiresIn);
};

document.addEventListener("DOMContentLoaded", () => {
  const loginButton = document.getElementById("login-to-sportify");
  loginButton.addEventListener("click", authorizeUser);

  window.addEventListener("load", () => {
    const accessToken = localStorage.getItem(ACCESS_TOKEN);
    if (accessToken) {
      window.location.href = `${APP_URL}dashboard/dashboard.html`;
    }
    if (window.opener !== null && !window.opener.closed) {
      window.focus();
      if (window.location.href.includes("error")) {
        window.close();
      }

      const { hash } = window.location;
      const searchParam = new URLSearchParams(hash);
      const accessToken = searchParam.get("#access_token");
      const tokenType = searchParam.get("token_type");
      const expiresIn = searchParam.get("expires_in");

      if (accessToken) {
        window.close();
        setItemInLocalStorage({ accessToken, tokenType, expiresIn });
        window.opener.location.href = `${APP_URL}dashboard/dashboard.html`;
      } else {
        window.close();
      }
    }
  });
});