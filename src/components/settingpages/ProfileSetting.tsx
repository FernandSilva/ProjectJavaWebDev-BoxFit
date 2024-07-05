import Select from 'react-select'

const options = [
    { value: 'public', label: 'Public' },
    { value: 'private', label: 'Private' }
  ]
const ProfileSetting = () => {
  return (
    <div className="w-[100%]">
      <div className=" px-[20px] pt-[30px] pb-[14px] border-b border-solid">
        <div>
          <p className="text-[14px] font-bold md:text-[24px]">
            Profile Setting
          </p>
        </div>
      </div>
      <div className='px-[20px] pt-[110px]'>

      
      <div className='flex flex-col  gap-10 border border-solid rounded-[10px] px-[30px]  py-[20px]'>
        <div>
            <div className='flex flex-col gap-2'>
                <p className='font-bold'>Profile Visibility</p>
            <Select options={options} className='w-[350px]'/>
            </div>
        </div>
        <div className='flex gap-2'>
            <input type="checkbox" />
            <p className='font-bold'>Activity Status</p>
        </div> 
        
      </div>
      </div>
    </div>
  )
}

export default ProfileSetting
