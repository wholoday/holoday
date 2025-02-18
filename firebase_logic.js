// Importera Firestore-funktioner
const db = firebase.firestore();

// Chatt-referens i Firestore
thechatRef = db.collection('chat');

// Spellista-referens i Firestore
const playlistRef = db.collection('playlist');

// Skicka meddelande till Firestore
function sendMessage() {
    const input = document.getElementById('chatInput');
    const messageText = input.value.trim();
    if (!messageText) return;
    
    thechatRef.add({
        alias: userAlias,
        message: messageText,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    input.value = '';
}

// Lyssna på nya meddelanden i Firestore och uppdatera chatten
chatRef.orderBy('timestamp').onSnapshot(snapshot => {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = '';
    snapshot.forEach(doc => {
        const data = doc.data();
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.textContent = `${data.alias}: ${data.message}`;
        chatMessages.appendChild(messageDiv);
    });
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Lägg till en video i spellistan
function addToPlaylist() {
    const urlInput = document.getElementById('youtubeUrl');
    const url = urlInput.value;
    const videoId = extractYouTubeID(url);
    
    if (videoId) {
        playlistRef.add({
            videoId: videoId,
            addedBy: userAlias,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        urlInput.value = '';
    } else {
        alert('Ogiltig YouTube-länk. Försök igen!');
    }
}

// Lyssna på spellistan i Firestore och uppdatera sidan
playlistRef.orderBy('timestamp').onSnapshot(snapshot => {
    const playlistDiv = document.getElementById('playlist');
    playlistDiv.innerHTML = '';
    const videos = [];
    snapshot.forEach(doc => {
        const data = doc.data();
        videos.push({ id: doc.id, ...data });
        const div = document.createElement('div');
        div.classList.add('playlist-item');
        div.textContent = `Lagd av: ${data.addedBy}`;
        playlistDiv.appendChild(div);
    });
    
    if (!player && videos.length > 0) {
        startVideo(videos[0]);
    }
});

// Spela nästa video i spellistan
function startVideo(video) {
    player = new YT.Player('videoContainer', {
        width: '100%',
        height: '100%',
        videoId: video.videoId,
        playerVars: { autoplay: 1 },
        events: {
            'onStateChange': event => {
                if (event.data === YT.PlayerState.ENDED) {
                    db.collection('playlist').doc(video.id).delete();
                }
            }
        }
    });
}
