import { useWindowSize } from "@uidotdev/usehooks";
import { IoMdArrowBack } from "react-icons/io";

const ConnectionSetting = ({ setSteps }: { setSteps?: any }) => {
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
            Connection Setting
          </p>
        </div>
      </div>
      <div className="px-[20px] pt-[40px] sm:pt-[60px]">
        <div className="flex flex-col gap-4 sm:gap-6 border border-solid rounded-[10px] px-[20px] sm:px-[30px]  py-[20px]">
          <div>
            <button className="settings-button hover:text-black">
              Manage Connected App
            </button>
          </div>
          <div>
            <button className="settings-button hover:text-black">
              Manage Social Media Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionSetting;
