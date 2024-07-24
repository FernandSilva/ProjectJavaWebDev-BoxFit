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
import { useWindowSize } from "@uidotdev/usehooks";
import { useState } from "react";
import { CgProfile } from "react-icons/cg";
import { FaShieldAlt } from "react-icons/fa";
import { IoNotificationsOutline } from "react-icons/io5";
import { MdOutlineSecurity } from "react-icons/md";
import { FaMobileScreen } from "react-icons/fa6";
import { BiSupport } from "react-icons/bi";
import { IoSettingsOutline } from "react-icons/io5";
import { FaBookOpen } from "react-icons/fa";
import { MdOutlineWbSunny } from "react-icons/md";

const Settings = () => {
  const { width } = useWindowSize();
  const [Steps, setSteps] = useState<string>("accountsetting");
  const [MobileSteps, setMobileSteps] = useState<number>(0);

  return (
    <>
      {width < 640 && (
        <div className="">
          {MobileSteps === 0 && (
            <div className="settings-container  w-[100%] !py-0">
              <h2 className="h3-bold md:h2-bold text-left w-full border-b border-gray-300 pb-2">
                Settings
              </h2>
              <div className="settings-section">
                <h3
                  className="flex gap-[6px] items-center settings-subtitle hover:text-green-500"
                  onClick={() => {
                    setSteps("accountsetting");
                    setMobileSteps(1);
                  }}
                >
                  <CgProfile /> Account Settings
                </h3>
              </div>
              <div className="settings-section">
                <h3
                  className="flex gap-[6px] items-center settings-subtitle hover:text-green-500"
                  onClick={() => {
                    setSteps("profilesetting");
                    setMobileSteps(1);
                  }}
                >
                  <IoSettingsOutline /> Profile Settings
                </h3>
              </div>
              <div className="settings-section">
                <h3
                  className="flex gap-[6px] items-center settings-subtitle hover:text-green-500"
                  onClick={() => {
                    setSteps("privacysetting");
                    setMobileSteps(1);
                  }}
                >
                  <FaShieldAlt className="text-[18px]" /> Privacy Settings
                </h3>
              </div>
              <div className="settings-section">
                <h3
                  className="flex gap-[6px] items-center settings-subtitle hover:text-green-500"
                  onClick={() => {
                    setSteps("notificationsetting");
                    setMobileSteps(1);
                  }}
                >
                  <IoNotificationsOutline /> Notification Settings
                </h3>
              </div>
              <div className="settings-section">
                <h3
                  className="flex gap-[6px] items-center settings-subtitle hover:text-green-500"
                  onClick={() => {
                    setSteps("securitysetting");
                    setMobileSteps(1);
                  }}
                >
                  <MdOutlineSecurity /> Security Settings
                </h3>
              </div>
              <div className="settings-section">
                <h3
                  className="flex gap-[6px] items-center settings-subtitle hover:text-green-500"
                  onClick={() => {
                    setSteps("appearancesetting");
                    setMobileSteps(1);
                  }}
                >
                  <MdOutlineWbSunny className="text-[22px]" /> Appearance
                  Settings
                </h3>
              </div>
              <div className="settings-section">
                <h3
                  className="flex gap-[6px] items-center settings-subtitle hover:text-green-500"
                  onClick={() => {
                    setSteps("contentsetting");
                    setMobileSteps(1);
                  }}
                >
                  <FaBookOpen /> Content Settings
                </h3>
              </div>
              <div className="settings-section">
                <h3
                  className="flex gap-[6px] items-center settings-subtitle hover:text-green-500"
                  onClick={() => {
                    setSteps("connectionsetting");
                    setMobileSteps(1);
                  }}
                >
                  <FaMobileScreen /> Connection Settings
                </h3>
              </div>
              <div className="settings-section">
                <h3
                  className="flex gap-[6px] items-center settings-subtitle hover:text-green-500"
                  onClick={() => {
                    setSteps("helpandsupport");
                    setMobileSteps(1);
                  }}
                >
                  <BiSupport /> Help & Support
                </h3>
              </div>
            </div>
          )}
          {MobileSteps === 1 && (
            <div className="">
              {Steps === "accountsetting" && (
                <AccountSetting setSteps={setMobileSteps} />
              )}
              {Steps === "profilesetting" && (
                <ProfileSetting setSteps={setMobileSteps} />
              )}
              {Steps === "privacysetting" && (
                <PrivacySetting setSteps={setMobileSteps} />
              )}
              {Steps === "notificationsetting" && (
                <NotificationSetting setSteps={setMobileSteps} />
              )}
              {Steps === "securitysetting" && (
                <SecuritySetting setSteps={setMobileSteps} />
              )}
              {Steps === "appearancesetting" && (
                <AppearanceSetting setSteps={setMobileSteps} />
              )}
              {Steps === "contentsetting" && (
                <ContentSetting setSteps={setMobileSteps} />
              )}
              {Steps === "connectionsetting" && (
                <ConnectionSetting setSteps={setMobileSteps} />
              )}
              {Steps === "helpandsupport" && (
                <HelpAndSupport setSteps={setMobileSteps} />
              )}
            </div>
          )}
        </div>
      )}
      {width > 640 && (
        <div className="flex w-[100%]">
          <div className="mt-[15px] py-4 border-r border-solid w-[30%]">
            <h2 className="h3-bold px-[20px] md:h2-bold text-left w-full border-b border-gray-300 pb-2">
              Settings
            </h2>
            <div className="settings-section">
              <div
                className=" flex items-center gap-2 !pl-[20px] settings-subtitle hover:text-green-500"
                onClick={() => setSteps("accountsetting")}
              >
                <CgProfile /> Account Settings
              </div>
            </div>
            <div className="settings-section">
              <div
                className="flex items-center gap-2 !pl-[20px] settings-subtitle hover:text-green-500"
                onClick={() => {
                  setSteps("profilesetting");
                }}
              >
                <IoSettingsOutline /> Profile Settings
              </div>
            </div>
            <div className="settings-section">
              <div
                className="flex items-center gap-2 !pl-[20px] settings-subtitle hover:text-green-500"
                onClick={() => setSteps("privacysetting")}
              >
                <FaShieldAlt className="text-[18px]" /> Privacy Settings
              </div>
            </div>
            <div className="settings-section">
              <div
                className="flex items-center gap-2 !pl-[20px] settings-subtitle hover:text-green-500"
                onClick={() => {
                  setSteps("notificationsetting");
                }}
              >
                <IoNotificationsOutline /> Notification Settings
              </div>
            </div>
            <div className="settings-section">
              <div
                className="flex items-center gap-2 !pl-[20px] settings-subtitle hover:text-green-500"
                onClick={() => {
                  setSteps("securitysetting");
                }}
              >
                <MdOutlineSecurity /> Security Settings
              </div>
            </div>
            <div className="settings-section">
              <h3
                className="flex items-center gap-2 !pl-[18px] settings-subtitle hover:text-green-500"
                onClick={() => {
                  setSteps("appearancesetting");
                }}
              >
                <MdOutlineWbSunny className="text-[22px]" /> Appearance Settings
              </h3>
            </div>
            <div className="settings-section">
              <div
                className="flex items-center gap-2 !pl-[20px] settings-subtitle hover:text-green-500"
                onClick={() => {
                  setSteps("contentsetting");
                }}
              >
                <FaBookOpen /> Content Settings
              </div>
            </div>
            <div className="settings-section">
              <div
                className="flex items-center gap-2 !pl-[20px] settings-subtitle hover:text-green-500"
                onClick={() => {
                  setSteps("connectionsetting");
                }}
              >
                <FaMobileScreen /> Connection Settings
              </div>
            </div>
            <div className="settings-section">
              <div
                className="flex items-center gap-2 !pl-[20px] settings-subtitle hover:text-green-500"
                onClick={() => {
                  setSteps("helpandsupport");
                }}
              >
                <BiSupport /> Help & Support
              </div>
            </div>
          </div>
          <div className="w-[70%]">
            {Steps === "accountsetting" && (
              <AccountSetting setSteps={setSteps} />
            )}
            {Steps === "profilesetting" && <ProfileSetting />}
            {Steps === "privacysetting" && <PrivacySetting />}
            {Steps === "notificationsetting" && <NotificationSetting />}
            {Steps === "securitysetting" && <SecuritySetting />}
            {Steps === "appearancesetting" && <AppearanceSetting />}
            {Steps === "contentsetting" && <ContentSetting />}
            {Steps === "connectionsetting" && <ConnectionSetting />}
            {Steps === "generalsetting" && <GeneralSetting />}
            {Steps === "helpandsupport" && <HelpAndSupport />}
          </div>
        </div>
      )}
    </>
  );
};

export default Settings;
