import { useWindowSize } from "@uidotdev/usehooks";
import { IoMdArrowBack } from "react-icons/io";
import Select from "react-select";

const options = [
  { value: "popular", label: "Popular" },
  { value: "latest", label: "Latest" },
];
const ContentSetting = ({ setSteps }: { setSteps?: any }) => {
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
            Content Setting
          </p>
        </div>
      </div>
      <div className="px-[20px] pt-[40px] sm:pt-[60px]">
        <div className="flex flex-col gap-4 sm:gap-6 border border-solid rounded-[10px] px-[20px] sm:px-[30px]  py-[20px]">
          
            <div className="flex flex-col gap-2">
              <p className="font-bold">Content Preferences</p>
              <Select options={options} className="sm:w-[350px]" />
            </div>
            <div className="flex flex-col gap-1">
            <p className="font-bold">Mute words</p>
            <input
              type="text"
              className="border border-solid sm:w-[350px] py-[3px] rounded-[5px]"
            />
          </div>
          <div className="flex gap-3">
            <input type="checkbox" />
            <p className="font-bold">Autoplay video</p>
          </div>
          
          <div className="flex justify-end">
            <button className="settings-button hover:text-black">
              Update settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentSetting;
