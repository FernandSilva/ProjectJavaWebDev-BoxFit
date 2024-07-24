import { TailSpin } from "react-loader-spinner";
const Loader = () => (
  <div className="flex-center w-full">
    <TailSpin
      visible={true}
      height="24"
      width="24"
      color="#555"
      ariaLabel="tail-spin-loading"
      radius="1"
      wrapperStyle={{}}
      wrapperClass=""
    />
  </div>
);

export default Loader;
