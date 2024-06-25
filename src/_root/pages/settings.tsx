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

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => setTheme(e.target.value);
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value);
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);
  const handleProfileVisibilityChange = (e: React.ChangeEvent<HTMLSelectElement>) => setProfileVisibility(e.target.value);
  const handleFontSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => setFontSize(e.target.value);
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => setLanguage(e.target.value);
  const handleContentPreferencesChange = (e: React.ChangeEvent<HTMLSelectElement>) => setContentPreferences(e.target.value);
  const handleMuteWordsChange = (e: React.ChangeEvent<HTMLInputElement>) => setMuteWords(e.target.value);

  const [openSections, setOpenSections] = useState<string[]>([]);

  const toggleSection = (section: string) => {
    setOpenSections((prevSections) =>
      prevSections.includes(section)
        ? prevSections.filter((s) => s !== section)
        : [...prevSections, section]
    );
  };

  return (
    <div className="settings-container">
      <h2 className="h3-bold md:h2-bold text-left w-full border-b border-gray-300 pb-2">Settings</h2>

      <div className="settings-section">
        <h3 className="settings-subtitle hover:text-green-500" onClick={() => toggleSection("account")}>
          Account Settings
        </h3>
        {openSections.includes("account") && (
          <div className="settings-content">
            <div className="settings-item">
              <label className="settings-label">Change Password</label>
              <input type="password" value={password} onChange={handlePasswordChange} className="settings-input" />
            </div>
            <div className="settings-item">
              <label className="settings-label">Update Email</label>
              <input type="email" value={email} onChange={handleEmailChange} className="settings-input" />
            </div>
            <div className="settings-item">
              <button className="settings-button">Delete Account</button>
            </div>
          </div>
        )}
      </div>

      <div className="settings-section">
        <h3 className="settings-subtitle hover:text-green-500" onClick={() => toggleSection("profile")}>
          Profile Settings
        </h3>
        {openSections.includes("profile") && (
          <div className="settings-content">
            <div className="settings-item">
              <label className="settings-label">Profile Visibility</label>
              <select value={profileVisibility} onChange={handleProfileVisibilityChange} className="settings-select">
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
            <div className="settings-item">
              <label className="settings-label">Activity Status</label>
              <input type="checkbox" />
            </div>
          </div>
        )}
      </div>

      <div className="settings-section">
        <h3 className="settings-subtitle hover:text-green-500" onClick={() => toggleSection("privacy")}>
          Privacy Settings
        </h3>
        {openSections.includes("privacy") && (
          <div className="settings-content">
            <div className="settings-item">
              <button className="settings-button">Manage Blocked Users</button>
            </div>
            <div className="settings-item">
              <label className="settings-label">Search Visibility</label>
              <input type="checkbox" />
            </div>
          </div>
        )}
      </div>

      <div className="settings-section">
        <h3 className="settings-subtitle hover:text-green-500" onClick={() => toggleSection("notifications")}>
          Notification Settings
        </h3>
        {openSections.includes("notifications") && (
          <div className="settings-content">
            <div className="settings-item">
              <label className="settings-label">Push Notifications</label>
              <input type="checkbox" checked={pushNotifications} onChange={() => setPushNotifications(!pushNotifications)} />
            </div>
            <div className="settings-item">
              <label className="settings-label">Email Notifications</label>
              <input type="checkbox" checked={emailNotifications} onChange={() => setEmailNotifications(!emailNotifications)} />
            </div>
            <div className="settings-item">
              <label className="settings-label">SMS Notifications</label>
              <input type="checkbox" checked={smsNotifications} onChange={() => setSmsNotifications(!smsNotifications)} />
            </div>
          </div>
        )}
      </div>

      <div className="settings-section">
        <h3 className="settings-subtitle hover:text-green-500" onClick={() => toggleSection("security")}>
          Security Settings
        </h3>
        {openSections.includes("security") && (
          <div className="settings-content">
            <div className="settings-item">
              <label className="settings-label">Two-Factor Authentication (2FA)</label>
              <input type="checkbox" checked={twoFactorAuth} onChange={() => setTwoFactorAuth(!twoFactorAuth)} />
            </div>
            <div className="settings-item">
              <label className="settings-label">Login Alerts</label>
              <input type="checkbox" checked={loginAlerts} onChange={() => setLoginAlerts(!loginAlerts)} />
            </div>
            <div className="settings-item">
              <button className="settings-button">Manage App Passwords</button>
            </div>
          </div>
        )}
      </div>

      <div className="settings-section">
        <h3 className="settings-subtitle hover:text-green-500" onClick={() => toggleSection("appearance")}>
          Appearance Settings
        </h3>
        {openSections.includes("appearance") && (
          <div className="settings-content">
            <div className="settings-item">
              <label htmlFor="theme-select" className="settings-label">Theme</label>
              <select id="theme-select" value={theme} onChange={handleThemeChange} className="settings-select">
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div className="settings-item">
              <label htmlFor="font-size-select" className="settings-label">Font Size</label>
              <select id="font-size-select" value={fontSize} onChange={handleFontSizeChange} className="settings-select">
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
            <div className="settings-item">
              <label htmlFor="language-select" className="settings-label">Language</label>
              <select id="language-select" value={language} onChange={handleLanguageChange} className="settings-select">
                <option value="en">English</option>
                <option value="es">Spanish</option>
                {/* Add more languages as needed */}
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="settings-section">
        <h3 className="settings-subtitle hover:text-green-500" onClick={() => toggleSection("content")}>
          Content Settings
        </h3>
        {openSections.includes("content") && (
          <div className="settings-content">
            <div className="settings-item">
              <label htmlFor="content-preferences-select" className="settings-label">Content Preferences</label>
              <select id="content-preferences-select" value={contentPreferences} onChange={handleContentPreferencesChange} className="settings-select">
                <option value="popular">Popular</option>
                <option value="latest">Latest</option>
              </select>
            </div>
            <div className="settings-item">
              <label className="settings-label">Mute Words</label>
              <input type="text" value={muteWords} onChange={handleMuteWordsChange} className="settings-input" />
            </div>
            <div className="settings-item">
              <label className="settings-label">Autoplay Videos</label>
              <input type="checkbox" checked={autoplayVideos} onChange={() => setAutoplayVideos(!autoplayVideos)} />
            </div>
          </div>
        )}
      </div>

      <div className="settings-section">
        <h3 className="settings-subtitle hover:text-green-500" onClick={() => toggleSection("connection")}>
          Connection Settings
        </h3>
        {openSections.includes("connection") && (
          <div className="settings-content">
            <div className="settings-item">
              <button className="settings-button">Manage Connected Apps</button>
            </div>
            <div className="settings-item">
              <button className="settings-button">Manage Social Media Links</button>
            </div>
          </div>
        )}
      </div>

      <div className="settings-section">
        <h3 className="settings-subtitle hover:text-green-500" onClick={() => toggleSection("general")}>
          General Settings
        </h3>
        {openSections.includes("general") && (
          <div className="settings-content">
            <div className="settings-item">
              <label htmlFor="language-select" className="settings-label">Language</label>
              <select id="language-select" value={language} onChange={handleLanguageChange} className="settings-select">
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
        <h3 className="settings-subtitle hover:text-green-500" onClick={() => toggleSection("help")}>
          Help & Support
        </h3>
        {openSections.includes("help") && (
          <div className="settings-content">
            <div className="settings-item">
              <button className="settings-button">FAQs</button>
            </div>
            <div className="settings-item">
              <button className="settings-button">Contact Support</button>
            </div>
            <div className="settings-item">
              <button className="settings-button">Report a Problem</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;




