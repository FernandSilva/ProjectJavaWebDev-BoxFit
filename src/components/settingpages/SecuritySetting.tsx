const SecuritySetting = () => {
  return (
    <div className="w-[100%]">
      <div className=" px-[20px] pt-[30px] pb-[14px] border-b border-solid">
        <div>
          <p className="text-[14px] font-bold md:text-[24px]">
            Security Setting
          </p>
        </div>
      </div>
      <div className="px-[20px] pt-[110px]">
        <div className="flex flex-col  gap-6 border border-solid rounded-[10px] px-[30px]  py-[20px]">
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
