
## Setup Instructions

1. **Create a virtual environment**
   It’s recommended to use a virtual environment to isolate dependencies.

   ```sh
   python3 -m venv .venv
   source .venv/bin/activate
   ```

2. **Install dependencies**
   While withing the activated venv use `pip` to install required packages listed in `requirements.txt`:

   ```sh
   pip install -r requirements.txt
   ```

3. **Run your scraper**
   For example:

   ```sh
   python get_all_programs.py
   ```



## Data

The file `programs.json` was copied by visiting `https://catalog.byu.edu/programs?page=1&pq=` with browser dev tools open and copying the response value of the appropriate request



curl 'https://app.coursedog.com/api/v1/cm/byu/programs?programGroupIds=34574&effectiveDatesRange=2025-09-03%2C2025-09-03&doNotDisplayAllMappedRevisionsAsDependencies=true&formatDependents=true&includeMappedDocumentItems=true' \
  -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:142.0) Gecko/20100101 Firefox/142.0' \
  -H 'Accept: application/json, text/plain, */*' \
  -H 'Accept-Language: en-US,en;q=0.5' \
  -H 'Accept-Encoding: gzip, deflate, br, zstd' \
  -H 'Referer: https://catalog.byu.edu/' \
  -H 'X-Requested-With: catalog' \
  -H 'Origin: https://catalog.byu.edu' \
  -H 'Sec-GPC: 1' \
  -H 'Sec-Fetch-Dest: empty' \
  -H 'Sec-Fetch-Mode: cors' \
  -H 'Sec-Fetch-Site: cross-site' \
  -H 'Connection: keep-alive'
