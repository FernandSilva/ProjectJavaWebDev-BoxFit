import { useWindowSize } from "@uidotdev/usehooks";
import { IoMdArrowBack } from "react-icons/io";

const SecuritySetting = ({ setSteps }: { setSteps?: any }) => {
    const { width } = useWindowSize();

  return (
    <div className="w-[100%]">
      <div className="flex items-center gap-2 px-[20px] pt-[30px] pb-[14px] border-b border-solid">
      {width < 640 && (
          <div>
            <IoMdArrowBack onClick={() => setSteps(0)} />
          </div>
        )}
        <div>
          <p className="text-[18px] font-bold md:text-[24px]">
            Security Setting
          </p>
        </div>
      </div>
      <div className="px-[20px] pt-[40px] sm:pt-[60px]">
        <div className="flex flex-col gap-4 sm:gap-6 border border-solid rounded-[10px] px-[20px] sm:px-[30px]  py-[20px]">
          <div className="flex gap-2">
            <input type="checkbox" />
            <p className="font-bold">Two Factor Authentication (2FA)</p>
          </div>
          <div className="flex gap-2">
            <input type="checkbox" />
            <p className="font-bold">Login alert</p>
          </div>
          <div className="flex justify-end">
            <button className="settings-button hover:text-black">
              Manage App password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySetting;
