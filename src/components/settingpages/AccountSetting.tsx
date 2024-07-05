const AccountSetting = ({ setSteps }: { setSteps?: any }) => {
  return (
    <div className="w-[100%]">
      <div className=" px-[20px] pt-[30px] pb-[14px] border-b border-solid">
        <div>
          <p className="text-[14px] font-bold md:text-[24px]">
            Account Setting
          </p>
        </div>
      </div>
      <div className="flex  px-[30px]  pt-[110px]">
        <div className="w-[100%] border border-solid rounded-[10px] p-[40px] flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <p className="font-bold">Change Password</p>
            <input
              type="password"
              className="border border-solid w-[350px] py-[3px] rounded-[5px]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <p className="font-bold">Change Email</p>
            <input
              type="email"
              className="border border-solid w-[350px] py-[3px] rounded-[5px]"
            />
          </div>
          <div className="pt-[15px] flex justify-end">
            <button className="hover:!text-white ">Update</button>
            <button>Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSetting;
