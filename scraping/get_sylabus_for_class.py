from time import sleep
import json
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
import chromedriver_autoinstaller

chromedriver_autoinstaller.install()

# pyright: reportUnusedCallResult=false

# if we provide these chrome options, we can use the same browser profile and avoid having to log in every time we run the script
chrome_options = Options()
chrome_options.add_argument("user-data-dir=./.private_browser_data")
chrome_options.add_argument("profile-directory=Default")
driver = webdriver.Chrome(options=chrome_options)

web = "https://syllabus.byu.edu"

driver.get(web)

try:
    # if we were redirected to the login page, we need to wait a few minutes for the user to log in manually
    element_username = WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.ID, "username"))
    )
    element_password = WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.ID, "password"))
    )
    WebDriverWait(driver, 300).until(EC.url_matches("https://syllabus.byu.edu"))
except:  # noqa
    # ignore the exception that would be thrown when we are already logged in and immediately load the syllabus page
    pass

WebDriverWait(driver, 10).until(EC.url_matches("https://syllabus.byu.edu"))

# click the button to open the list of teaching areas
WebDriverWait(driver, 10).until(
    EC.element_to_be_clickable(
        (By.XPATH, "//button/span[contains(text(), 'Select Teaching Area')]")
    )
)
button_select_teaching_area = driver.find_element(
    By.XPATH, "//button/span[contains(text(), 'Select Teaching Area')]"
)
button_select_teaching_area.click()

# get the names of all the teaching areas
teaching_areas: list[str] = []
list_items = WebDriverWait(driver, 10).until(
    EC.presence_of_all_elements_located((By.XPATH, "//ul/li[@role='option']"))
)
for item in list_items:
    teaching_areas.append(item.text.strip())
with open("teaching_areas.json", "w") as json_file:
    json.dump(teaching_areas, json_file)

sleep(30000)
