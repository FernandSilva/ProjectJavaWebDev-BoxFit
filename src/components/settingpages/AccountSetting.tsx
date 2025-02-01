import { useWindowSize } from "@uidotdev/usehooks";
import { IoMdArrowBack } from "react-icons/io";

const AccountSetting = ({ setSteps }: { setSteps?: React.Dispatch<React.SetStateAction<number>> }) => {
  const { width } = useWindowSize();
  return (
    <div className="w-[100%]">
      <div className="flex items-center gap-2 px-[20px] pt-[30px] pb-[14px] border-b border-solid">
        {width < 640 && (
          <div>
            <IoMdArrowBack onClick={() => setSteps && setSteps(0)} />
          </div>
        )}
        <div>
          <p className="text-[18px] font-bold sm:text-[24px]">Account Setting</p>
        </div>
      </div>
      <div className="flex px-[30px] pt-[40px] sm:pt-[60px]">
        <div className="w-[100%] border border-solid rounded-[10px] py-[40px] px-[20px] sm:p-[40px] flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <p className="font-bold">Change Password</p>
            <input type="password" className="border border-solid sm:w-[350px] py-[3px] rounded-[5px]" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="font-bold">Change Email</p>
            <input type="email" className="border border-solid sm:w-[350px] py-[3px] rounded-[5px]" />
          </div>
          <div className="pt-[15px] flex justify-end">
            <button className="hover:!text-white">Update</button>
            <button>Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSetting;
