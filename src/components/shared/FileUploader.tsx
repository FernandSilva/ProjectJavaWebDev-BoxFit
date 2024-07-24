import { useCallback, useEffect, useState } from "react";
import { FileWithPath, useDropzone } from "react-dropzone";
import { Button } from "@/components/ui";
import { convertFileToUrl } from "@/lib/utils";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type FileUploaderProps = {
  fieldChange: (files: File[]) => void;
  mediaUrl: string[];
};

const FileUploader = ({ fieldChange, mediaUrl }: FileUploaderProps) => {
  const [fileUrls, setFileUrls] = useState<Array<{ url: string; type: string }>>([]);
  const [fileTypes, setFileTypes] = useState<string[]>([]);
  const [cleanUrls, setCleanUrls] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (mediaUrl) {
      const types: string[] = [];
      const urls: string[] = [];

      mediaUrl.forEach((url: string) => {
        // Extract the type parameter from the URL
        const typeStartIndex = url.indexOf("?type=");
        let typeMatch = "unknown";
        if (typeStartIndex !== -1) {
          const typeEndIndex = url.indexOf("&", typeStartIndex);
          typeMatch = typeEndIndex !== -1 ? url.substring(typeStartIndex + 6, typeEndIndex) : url.substring(typeStartIndex + 6);
        }

        types.push(typeMatch.split("/")[0]);

        // Remove the type parameter from the URL and the last question mark if it's at the end
        const cleanUrl = url.replace(/\?type=[^&]*(&|$)/, "").replace(/\?$/, "");
        urls.push(cleanUrl);
      });

      setFileTypes(types);
      setCleanUrls(urls);
    }
  }, [mediaUrl]);

  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[]) => {
      setErrorMessage(null); // Clear any previous error messages
      const validFiles = acceptedFiles.filter((file) =>
        ["image/png", "image/jpeg", "image/jpg", "video/mp4"].includes(file.type)
      );

      fieldChange(validFiles);

      const newFileUrls = validFiles.map((file) => convertFileToUrl(file));
      setFileUrls(newFileUrls);
    },
    [fieldChange]
  );

  const onDropRejected = useCallback((fileRejections) => {
    toast.error("Only files with extensions .png, .jpeg, .jpg, .mp4 are allowed.",{
      position:"top-center",
    })
    
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    onDropRejected,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpeg", ".jpg"],
      "video/mp4": [".mp4"],
    },
    multiple: true,
  });

  return (
    <div {...getRootProps()} className="flex flex-center h-[20rem] flex-col border border-gray-300 border-dashed rounded-xl cursor-pointer">
      <input {...getInputProps()} className="cursor-pointer" />
      {errorMessage && (
        <div className="error-message text-red-500 mb-4">
          {errorMessage}
        </div>
      )}
      {fileUrls?.length > 0 || mediaUrl?.length > 0 ? (
        <>
          <div className="flex gap-2 flex-1 justify-center w-full p-5 lg:p-10 flex-wrap">
            {mediaUrl && fileUrls.length === 0
              ? cleanUrls.map((url, index) => (
                  <div key={index} className="file_uploader-img-wrapper flex gap-2">
                    {fileTypes[index] === "video" ? (
                      <video className="h-[50px] md:h-[70px] rounded-[10px]" src={url} loop />
                    ) : fileTypes[index] === "image" ? (
                      <img className="h-[50px] md:h-[70px] rounded-[10px]" src={url} alt="File preview" />
                    ) : (
                      <p>Unknown file type</p>
                    )}
                  </div>
                ))
              : fileUrls.map((file, index) => (
                  <div key={index} className="file_uploader-img-wrapper flex gap-2">
                    {file.type.startsWith("video") ? (
                      <video src={file.url} controls className="file_uploader-img" />
                    ) : (
                      <img src={file.url} alt={`file ${index}`} className="file_uploader-img" />
                    )}
                  </div>
                ))}
          </div>
          <p className="file_uploader-label">Click or drag files to replace</p>
        </>
      ) : (
        <div className="file_uploader-box">
          <img src="/assets/icons/file-upload.svg" width={96} height={77} alt="file upload" />
          <h3 className="base-medium text-light-2 mb-2 mt-6">Drag photos or videos here</h3>
          <p className="text-light-4 small-regular mb-6">SVG, PNG, JPG, MP4, JPEG</p>
          <Button type="button" className="shad-button_dark_4">
            Select from computer
          </Button>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default FileUploader;
