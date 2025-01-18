import { useCallback, useEffect, useState } from "react";
import { FileWithPath, useDropzone } from "react-dropzone";
import { Button } from "@/components/ui";
import { convertFileToUrl } from "@/lib/utils";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type FileUploaderProps = {
  fieldChange: (files: File[]) => void;
  mediaUrl: string[];
};

const FileUploader = ({ fieldChange, mediaUrl }: FileUploaderProps) => {
  const [fileUrls, setFileUrls] = useState<Array<{ url: string; type: string }>>([]);
  const [fileTypes, setFileTypes] = useState<string[]>([]);
  const [cleanUrls, setCleanUrls] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handle existing media URLs
  useEffect(() => {
    if (mediaUrl) {
      const types: string[] = [];
      const urls: string[] = [];

      mediaUrl.forEach((url: string) => {
        const typeStartIndex = url.indexOf("?type=");
        let typeMatch = "unknown";

        if (typeStartIndex !== -1) {
          const typeEndIndex = url.indexOf("&", typeStartIndex);
          typeMatch = typeEndIndex !== -1 ? url.substring(typeStartIndex + 6, typeEndIndex) : url.substring(typeStartIndex + 6);
        }

        types.push(typeMatch.split("/")[0]);
        const cleanUrl = url.replace(/\?type=[^&]*(&|$)/, "").replace(/\?$/, "");
        urls.push(cleanUrl);
      });

      setFileTypes(types);
      setCleanUrls(urls);
    }
  }, [mediaUrl]);

  // Handle dropped files
  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[]) => {
      setErrorMessage(null);
      const validFiles = acceptedFiles.filter((file) =>
        ["image/png", "image/jpeg", "image/jpg", "video/mp4"].includes(file.type)
      );

      if (validFiles.length === 0) {
        toast.error("No valid files uploaded.");
        return;
      }

      fieldChange(validFiles);
      const newFileUrls = validFiles.map((file) => convertFileToUrl(file));
      setFileUrls(newFileUrls);
    },
    [fieldChange]
  );

  // Handle rejected files
  const onDropRejected = useCallback(() => {
    toast.error("Only .png, .jpeg, .jpg, and .mp4 files are allowed.", {
      position: "top-center",
    });
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
    <div
      {...getRootProps()}
      className="flex flex-center h-full w-full flex-col border border-gray-300 border-dashed rounded-xl cursor-pointer p-5"
    >
      <input {...getInputProps()} className="cursor-pointer" />
      {errorMessage && <div className="text-red-500 mb-4">{errorMessage}</div>}
      {fileUrls.length > 0 || mediaUrl?.length > 0 ? (
        <>
          <div className="flex flex-wrap justify-center w-full gap-4">
            {mediaUrl && fileUrls.length === 0
              ? cleanUrls.map((url, index) => (
                  <div key={index} className="flex gap-2">
                    {fileTypes[index] === "video" ? (
                      <video className="h-20 md:h-28 rounded-lg" src={url} loop />
                    ) : (
                      <img className="h-20 md:h-28 rounded-lg" src={url} alt="File preview" />
                    )}
                  </div>
                ))
              : fileUrls.map((file, index) => (
                  <div key={index} className="flex gap-2">
                    {file.type.startsWith("video") ? (
                      <video className="rounded-lg" src={file.url} controls />
                    ) : (
                      <img className="rounded-lg" src={file.url} alt={`file ${index}`} />
                    )}
                  </div>
                ))}
          </div>
          <p className="mt-4 text-center text-sm">Click or drag files to replace</p>
        </>
      ) : (
        <div className="text-center">
          <img
            src="/assets/icons/file-upload.jpeg"
            alt="file upload"
            className="w-3/4 max-w-xs mx-auto"
          />
          <h3 className="text-lg mt-4">Drag photos or videos here</h3>
          <p className="text-gray-500 text-sm mb-4">PNG, JPG, MP4, JPEG</p>
          <Button className="bg-gray-800 text-white">Select from device</Button>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default FileUploader;
