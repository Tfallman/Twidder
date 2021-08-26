from selenium import webdriver
from webdriver_manager.chrome import ChromeDriverManager
import time


LOGIN_URL = "http://127.0.0.1:5000/"
loginEmail = "jerome@hotmail.com"
loginPassword = #your current password
searchEmail = "kajsaanka@hotmail.com"
newPasswordString = #your new password

class twidderLogin():
    def __init__(self):

        self.driver = webdriver.Chrome(executable_path=ChromeDriverManager().install())
        self.driver.get(LOGIN_URL)
        time.sleep(2) # Wait for some time to load

    def login(self):
        email_element = self.driver.find_element_by_id("username")
        email_element.send_keys(loginEmail) # Give keyboard input
        password_element = self.driver.find_element_by_id("password")
        password_element.send_keys(loginPassword) # Give password as input too
        login_button = self.driver.find_element_by_id('loginbutton')
        login_button.click() # Send mouse click

        time.sleep(2) # Wait for 2 seconds for the page to show up

    def searchForUSer(self):

        browseButton = self.driver.find_element_by_id("browseButton")
        browseButton.click()
        search_element = self.driver.find_element_by_id("searchUser")
        search_element.send_keys(searchEmail)
        searchButton = self.driver.find_element_by_id("userSearchButton")
        searchButton.click()

        time.sleep(2)

    def sendTwiid(self):
        homeButton = self.driver.find_element_by_id("defaultOpen")
        homeButton.click()

        sendTwiid = self.driver.find_element_by_id("textArea")
        sendTwiid.send_keys("This is a another test message from Selenium")
        sendTwiidButton = self.driver.find_element_by_id("sendTwiidButton")
        sendTwiidButton.click()

        refreshButton = self.driver.find_element_by_id("refreshButton")
        refreshButton.click()

        time.sleep(2)
    def changePassword(self):
        accountButton = self.driver.find_element_by_id("accountButton")
        accountButton.click()
        oldPassword = self.driver.find_element_by_id("oldPassword")
        oldPassword.send_keys(loginPassword)

        newPassword = self.driver.find_element_by_id("passwordReg")
        newPasswordAgain = self.driver.find_element_by_id("passwordReg2")
        newPassword.send_keys(newPasswordString)
        newPasswordAgain.send_keys(newPasswordString)
        changePasswordButton = self.driver.find_element_by_id("changePasswordButton")
        changePasswordButton.click()
        time.sleep(2)

    def logOut(self):
        accountButton = self.driver.find_element_by_id("accountButton")
        accountButton.click()
        signOutButton = self.driver.find_element_by_id("signOut")

        signOutButton.click()



if __name__ == '__main__':
    twidder_login = twidderLogin()
    twidder_login.login()
    twidder_login.searchForUSer()
    twidder_login.sendTwiid()
    twidder_login.changePassword()
    twidder_login.logOut()
