import Select from 'react-select'

const themeoptions = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'custom', label: 'Custom' }
  ]
const languageoptions = [
    { value: 'english', label: 'English' },
    { value: 'spanish', label: 'Spanish' }
  ]
const AppearanceSetting = () => {
  return (
    <div className="w-[100%]">
      <div className=" px-[20px] pt-[30px] pb-[14px] border-b border-solid">
        <div>
          <p className="text-[14px] font-bold md:text-[24px]">
            Appearance Setting
          </p>
        </div>
      </div>
      <div className='px-[20px] pt-[110px]'>

      
      <div className='flex flex-col  gap-6 border border-solid rounded-[10px] px-[30px]  py-[20px]'>
        <div>
            <div className='flex flex-col gap-2'>
                <p className='font-bold'>Theme</p>
            <Select options={themeoptions} className='w-[350px]'/>
            </div>
        </div>
        <div>
            <div className='flex flex-col gap-2'>
                <p className='font-bold'>Langauge</p>
            <Select options={languageoptions} className='w-[350px]'/>
            </div>
        </div>
        <div className="flex justify-end">
            <button className="settings-button hover:text-black">
              Update settings
            </button>
          </div>
        
      </div>
      </div>
    </div>
  )
}

export default AppearanceSetting
