import axios from "axios";
import * as cheerio from "cheerio";
import baseUrl from "../utils/baseUrl.js";

async function extractSeasons(id) {
  try {
    const resp = await axios.get(`${baseUrl}/${id}`);
    const $ = cheerio.load(resp.data);
    
    const seasonPromises = $(".anisc-detail>.film-buttons>a")
      .map(async (index, element) => {
        const data_number = index;
        const href = $(element).attr("href");
        const data_id = parseInt(href.split("-").pop(), 10);
        let seasonSave = 1;
        let Season = seasonSave + data_number;
        let ifmovie = ''

        if(href.includes('type=movie')) {
          ifmovie = href;
          ifmovie.replace('/watch/', '')
        }
        
        const fullUrl = `${baseUrl}${href}`;
        
        try {
         
          const response = await axios.get(fullUrl);
          const $episode = cheerio.load(response.data);


          const hrefEpisode = $episode('.seasons-block > #detail-ss-list > .detail-infor-content > .ss-list > a').first().attr('href');
          const hrefgetEpisode = hrefEpisode.replace('/watch/', '')

          return { Season, data_number, data_id, hrefgetEpisode };
        } catch (error) {
          console.error(`Error fetching ${fullUrl}:`, error.message);
          return { Season, data_number, data_id, hrefEpisode: null, ifmovie };
        }
      })
      .get();

    const resolvedSeasons = await Promise.all(seasonPromises);
    return resolvedSeasons;
  } catch (e) {
    console.log('Error in extractSeasons:', e.message);
  }
}

export default extractSeasons;
