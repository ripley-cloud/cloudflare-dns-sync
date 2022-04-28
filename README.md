## cloudflare-dns-sync

Super simple NodeJS utility to sync an /etc/hosts file to CloudFlare DNS. Assumes input file uses a single space to separate hostname from IP.

Configuration by .env:
```
CLOUDFLARE_TOKEN=#generate an API token on cloudflare
ZONE=#copy zone ID from cloudflare admin panel for your site
SEARCH_DOMAIN=#a search domain that will be appended to each hostname in the input file
```
