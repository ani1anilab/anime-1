import axios from "axios";
import { load } from "cheerio";
import baseUrl from "../utils/baseUrl.js";

export async function extractSubtitle(id, embed) {
  try {
    // Fetch source data using embed
    const sourcesData = await axios.get(`https://deaddrive.xyz/emdeb/${embed}`);
    const $ = load(sourcesData.data);

    // Find the element with data-embed
    const embedData = $('.wrapper > .videocontent > .list-server-more > .list-server-items > li')
      .filter((i, el) => $(el).text().trim() === 'VidHide')
      .attr('data-video');

    if (!embedData) {
      throw new Error('Embed data not found');
    }

    // Fetch the video page
    const videoPage = await axios.get(embedData);
    const videoPageContent = load(videoPage.data);

    // Extract subtitles from script tag
    let subtitles = [];
    videoPageContent('script').each((i, script) => {
      const scriptContent = videoPageContent(script).html();
      const match = scriptContent.match(/tracks:\s*\[(.*?)\]/);

      if (match) {
        const tracks = JSON.parse(`[${match[1]}]`);
        subtitles = tracks.filter(track => track.kind === 'captions')
          .map(track => ({
            file: track.file,
            label: track.label,
          }));
        return false; // Stop searching after finding the subtitle data
      }
    });

    return subtitles;
  } catch (error) {
    console.error("Error extracting subtitles:", error);
    return [];
  }
}
