/**
 * Extract YouTube video ID from various YouTube URL formats
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/v/VIDEO_ID
 * 
 * @param {string} url - YouTube video URL
 * @returns {string|null} - Video ID or null if invalid
 */
export function extractYouTubeVideoId(url) {
  if (!url || typeof url !== 'string') {
    return null;
  }

  // Remove whitespace
  url = url.trim();

  // If it's already just a video ID (11 characters, alphanumeric with - and _)
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return url;
  }

  // Regular expression patterns for different YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Generate YouTube embed URL from video ID
 * @param {string} videoId - YouTube video ID
 * @returns {string} - YouTube embed URL
 */
export function generateYouTubeEmbedUrl(videoId) {
  return `https://www.youtube.com/embed/${videoId}`;
}

/**
 * Check if a URL is a YouTube URL
 * @param {string} url - URL to check
 * @returns {boolean}
 */
export function isYouTubeUrl(url) {
  if (!url || typeof url !== 'string') {
    return false;
  }
  return url.includes('youtube.com') || url.includes('youtu.be');
}
