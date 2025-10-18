from time import sleep
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
import chromedriver_autoinstaller

chromedriver_autoinstaller.install()

chrome_options = Options()
chrome_options.add_argument(
    "user-data-dir=./private_browser_profile"
)  # This directory will store the profile
driver = webdriver.Chrome(options=chrome_options)


driver = webdriver.Chrome()


web = "https://syllabus.byu.edu"
driver.get(web)

# Example wait for an element to be visible (adjust as needed)
element_username = WebDriverWait(driver, 10).until(
    EC.visibility_of_element_located((By.ID, "username"))
)
element_password = WebDriverWait(driver, 10).until(
    EC.visibility_of_element_located((By.ID, "password"))
)

WebDriverWait(driver, 300).until(EC.url_matches("https://syllabus.byu.edu"))

sleep(30)
