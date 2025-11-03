function formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return [hrs, mins, secs]
        .map(v => v < 10 ? "0" + v : v)
        .join(":");
}

export async function getVideoLength(videoId) {
    try {
        const BUNNY_STREAM_API_KEY = process.env.BUNNY_STREAM_API_KEY;
        const BUNNY_LIBRARY_ID = process.env.BUNNY_LIBRARY_ID;

        const url = `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos/${videoId}`;

        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                AccessKey: BUNNY_STREAM_API_KEY,
            }
        };

        const res = await fetch(url, options);
        const data = await res.json();
        return formatTime(Number(data.length));
    } catch (error) {
        console.error("Error fetching video length:", error);
        return "";
    }
}