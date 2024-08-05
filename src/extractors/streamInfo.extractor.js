import axios from "axios";
import * as cheerio from "cheerio";
import baseUrl from "../utils/baseUrl.js";
import { fetchServerData_v1 } from "../parsers/idFetch_v1.parser.js";
import { fetchServerData_v2 } from "../parsers/idFetch_v2.parser.js";
import { fetchServerData_v3 } from "../parsers/idFetch_v3.parser.js";
import { decryptAllServers } from "../parsers/decryptors/decryptAllServers.decryptor.js";

async function extractOtherEpisodes(id) {
  try {
    const finalId = id
    const resp = await axios.get(`${baseUrl}/watch/${finalId}`);
    const $ = cheerio.load(resp.data);
    const elements = $(".seasons-block > #detail-ss-list > .detail-infor-content > .ss-list > a");
    
    const episodes = elements.map((index, element) => {
      const title = $(element).attr("title");
      const episode_no = $(element).attr("data-number");
      const data_id = $(element).attr("data-id");
      // const japanese_title = $(element).find(".ssli-detail > .ep-name").attr("data-jname");
      
      return { data_id, episode_no, title };
    }).get();
    
    return episodes;
  } catch (error) {
    console.error("An error occurred:", error);
    return [];
  }
}

async function extractStreamingInfo(id) {
  try {
    const [data_v1, data_v2, data_v3] = await Promise.all([
      fetchServerData_v1(id),
      fetchServerData_v2(id),
      fetchServerData_v3(id),
    ]);

    // Combine and sort data from all three servers
    const sortedData = [...data_v1, ...data_v2, ...data_v3].sort((a, b) => a.embed.localeCompare(b.embed));
    
    // Decrypt all servers' data
    const decryptedResults = await decryptAllServers(sortedData);

    return decryptedResults;
  } catch (error) {
    console.error("An error occurred:", error);
    return [];
  }
}


export { extractOtherEpisodes, extractStreamingInfo };