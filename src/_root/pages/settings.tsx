import AccountSetting from "@/components/settingpages/AccountSetting";
import AppearanceSetting from "@/components/settingpages/AppearanceSetting";
import ConnectionSetting from "@/components/settingpages/ConnectionSetting";
import ContentSetting from "@/components/settingpages/ContentSetting";
import GeneralSetting from "@/components/settingpages/GeneralSetting";
import HelpAndSupport from "@/components/settingpages/HelpAndSupport";
import NotificationSetting from "@/components/settingpages/NotificationSetting";
import PrivacySetting from "@/components/settingpages/PrivacySetting";
import ProfileSetting from "@/components/settingpages/ProfileSetting";
import SecuritySetting from "@/components/settingpages/SecuritySetting";
import React, { useState } from "react";

const Settings = () => {
  const [theme, setTheme] = useState("light");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [profileVisibility, setProfileVisibility] = useState("public");
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [fontSize, setFontSize] = useState("medium");
  const [language, setLanguage] = useState("en");
  const [contentPreferences, setContentPreferences] = useState("popular");
  const [muteWords, setMuteWords] = useState("");
  const [autoplayVideos, setAutoplayVideos] = useState(true);
  const [Steps, setSteps] = useState<string>("accountsetting");

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    setTheme(e.target.value);
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setPassword(e.target.value);
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setEmail(e.target.value);
  const handleProfileVisibilityChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => setProfileVisibility(e.target.value);
  const handleFontSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    setFontSize(e.target.value);
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    setLanguage(e.target.value);
  const handleContentPreferencesChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => setContentPreferences(e.target.value);
  const handleMuteWordsChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setMuteWords(e.target.value);

  const [openSections, setOpenSections] = useState<string[]>([]);

  const toggleSection = (section: string) => {
    setOpenSections((prevSections) =>
      prevSections.includes(section)
        ? prevSections.filter((s) => s !== section)
        : [...prevSections, section]
    );
  };

  return (
    <div className="flex w-[100%]">
      <div className="settings-container border-r border-solid w-[20%]">
        <h2 className="h3-bold md:h2-bold text-left w-full border-b border-gray-300 pb-2">
          Settings
        </h2>

        <div className="settings-section">
          <h3
            className="settings-subtitle hover:text-green-500"
            onClick={() => setSteps("accountsetting")}
          >
            Account Settings
          </h3>
          {openSections.includes("account") && (
            <div className="settings-content">
              <div className="settings-item">
                <label className="settings-label">Change Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                  className="settings-input"
                />
              </div>
              <div className="settings-item">
                <label className="settings-label">Update Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  className="settings-input"
                />
              </div>
              <div className="settings-item">
                <button className="settings-button">Delete Account</button>
              </div>
            </div>
          )}
        </div>

        <div className="settings-section">
          <h3
            className="settings-subtitle hover:text-green-500"
            onClick={() => {
              setSteps("profilesetting");
            }}
          >
            Profile Settings
          </h3>
        </div>

        <div className="settings-section">
          <h3
            className="settings-subtitle hover:text-green-500"
            onClick={() => setSteps("privacysetting")}
          >
            Privacy Settings
          </h3>
        </div>

        <div className="settings-section">
          <h3
            className="settings-subtitle hover:text-green-500"
            onClick={() => {
              toggleSection("notifications");
              setSteps("notificationsetting");
            }}
          >
            Notification Settings
          </h3>
        </div>

        <div className="settings-section">
          <h3
            className="settings-subtitle hover:text-green-500"
            onClick={() => {
              setSteps("securitysetting");
            }}
          >
            Security Settings
          </h3>
        </div>

        <div className="settings-section">
          <h3
            className="settings-subtitle hover:text-green-500"
            onClick={() => {
              toggleSection("appearance");
              setSteps("appearancesetting");
            }}
          >
            Appearance Settings
          </h3>
        </div>

        <div className="settings-section">
          <h3
            className="settings-subtitle hover:text-green-500"
            onClick={() => {
              toggleSection("content");
              setSteps("contentsetting");
            }}
          >
            Content Settings
          </h3>
        </div>

        <div className="settings-section">
          <h3
            className="settings-subtitle hover:text-green-500"
            onClick={() => {
              setSteps("connectionsetting");
            }}
          >
            Connection Settings
          </h3>
        </div>

        <div className="settings-section">
          <h3
            className="settings-subtitle hover:text-green-500"
            onClick={() => {toggleSection("general")
              setSteps("generalsetting")
            }}
          >
            General Settings
          </h3>
          {openSections.includes("general") && (
            <div className="settings-content">
              <div className="settings-item">
                <label htmlFor="language-select" className="settings-label">
                  Language
                </label>
                <select
                  id="language-select"
                  value={language}
                  onChange={handleLanguageChange}
                  className="settings-select"
                >
                  <option value="en">English</option>
                  <option value="es">German</option>
                  {/* Add more languages as needed */}
                </select>
              </div>
              <div className="settings-item">
                <label className="settings-label">Time Zone</label>
                <input type="text" className="settings-input" />
              </div>
              <div className="settings-item">
                <label className="settings-label">Date and Time Format</label>
                <input type="text" className="settings-input" />
              </div>
            </div>
          )}
        </div>

        <div className="settings-section">
          <h3
            className="settings-subtitle hover:text-green-500"
            onClick={() => {toggleSection("help")
              setSteps("helpandsupport")
            }}
          >
            Help & Support
          </h3>
        </div>
      </div>
      <div className="w-[80%]">
        {Steps === "accountsetting" && <AccountSetting setSteps={setSteps} />}
        {Steps === "profilesetting" && <ProfileSetting />}
        {Steps === "privacysetting" && <PrivacySetting />}
        {Steps === "notificationsetting" && <NotificationSetting />}
        {Steps === "securitysetting" && <SecuritySetting />}
        {Steps === "appearancesetting" && <AppearanceSetting />}
        {Steps === "contentsetting" && <ContentSetting />}
        {Steps === "connectionsetting" && <ConnectionSetting />}
        {Steps==="generalsetting"&&<GeneralSetting />}
        {Steps==="helpandsupport"&&<HelpAndSupport />}
      </div>
    </div>
  );
};

export default Settings;
