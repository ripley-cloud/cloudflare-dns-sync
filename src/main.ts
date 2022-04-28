import "dotenv/config";
import { syncDNSToCloudFlare } from "./DNSSync";

if(process.argv.length != 3){
    console.error("Usage: main.ts newHostsFile");
    process.exit(-1);
}
const newFile = process.argv[2];

syncDNSToCloudFlare(newFile, process.env.CLOUDFLARE_TOKEN || "", process.env.ZONE || "", process.env.SEARCH_DOMAIN || "");