import { decryptSources_v1 } from "./decrypt_v1.decryptor.js";
import { decryptSources_v2 } from "./decrypt_v2.decryptor.js";
import { decryptSources_v3 } from "./decrypt_v3.decryptor.js";

export async function decryptAllServers(serverData) {
  const promises = serverData.map(async (server) => {
    let decryptionPromises = [];

    // Check if `server.embed` is not empty
    if (server.embed) {
      // Add decryption promises to the array for all decryption functions
      decryptionPromises.push(
        decryptSources_v1(
          server.id,
          server.name,
          server.embed
        ),
        decryptSources_v2(
          server.id,
          server.name,
          server.embed
        ),
        decryptSources_v3(
          server.id,
          server.name,
          server.embed
        )
      );
    }

    if (decryptionPromises.length > 0) {
      // Wait for all decryption promises to settle
      const results = await Promise.allSettled(decryptionPromises);
      return { results };
    } else {
      return { error: "No valid decryption promise found" };
    }
  });

  return Promise.allSettled(promises);
}
