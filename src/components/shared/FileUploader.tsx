import { useCallback, useEffect, useState } from "react";
import { FileWithPath, useDropzone } from "react-dropzone";

import { Button } from "@/components/ui";
import { convertFileToUrl } from "@/lib/utils";

type FileUploaderProps = {
  fieldChange: (files: File[]) => void;
  mediaUrl: string[];
};

const FileUploader = ({ fieldChange, mediaUrl }: FileUploaderProps) => {
  const [fileUrls, setFileUrls] = useState<
    Array<{ url: string; type: string }>
  >([]);
  console.log({ mediaUrl });

  const [fileTypes, setFileTypes] = useState<string[]>([]);
  const [cleanUrls, setCleanUrls] = useState<string[]>([]);
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
          typeMatch =
            typeEndIndex !== -1
              ? url.substring(typeStartIndex + 6, typeEndIndex)
              : url.substring(typeStartIndex + 6);
        }

        console.log(`URL: ${url}, Type: ${typeMatch}`); // Log the URL and extracted type
        types.push(typeMatch.split("/")[0]);

        // Remove the type parameter from the URL and the last question mark if it's at the end
        const cleanUrl = url
          .replace(/\?type=[^&]*(&|$)/, "")
          .replace(/\?$/, "");
        urls.push(cleanUrl);
      });

      setFileTypes(types);
      setCleanUrls(urls);
    }
  }, [mediaUrl]);
  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[]) => {
      fieldChange(acceptedFiles);

      const newFileUrls = acceptedFiles.map((file) => convertFileToUrl(file));
      setFileUrls(newFileUrls);
    },
    [fieldChange]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpeg", ".jpg"],
      "video/mp4": [".mp4"],
    },
    multiple: true,
  });

  return (
    <div
      {...getRootProps()}
      className="flex flex-center h-[20rem] flex-col border border-gray-300 border-dashed rounded-xl cursor-pointer"
    >
      <input {...getInputProps()} className="cursor-pointer" />
      {fileUrls?.length > 0 || mediaUrl?.length > 0 ? (
        <>
          <div className="flex gap-2 flex-1 justify-center w-full p-5 lg:p-10 flex-wrap">
            {mediaUrl && fileUrls.length === 0
              ? cleanUrls.map((url, index) => {
                  return (
                    <div
                      key={index}
                      className="file_uploader-img-wrapper flex gap-2"
                    >
                      {fileTypes[index] === "video" && (
                        <video
                          className="h-[50px] md:h-[70px] rounded-[10px]"
                          src={url}
                          loop
                        />
                      )}
                      {fileTypes[index] === "image" && (
                        <img
                          className="h-[50px] md:h-[70px] rounded-[10px]"
                          src={url}
                          alt="File preview"
                        />
                      )}
                      {fileTypes[index] === "unknown" && (
                        <p>Unknown file type</p>
                      )}
                    </div>
                  );
                })
              : fileUrls.map((file, index) => (
                  <div
                    key={index}
                    className="file_uploader-img-wrapper flex gap-2"
                  >
                    {file.type.startsWith("video") ? (
                      <video
                        src={file.url}
                        controls
                        className="file_uploader-img"
                      />
                    ) : (
                      <img
                        src={file.url}
                        alt={`file ${index}`}
                        className="file_uploader-img"
                      />
                    )}
                  </div>
                ))}
          </div>
          <p className="file_uploader-label">Click or drag files to replace</p>
        </>
      ) : (
        <div className="file_uploader-box">
          <img
            src="/assets/icons/file-upload.svg"
            width={96}
            height={77}
            alt="file upload"
          />
          <h3 className="base-medium text-light-2 mb-2 mt-6">
            Drag photos or videos here
          </h3>
          <p className="text-light-4 small-regular mb-6">SVG, PNG, JPG, MP4</p>
          <Button type="button" className="shad-button_dark_4">
            Select from computer
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
