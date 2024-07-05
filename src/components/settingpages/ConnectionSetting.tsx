
const ConnectionSetting = () => {
  return (
    <div className="w-[100%]">
      <div className=" px-[20px] pt-[30px] pb-[14px] border-b border-solid">
        <div>
          <p className="text-[14px] font-bold md:text-[24px]">
            Connection Setting
          </p>
        </div>
      </div>
      <div className="px-[20px] pt-[110px]">
        <div className="flex flex-col  gap-6 border border-solid rounded-[10px] px-[30px]  py-[20px]">
          <div>
            <button className="settings-button hover:text-black">Manage Connected App</button>
           
          </div>
          <div>
            <button className="settings-button hover:text-black">Manage Social Media Link</button>
           
          </div>
          
        </div>
      </div>
    </div>
  )
}

export default ConnectionSetting
