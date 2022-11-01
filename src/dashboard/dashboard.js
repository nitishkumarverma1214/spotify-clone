import { fetchRequest } from "../api";
import {
  ENDPOINT,
  getItemFromLocalStorage,
  LOADED_TRACKS,
  logout,
  SECTIONTYPE,
  setItemInLocalStorage,
} from "../common";
const audio = new Audio();
let displayName;
const songDurationCompleted = document.querySelector(
  "#song-duration-completed"
);
const songProgress = document.querySelector("#progress");

const onProfileClick = (event) => {
  event.stopPropagation();

  const profileMenu = document.querySelector("#profile-menu");
  profileMenu.classList.toggle("hidden");
  if (!profileMenu.classList.contains("hidden")) {
    profileMenu.querySelector("li#logout").addEventListener("click", logout);
  }
};

const loadUserProfile = () => {
  return new Promise(async (resolve, reject) => {
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
    resolve({ displayName });
  });
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
      "bg-black-secondary rounded  p-4 hover:cursor-pointer hover:bg-light-black";
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
  const coverContent = document.querySelector("#cover-content");
  coverContent.innerHTML = `<h1 class="text-6xl">Hello,${displayName} </h1>`;
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

const onTrackSelection = (event, id) => {
  document.querySelectorAll("#tracks .track").forEach((trackItem) => {
    if (trackItem.id === id) {
      trackItem.classList.add("bg-gray", "selected");
    } else {
      trackItem.classList.remove("bg-gray", "selected");
    }
  });
};

const updateIconForPlayMode = (id) => {
  const playButton = document.querySelector("#play");
  playButton.querySelector("span").textContent = "pause_circle";
  const playButtonFromTracks = document.querySelector(`#play-track-${id}`);
  if (playButtonFromTracks) {
    playButtonFromTracks.textContent = "pause";
  }
};

const updateIconForPauseMode = (id) => {
  const playButton = document.querySelector("#play");
  playButton.querySelector("span").textContent = "play_circle";
  const playButtonFromTracks = document.querySelector(`#play-track-${id}`);
  if (playButtonFromTracks) {
    playButtonFromTracks.textContent = "play_arrow";
  }
};

const onAudioMetaDataLoaded = () => {
  const totalSongDuration = document.querySelector("#total-song-duration");
  totalSongDuration.textContent = `0:${audio.duration.toFixed(0)}`;
};

const togglePlay = () => {
  if (audio.src) {
    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  }
};

const findCurrentTrack = () => {
  const audioControl = document.querySelector("#audio-control");
  const trackId = audioControl.getAttribute("data-track-id");
  if (trackId) {
    const loadedTracks = getItemFromLocalStorage(LOADED_TRACKS);
    const currentTrackIndex = loadedTracks?.findIndex(
      (trk) => trk.id === trackId
    );
    return { currentTrackIndex, tracks: loadedTracks };
  }
  return null;
};

const playPrevTrack = () => {
  const { currentTrackIndex = -1, tracks = null } = findCurrentTrack() ?? {};

  if (currentTrackIndex > 0) {
    playTrack(null, tracks[currentTrackIndex - 1]);
  }
};
const playNextTrack = () => {
  const { currentTrackIndex = -1, tracks = null } = findCurrentTrack() ?? {};

  if (currentTrackIndex > -1 && currentTrackIndex < tracks?.length - 1) {
    playTrack(null, tracks[currentTrackIndex + 1]);
  }
};

const playTrack = function (
  event,
  { image, artistNames, name, duration, previewUrl, id }
) {
  if (event?.stopPropagation) {
    event.stopPropagation();
  }

  if (audio.src === previewUrl) {
    togglePlay();
  } else {
    const songInfo = document.querySelector("#song-info");
    const nowPlayingSongImage = document.querySelector("#now-playing-image");
    nowPlayingSongImage.src = image.url;

    const nowPlayingSongName = document.querySelector("#now-playing-song");
    nowPlayingSongName.textContent = name;

    const nowPlayingSongArtists = document.querySelector("#now-playing-artist");
    nowPlayingSongArtists.textContent = artistNames;
    const audioControl = document.querySelector("#audio-control");
    audioControl.setAttribute("data-track-id", id);
    audio.src = previewUrl;

    audio.removeEventListener("loadedmetadata", () => onAudioMetaDataLoaded());

    audio.play();
    songInfo.classList.remove("invisible");
  }
};

const loadPlaylistTrack = ({ tracks }) => {
  const trackSection = document.querySelector("#tracks");
  const loadedTracks = [];
  let trackNum = 1;
  console.log(tracks.items);
  for (let trackItem of tracks.items.filter(
    (item) => item.track?.preview_url
  )) {
    let {
      id,
      artists,
      name,
      album,
      duration_ms: duration,
      preview_url: previewUrl,
    } = trackItem.track;
    let track = document.createElement("section");
    track.id = id;
    let image = album.images.find((img) => img.height === 64);
    let artistNames = Array.from(artists, (artist) => artist.name).join(", ");
    track.className =
      "track grid p-1 grid-cols-[50px_1fr_1fr_50px] items-center justify-start gap-4 rounded-md text-secondary hover:bg-light-black";
    track.innerHTML = ` <p class=" flex justify-self-center relative w-full items-center justify-center"> <span class="track-no">${trackNum++}</span></p>
    <section class="grid grid-cols-[auto_1fr] items-center gap-3">
    <img src="${image.url}" alt="${name}" class="h-10 w-10" />
    <article class="flex flex-col gap-2 justify-center">
      <h2 class="song-title text-base text-primary line-clamp-1">${name}</h2>
      <p class="text-xs line-clamp-1">${artistNames}</p>
    </article>
    </section>
    
     <p class="text-sm">${album.name}</p>
    <p class="text-sm">${formatTime(duration)}</p>`;
    track.addEventListener("click", (event) => onTrackSelection(event, id));
    const playButtonInTracks = document.createElement("button");
    playButtonInTracks.id = `play-track-${id}`;
    playButtonInTracks.className =
      "play w-full absolute text-lg invisible left-0 material-symbols-outlined";
    playButtonInTracks.textContent = "play_arrow";
    track.querySelector("p").appendChild(playButtonInTracks);
    playButtonInTracks.addEventListener("click", (event) =>
      playTrack(event, { image, artistNames, name, duration, previewUrl, id })
    );
    trackSection.appendChild(track);
    loadedTracks.push({
      id,
      artistNames,
      name,
      album,
      duration,
      previewUrl,
      image,
    });
  }
  setItemInLocalStorage(LOADED_TRACKS, loadedTracks);
};

const fillContentForPlaylist = async (playlistId) => {
  const playlist = await fetchRequest(`${ENDPOINT.playlist}/${playlistId}`);
  console.log(playlist);
  const {
    name,
    description,
    images: [{ url: imageUrl }],
  } = playlist;

  const pageContentSection = document.querySelector(".page-content");
  const coverElement = document.querySelector("#cover-content");

  coverElement.innerHTML = `<section class="grid grid-cols-[auto_1fr] gap-4">
  <img src="${imageUrl}" alt="${name}" class="object-contain h-36 w-36" />
  <section>
  <h2 id="playlist-name" class="text-4xl">${name}</h2>
  <p id="playlist-details" class="line-clamp-2 text-secondary text-sm">${description}</p>
  </section>
</section>`;

  pageContentSection.innerHTML = `<header id="playlist-header" class="mx-8  border-secondary border-b-[0.5px] z-10">
  <nav class="py-4">
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
<section id="tracks" class="px-8 text-secondary mt-4"></section>`;
  loadPlaylistTrack(playlist);
};
const onContentScroll = (event) => {
  const { scrollTop } = event.target;

  const coverElement = document.querySelector("#cover-content");
  const header = document.querySelector(".header");
  const totalHeight = coverElement.offsetHeight;
  const coverOpacity =
    100 - (scrollTop >= totalHeight ? 100 : (scrollTop / totalHeight) * 100);

  const headerOpacity =
    scrollTop >= header.offsetHeight
      ? 100
      : (scrollTop / header.offsetHeight) * 100;

  coverElement.style.opacity = `${coverOpacity}%`;
  header.style.background = `rgba(0 0 0 / ${headerOpacity}%)`;

  if (history.state.type === SECTIONTYPE.PLAYLIST) {
    const playlistHeader = document.querySelector("#playlist-header");

    if (coverOpacity <= 35) {
      playlistHeader.classList.add("sticky", "bg-black-secondary", "px-8");
      playlistHeader.classList.remove("mx-8");
      playlistHeader.style.top = `${header.offsetHeight}px`;
      header.classList.remove("bg-transparent");
    } else {
      playlistHeader.classList.remove("sticky", "bg-black-secondary", "px-8");
      playlistHeader.classList.add("mx-8");
      playlistHeader.style.top = `revert`;
      header.classList.add("bg-transparent");
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

const onUserPlaylistClick = (id) => {
  const section = { type: SECTIONTYPE.PLAYLIST, playlist: id };
  history.pushState(section, `/dashboard/playlist/${id}`);
  loadSection(section);
};

const loadUserPlaylist = async () => {
  const userPlaylist = await fetchRequest(ENDPOINT.userPlaylist);
  const userPlaylistSecion = document.querySelector("#user-playlists>ul");
  userPlaylistSecion.innerHTML = "";
  for (let { name, id } of userPlaylist.items) {
    const li = document.createElement("li");
    li.textContent = `${name}`;
    li.className = "cursor-pointer hover:text-primary";
    li.addEventListener("click", () => onUserPlaylistClick(id));
    userPlaylistSecion.appendChild(li);
  }
  console.log(userPlaylist);
};

document.addEventListener("DOMContentLoaded", async () => {
  const playButton = document.querySelector("#play");
  const volume = document.querySelector("#volume");
  const audioControl = document.querySelector("#audio-control");
  const timeline = document.querySelector("#timeline");
  let progressInterval;

  ({ displayName } = await loadUserProfile());
  loadUserPlaylist();

  //37i9dQZF1DWXJfnUiYjUKT
  const section = { type: SECTIONTYPE.DASHBOARD };
  // const section = {
  //   type: SECTIONTYPE.PLAYLIST,
  //   playlist: "37i9dQZF1DWXJfnUiYjUKT",
  // };
  history.pushState(section, "", "");
  // history.pushState(section, "", `dashboard/playlist/${section.playlist}`);
  loadSection(section);

  audio.addEventListener("loadedmetadata", () => onAudioMetaDataLoaded());
  playButton.addEventListener("click", (event) => {
    togglePlay();
  });

  audio.addEventListener("play", () => {
    const selectedTrackId = audioControl.getAttribute("data-track-id");
    const tracks = document.querySelector("#tracks");
    const playingTrack = tracks.querySelector("section.playing");
    const selectedTrack = tracks?.querySelector(`[id="${selectedTrackId}"]`);
    const prev = document.querySelector("#prev");
    const next = document.querySelector("#next");

    selectedTrack?.classList.add("playing");

    if (playingTrack?.id !== selectedTrack?.id) {
      playingTrack?.classList.remove("playing");
    }

    clearInterval(progressInterval);
    progressInterval = setInterval(() => {
      if (audio.paused) {
        return;
      }

      songDurationCompleted.textContent = `${
        audio.currentTime.toFixed(0) < 10
          ? "0:0" + audio.currentTime.toFixed(0)
          : "0:" + audio.currentTime.toFixed(0)
      }`;

      songProgress.style.width = `${
        (audio.currentTime / audio.duration) * 100
      }%`;
    }, 100);
    updateIconForPlayMode(selectedTrackId);
  });

  audio.addEventListener("pause", () => {
    if (progressInterval) {
      clearInterval(progressInterval);
    }
    const selectedTrackId = audioControl.getAttribute("data-track-id");
    updateIconForPauseMode(selectedTrackId);
  });

  volume.addEventListener("change", () => {
    audio.volume = volume.value / 100;
  });

  timeline.addEventListener(
    "click",
    (e) => {
      const timelineWidth = window.getComputedStyle(timeline).width;
      const timeToSeek = (e.offsetX / parseInt(timelineWidth)) * audio.duration;
      audio.currentTime = timeToSeek;
      songProgress.style.width = `${
        (audio.currentTime / audio.duration) * 100
      }%`;
    },
    false
  );

  prev.addEventListener("click", playPrevTrack);
  next.addEventListener("click", playNextTrack);

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
