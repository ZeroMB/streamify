// Default API Key
const defaultApiKey = 'AIzaSyDONDdgC9n-BbTSVnedZ-v-4othWggkAuE';
let apiKey = localStorage.getItem('userApiKey') || defaultApiKey;
let playlistId;

// Elements for Easy Reference
const elements = {
    mainVideo: document.getElementById('main-video'),
    mainVideoTitle: document.querySelector('.main-video-wrapper .title'),
    videoPlaylist: document.querySelector('.video-playlist .videos'),
    videoInfo: document.getElementById('video-info'),
    playlistTitle: document.querySelector('.video-playlist .playlist-title'),
    loginForm: document.getElementById('login-section'),
    playlistForm: document.getElementById('login-form'),
    mainContainer: document.querySelector('main.container'),
    apiKeyInput: document.getElementById('user-api-key'),
    apiKeyLabel: document.getElementById('api-key-label'),
    submitButton: document.querySelector('button[type="submit"]'),
    togglePassword: document.getElementById('toggle-password'),
    passwordField: document.getElementById('playlist-id'),
    eyeOpen: document.getElementById('eye-open'),
    eyeClosed: document.getElementById('eye-closed'),
    errorPopup: document.getElementById('incorrect-toast'),
    errorMessage: document.querySelector('.error-message'),
    seeAllBtn: document.querySelector('.see-all'),
    descriptionWrapper: document.querySelector('.description-wrapper'),
    mainVideoWrapper: document.querySelector('.main-video-wrapper'),
    openDescriptionBtn: document.querySelector('.open-description'),
    logoutButton: document.querySelector('.logout'),
    arrowIcon: document.getElementById('arrow-icon')
};

// Toggle API Key Input Visibility
document.getElementById('change-api-key-label').addEventListener('click', function () {
    var apiKeyInput = document.getElementById('user-api-key');
    var apiKeyLabel = document.getElementById('api-key-label');
    var submitButton = document.querySelector('button[type="submit"]');

    if (apiKeyInput.style.display === 'none' || apiKeyInput.style.display === '') {
        apiKeyInput.style.display = 'block';
        apiKeyLabel.style.display = 'block';

        submitButton.parentNode.insertBefore(apiKeyLabel, submitButton);
        submitButton.parentNode.insertBefore(apiKeyInput, submitButton);
    } else {
        apiKeyInput.style.display = 'none';
        apiKeyLabel.style.display = 'none';
    }
});

// Toggle Password Visibility
elements.togglePassword.addEventListener('click', function () {
    const isText = elements.passwordField.type === 'text';
    elements.passwordField.type = isText ? 'password' : 'text';
    elements.eyeOpen.style.display = isText ? 'inline' : 'none';
    elements.eyeClosed.style.display = isText ? 'none' : 'inline';
});

// Extract Playlist ID from URL
const extractPlaylistId = urlOrId => urlOrId.match(/[?&]list=([^&]+)/)?.[1] || urlOrId;

// Playlist Form Submission
elements.playlistForm.addEventListener('submit', function (event) {
    event.preventDefault();

    playlistId = extractPlaylistId(elements.passwordField.value);
    const userApiKey = elements.apiKeyInput.value.trim();

    if (userApiKey) {
        apiKey = userApiKey;
        localStorage.setItem('userApiKey', userApiKey);
    }

    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('playlistId', playlistId);

    window.location.hash = `#/${playlistId}`;
    toggleLoginDisplay(false);

    fetchPlaylistDetails();
    fetchAllVideos();
});

// Show Incorrect API or Playlist Popup
const showIncorrectPopup = message => {
    elements.errorMessage.textContent = message;
    elements.errorPopup.style.display = 'block';
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('playlistId');
    apiKey = defaultApiKey;
    localStorage.removeItem('userApiKey');
};

// Hide Incorrect Popup on Button Click
document.getElementById('okay-button').addEventListener('click', () => {
    elements.errorPopup.style.display = 'none';
});

// On DOM Loaded
document.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const storedApiKey = localStorage.getItem('userApiKey');
    const storedPlaylistId = localStorage.getItem('playlistId');
    const hash = window.location.hash;
    const playlistIdFromHash = hash ? hash.split('/').pop() : null;

    apiKey = storedApiKey ? storedApiKey : defaultApiKey;

    if ((isLoggedIn === 'true' && storedPlaylistId) || playlistIdFromHash) {
        playlistId = playlistIdFromHash ? extractPlaylistId(playlistIdFromHash.replace('#', '')) : storedPlaylistId;

        console.log('User is logged in or hash detected, loading playlist:', playlistId);

        toggleLoginDisplay(false);

        fetchPlaylistDetails();
        fetchAllVideos();
    } else {
        console.log('User is not logged in or playlistId is missing, showing login page');
        toggleLoginDisplay(true);
    }

    elements.seeAllBtn.addEventListener('click', toggleDescriptionExpansion);
    elements.openDescriptionBtn.addEventListener('click', toggleFullDescription);
});

// Toggle Login Display
const toggleLoginDisplay = showLogin => {
    elements.loginForm.style.display = showLogin ? 'block' : 'none';
    elements.mainContainer.style.display = showLogin ? 'none' : 'grid';
};

// Toggle Full Description View
const toggleFullDescription = () => {
    if (elements.descriptionWrapper.classList.contains('show')) {
        elements.descriptionWrapper.classList.remove('show');
        elements.arrowIcon.classList.remove('rotated');
        elements.seeAllBtn.style.display = 'none';
        elements.descriptionWrapper.classList.remove('expanded');
        elements.seeAllBtn.textContent = 'See all';
    } else {
        elements.descriptionWrapper.classList.add('show');
        elements.arrowIcon.classList.add('rotated');

        const descriptionContent = elements.descriptionWrapper.querySelector('.description');
        const wrapperHeight = elements.descriptionWrapper.clientHeight;
        const contentHeight = descriptionContent.scrollHeight;

        const isOverflowing = contentHeight > wrapperHeight - 40;

        if (isOverflowing) {
            elements.seeAllBtn.style.display = 'block';
            elements.descriptionWrapper.classList.add('expanded');
            elements.seeAllBtn.textContent = 'See less';
        } else {
            elements.seeAllBtn.style.display = 'none';
        }

        if (window.innerWidth > 990) {
            scrollToTopOfDescription(elements.descriptionWrapper);
        }
    }
};

// Scroll to Top of Description
const scrollToTopOfDescription = (element) => {
    element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
    });
};

// Toggle Description Expansion
const toggleDescriptionExpansion = () => {
    elements.descriptionWrapper.classList.toggle('expanded');
    elements.seeAllBtn.textContent = elements.descriptionWrapper.classList.contains('expanded') ? 'See less' : 'See all';

    if (elements.descriptionWrapper.classList.contains('expanded') && window.innerWidth > 990) {
        scrollToTopOfDescription(elements.descriptionWrapper);
    }
};

// Scroll to Bottom of Element
const scrollToBottom = (element) => {
    element.scrollIntoView({ behavior: 'smooth', block: 'end' });
};

// Logout Functionality
elements.logoutButton.addEventListener('click', () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('playlistId');
    history.replaceState(null, null, window.location.pathname);
    playlistId = null;
    location.reload();
});

// Fetch Playlist Details from API
const fetchPlaylistDetails = () => {
    fetch(`https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            if (!data.items?.length) throw new Error('Playlist not found');
            elements.playlistTitle.textContent = data.items[0].snippet.title;
        })
        .catch(error => {
            console.error('Error fetching playlist details:', error);
            showIncorrectPopup('Check Playlist ID or Change API Key.');
            toggleLoginDisplay(true);
        });
};

// Fetch All Videos from API
const fetchAllVideos = (pageToken = '') => {
    fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&pageToken=${pageToken}&playlistId=${playlistId}&key=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            if (!data.items?.length) throw new Error('No videos found in this playlist');

            data.items.forEach(video => appendVideo(video));

            if (data.nextPageToken) fetchAllVideos(data.nextPageToken);
            else setupVideoClickEvents();
        })
        .catch(error => {
            console.error('Error fetching videos:', error);
            showIncorrectPopup('Check Playlist ID or Change API Key.');
            toggleLoginDisplay(true);
        });
};

// Append Video to Playlist
const appendVideo = video => {
    const { videoId } = video.snippet.resourceId;
    const { title, description, thumbnails } = video.snippet;
    const videoElement = `
        <div class="video" data-id="${videoId}" data-description="${description}">
            <div class="row">
                <img src="${thumbnails.medium.url}" alt="Thumbnail">
                <div class="column">
                    <p>${String(elements.videoPlaylist.childElementCount + 1).padStart(2, '0')}</p>
                    <h3 class="title">${title}</h3>
                </div>
            </div>
        </div>`;
    elements.videoPlaylist.innerHTML += videoElement;
};

// Setup Video Click Events
const setupVideoClickEvents = () => {
    const videos = document.querySelectorAll('.video');
    if (videos.length) {
        videos[0].classList.add('active');
        loadVideo(videos[0].dataset.id, videos[0].dataset.description);
    }
    videos.forEach(video => video.addEventListener('click', () => {
        videos.forEach(v => v.classList.remove('active'));
        video.classList.add('active');
        loadVideo(video.dataset.id, video.dataset.description);
    }));
    elements.videoInfo.textContent = `${elements.videoPlaylist.childElementCount} lessons`;
};

// Load the Video and Description
const loadVideo = (videoId, description) => {
    elements.mainVideo.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    elements.mainVideoTitle.textContent = document.querySelector(`.video[data-id="${videoId}"] .title`).textContent;

    const descriptionHtml = marked.parse(description || 'Nothing here!');
    elements.descriptionWrapper.querySelector('.description').innerHTML = formatDescriptionLinks(descriptionHtml);

    elements.descriptionWrapper.classList.remove('expanded');
    elements.seeAllBtn.textContent = 'See all';

    resetDescriptionView();
    scrollToTop(elements.mainVideoWrapper);
    toggleSeeAllButton();

    if (window.innerWidth <= 990) {
        elements.descriptionWrapper.classList.remove('expanded');
        elements.seeAllBtn.textContent = 'See all';
    }
};

// Format Description Links
const formatDescriptionLinks = html => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    tempDiv.querySelectorAll('a').forEach(link => link.setAttribute('target', '_blank'));
    return tempDiv.innerHTML;
};

// Reset Description View
const resetDescriptionView = () => {
    if (window.innerWidth > 990) {
        elements.descriptionWrapper.classList.remove('expanded');
        elements.seeAllBtn.textContent = 'See all';
        elements.descriptionWrapper.classList.remove('show');
        elements.arrowIcon.classList.remove('rotated');
    }
};

// Toggle 'See all' and 'See less'
const toggleSeeAllButton = () => {
    const descriptionContent = elements.descriptionWrapper.querySelector('.description');
    const wrapperHeight = elements.descriptionWrapper.clientHeight;
    const contentHeight = descriptionContent.scrollHeight;

    const isOverflowing = contentHeight > wrapperHeight - 40;

    elements.seeAllBtn.style.display = isOverflowing ? 'block' : 'none';
};

// Scroll to Top of Element
const scrollToTop = element => element.scrollIntoView({ behavior: 'smooth' });