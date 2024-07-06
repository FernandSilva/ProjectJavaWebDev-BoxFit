import { useWindowSize } from "@uidotdev/usehooks";
import { IoMdArrowBack } from "react-icons/io";
import Select from "react-select";

const options = [
  { value: "public", label: "Public" },
  { value: "private", label: "Private" },
];
const ProfileSetting = ({ setSteps }: { setSteps?: any }) => {
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
            Profile Setting
          </p>
        </div>
      </div>
      <div className="px-[20px] pt-[40px] sm:pt-[60px]">
        <div className="flex flex-col gap-6 sm:gap-10 border border-solid rounded-[10px] px-[30px]  py-[20px]">
          <div>
            <div className="flex flex-col gap-2">
              <p className="font-bold">Profile Visibility</p>
              <Select options={options} className="sm:w-[350px]" />
            </div>
          </div>
          <div className="flex gap-2">
            <input type="checkbox" />
            <p className="font-bold">Activity Status</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetting;
