import CloudFlare from 'cloudflare'
import * as fs from 'fs/promises'

type hostname = string;
type ip = string;

async function hostsToMap(fileName: string, searchDomain: string){
    const file = await fs.readFile(fileName, 'utf8');
    const map = new Map<hostname, ip>();
    for(let line of file.split("\n")){
        line = line.trim();
        if(line){
            const parts = line.split(" ");
            map.set(`${parts[1]}.${searchDomain}`.toLowerCase(), parts[0]);
        }
    }
    return map;
}

type CloudFlareDNSRecord = {
    id: string;
    zone_id: string;
    zone_name: string;
    name: string;
    type: Exclude<CloudFlare.RecordTypes, 'MX' | 'SRV' | 'URI'>;
    content: string;
    proxiable: boolean;
    proxied: boolean;
    ttl: number;
    locked: boolean;
    meta: object;
    created_on: string;
    modified_on: string;
}

type CloudFlareDNSBrowseResponse = {
    result: CloudFlareDNSRecord[];
}

export async function syncDNSToCloudFlare(newHostsFile: string, cfAPIToken: string, zone: string, searchDomain: string) {
    const cf = new CloudFlare({ token: cfAPIToken })
    const records = await cf.dnsRecords.browse(zone) as CloudFlareDNSBrowseResponse;
    const vpcRecords = records.result.filter(record => record.type === 'A' && record.name.endsWith(".vpc.ripley.cloud"));

    const newHosts = await hostsToMap(newHostsFile, searchDomain);
    for (const [hostname, ip] of newHosts) {
        const existingRecord = vpcRecords.find(eachRecord => eachRecord.name.toLowerCase() === hostname);
        if(!existingRecord){
            await cf.dnsRecords.add(zone, {name: hostname, content: ip, type: 'A', ttl: 1 })
        } else if(existingRecord.content !== ip){
            existingRecord.content = ip;
            await cf.dnsRecords.edit(zone, existingRecord.id, existingRecord);
        }
    }
    for(const record of vpcRecords){
        if(!newHosts.has(record.name.toLowerCase())){
            await cf.dnsRecords.del(zone, record.id);
        }
    }

}