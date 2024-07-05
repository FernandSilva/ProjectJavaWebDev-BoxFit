
const NotificationSetting = () => {
  return (
    <div className="w-[100%]">
      <div className=" px-[20px] pt-[30px] pb-[14px] border-b border-solid">
        <div>
          <p className="text-[14px] font-bold md:text-[24px]">
            Notification Setting
          </p>
        </div>
      </div>
      <div className="px-[20px] pt-[110px]">
        <div className="flex flex-col  gap-6 border border-solid rounded-[10px] px-[30px]  py-[20px]">
          
          <div className="flex gap-3">
            <input type="checkbox" />
            <p className="font-bold">Push Notification</p>
          </div>
          <div className="flex gap-3">
            <input type="checkbox" />
            <p className="font-bold">Email Notification</p>
          </div>
          <div className="flex gap-3">
            <input type="checkbox" />
            <p className="font-bold">SMS Notification</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotificationSetting
