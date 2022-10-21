import { fetchRequest } from "../api";
import { ENDPOINT, logout, SECTIONTYPE } from "../common";

const onProfileClick = (event) => {
  event.stopPropagation();

  const profileMenu = document.querySelector("#profile-menu");
  profileMenu.classList.toggle("hidden");
  if (!profileMenu.classList.contains("hidden")) {
    profileMenu.querySelector("li#logout").addEventListener("click", logout);
  }
};

const loadUserProfile = async () => {
  const defaultImage = document.querySelector("#default-image");
  const profileButton = document.querySelector("#user-profile-btn");
  const displayNameElement = document.querySelector(".display-name");

  const { display_name: displayName, images } = await fetchRequest(
    ENDPOINT.userInfo
  );

  if (images?.length) {
    defaultImage.classList.add("hidden");
  } else {
    defaultImage.classList.remove("hidden");
  }

  profileButton.addEventListener("click", onProfileClick);

  displayNameElement.textContent = displayName;
};

const onPlaylistItemClick = (event, id) => {
  const section = { type: SECTIONTYPE.PLAYLIST, playlist: id };
  history.pushState(section, "", `/playlist/${id}`);
  loadSection(section);
};

const loadPlaylist = async (endpoint, elementId) => {
  const playlistItemsSection = document.querySelector(`#${elementId}`);

  const {
    playlists: { items },
  } = await fetchRequest(endpoint);

  for (let {
    description,
    name,
    images: [{ url }],
    id,
  } of items) {
    const playlistItem = document.createElement("section");
    playlistItem.className =
      "bg-black-secondary rounded border-2 border-solid p-4 hover:cursor-pointer hover:bg-light-black";
    playlistItem.id = id;
    playlistItem.setAttribute("data-type", "playlist");
    playlistItem.addEventListener("click", (event) =>
      onPlaylistItemClick(event, id)
    );
    playlistItem.innerHTML = `<img src="${url}" alt="${name}" class="rounded mb-2 object-contain shadow"/>
    <h2 class="text-base font-semibold mb-4 truncate">${name}</h2>
    <h3 class="text-sm text-secondary line-clamp-2">${description}</h3>`;

    playlistItemsSection.appendChild(playlistItem);
  }
};

const loadPlayLists = () => {
  loadPlaylist(ENDPOINT.featuredPlaylist, "featured-playlist-items");
  loadPlaylist(ENDPOINT.toplists, "top-playlist-items");
};

const fillContentForDashboard = () => {
  let innerHtml = "";
  const playlistMap = new Map([
    ["featured", "featured-playlist-items"],
    ["top playlist", "top-playlist-items"],
  ]);

  const pageContentSection = document.querySelector(".page-content");
  for (let [type, id] of playlistMap) {
    innerHtml += `<article class="p-4">
    <h1 class="mb-4 text-2xl font-bold capitalize">${type}</h1>
    <section
      class="grid grid-cols-auto-fill-cards gap-4"
      id="${id}"
    ></section>
  </article>`;
  }
  pageContentSection.innerHTML = innerHtml;
};

const formatTime = (duration) => {
  const min = Math.floor(duration / 60_000);
  const sec = ((duration % 6_000) / 1000).toFixed(0);
  const formattedTime =
    sec == 60 ? min + 1 + ":00" : min + ":" + (sec < 10 ? "0" : "") + sec;
  return formattedTime;
};

const loadPlaylistTrack = ({ tracks }) => {
  const trackSection = document.querySelector("#tracks");

  let trackNum = 1;
  for (let trackItem of tracks.items) {
    let { id, artists, name, album, duration_ms: duration } = trackItem.track;
    let track = document.createElement("section");
    track.id = id;
    let image = album.images.find((img) => img.height === 64);
    track.className =
      "grid p-1 grid-cols-[50px_2fr_1fr_50px] items-center justify-start gap-4 rounded-md text-secondary hover:bg-light-black";
    track.innerHTML = ` <p class="justify-self-center">${trackNum++}</p>
    <section class="grid grid-cols-[auto_1fr] items-center gap-3">
    <img src="${image.url}" alt="${name}" class="h-8 w-8" />
    <article class="flex flex-col">
      <h2 class="text-xl text-primary">${name}</h2>
      <p class="text-sm">${Array.from(artists, (artist) => artist.name).join(
        ", "
      )}</p>
    </article>
    </section>
    
     <p>${album.name}</p>
    <p>${formatTime(duration)}</p>`;
    trackSection.appendChild(track);
  }
};

const fillContentForPlaylist = async (playlistId) => {
  const pageContentSection = document.querySelector(".page-content");
  const playlist = await fetchRequest(`${ENDPOINT.playlist}/${playlistId}`);
  pageContentSection.innerHTML = `<header id="playlist-header" class="px-8 py-4">
  <nav>
    <ul
      class="grid grid-cols-[50px_2fr_1fr_50px] gap-4 text-secondary "
    >
      <li class="justify-self-center">#</li>
      <li>Title</li>
      <li>album</li>
      <li>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="h-6 w-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </li>
    </ul>
  </nav>
</header>
<section id="tracks" class="px-8 text-secondary"></section>`;
  loadPlaylistTrack(playlist);
};

const onContentScroll = (event) => {
  const { scrollTop } = event.target;

  const header = document.querySelector(".header");
  if (scrollTop > header.getAttribute("offSetHeight")) {
    header.classList.add("sticky", "top-0", "bg-black-secondary");
    header.classList.remove("transparent");
  } else {
    header.classList.remove("sticky", "top-0", "bg-black-secondary");
    header.classList.add("transparent");
  }

  if (history.state.type === SECTIONTYPE.PLAYLIST) {
    const playlistHeader = document.querySelector("#playlist-header");

    if (scrollTop >= playlistHeader.getAttribute("offSetHeight")) {
    }
  }
};
const loadSection = (section) => {
  if (section.type == SECTIONTYPE.DASHBOARD) {
    fillContentForDashboard();
    loadPlayLists();
  } else if (section.type === SECTIONTYPE.PLAYLIST) {
    // playlist to be load here
    fillContentForPlaylist(section.playlist);
  }

  document
    .querySelector(".content")
    .removeEventListener("scroll", onContentScroll);
  document
    .querySelector(".content")
    .addEventListener("scroll", onContentScroll);
};

document.addEventListener("DOMContentLoaded", () => {
  loadUserProfile();
  const section = { type: SECTIONTYPE.DASHBOARD };
  history.pushState(section, "", "");
  loadSection(section);
  // fillContentForDashboard();
  // loadPlayLists();

  document.addEventListener("click", () => {
    const profileMenu = document.querySelector("#profile-menu");
    if (!profileMenu.classList.contains("hidden")) {
      profileMenu.classList.add("hidden");
    }
  });

  window.addEventListener("popstate", (event) => {
    loadSection(event.state);
  });
});
