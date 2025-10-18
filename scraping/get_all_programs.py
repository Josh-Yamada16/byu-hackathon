import requests
import json  # Ensure the json module is imported

# I started by loading https://catalog.byu.edu/programs?page=1&pq= in a browser, and found the request that got the relvant data.
# used that as a starting point for creating this script.
# I doubt we need all of these headers, but didn't seem worth the time to narrow down which can be ommitted.
url = "https://app.coursedog.com/api/v1/cm/byu/programs/search/$filters?limit=312"
headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:142.0) Gecko/20100101 Firefox/142.0",
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "gzip, deflate, br, zstd",
    "Content-Type": "application/json",
    "Referer": "https://catalog.byu.edu/",
    "X-Requested-With": "catalog",
    "Origin": "https://catalog.byu.edu",
    "Sec-GPC": "1",
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "cross-site",
    "Connection": "keep-alive",
    "TE": "trailers",
}
data = {
    "condition": "AND",
    "filters": [
        {
            "filters": [
                {
                    "id": "level-program",
                    "condition": "field",
                    "name": "level",
                    "inputType": "select",
                    "group": "program",
                    "type": "isNot",
                    "value": "Doctoral",
                },
                {
                    "id": "level-program",
                    "condition": "field",
                    "name": "level",
                    "inputType": "select",
                    "group": "program",
                    "type": "isNot",
                    "value": "Graduate Minor",
                },
                {
                    "id": "level-program",
                    "condition": "field",
                    "name": "level",
                    "inputType": "select",
                    "group": "program",
                    "type": "isNot",
                    "value": "Masters",
                },
                {
                    "id": "degreeDesignation-program",
                    "condition": "field",
                    "name": "degreeDesignation",
                    "inputType": "select",
                    "group": "program",
                    "type": "isNot",
                    "value": "PBS",
                },
                {
                    "id": "code-program",
                    "condition": "field",
                    "name": "code",
                    "inputType": "text",
                    "group": "program",
                    "type": "isNot",
                    "value": "322619",
                },
                {
                    "id": "degreeDesignation-program",
                    "condition": "field",
                    "name": "degreeDesignation",
                    "inputType": "select",
                    "group": "program",
                    "type": "isNot",
                    "value": "PRE",
                },
                {
                    "id": "level-program",
                    "condition": "field",
                    "name": "level",
                    "inputType": "select",
                    "group": "program",
                    "type": "isNot",
                    "value": "Non Degree",
                },
                {
                    "id": "catalogDisplayName-program",
                    "condition": "field",
                    "name": "catalogDisplayName",
                    "inputType": "text",
                    "group": "program",
                    "type": "contains",
                    "value": "(",
                },
            ],
            "id": "kFsSkKHp",
            "condition": "and",
        }
    ],
}

response = requests.post(url, headers=headers, json=data)

if response.status_code == 200:
    with open("programs.json", "w") as f:
        json.dump(response.json(), f, indent=4)  # Save the response to programs.json
else:
    print(f"Error: {response.status_code}, {response.text}")
