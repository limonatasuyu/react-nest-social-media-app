import { Modal, Tag } from "antd";
import MapModal from "./map_modal";
import { SoundOutlined, FilePdfOutlined, PushpinOutlined } from "@ant-design/icons";
import { useState } from "react";

export function PostAttachments({ files, locations }: { files: any[]; locations: any[] }) {
  return (
    <div className="w-full mt-2 flex flex-col gap-2">
      {files.map((file, index) => {
        const fileType = file.mimeType.startsWith("image")
          ? "image"
          : file.mimeType.startsWith("audio")
            ? "audio"
            : "document";
        return (
          <>
            {fileType === "image" && <ImageModal key={index} imageId={file._id} />}
            {fileType === "audio" && <AudioTag key={index} audioId={file._id} mimeType={file.mimeType} />}
            {fileType === "document" && <DocumentTag key={index} fileId={file._id} fileName={file.name} />}
          </>
        );
      })}
      {locations?.map((location, index) => <LocationTag key={index} location={location} />)}
    </div>
  );
}

function LocationTag({ location }: { location: [number, number] }) {
  return (
    <Tag style={{ height: "2rem" }} className="rounded-xl ml-2 flex items-center justify-between relative">
      <MapModal
        CustomButton={
          <div className="flex items-center cursor-pointer">
            <span className="text-ellipsis max-w-80 overflow-hidden whitespace-nowrap inline-block">
              Location
            </span>
            &nbsp;
            <PushpinOutlined />
          </div>
        }
        defaultLocation={location}
      />
    </Tag>
  );
}

function AudioTag({ audioId, mimeType }: { audioId: string; mimeType: string }) {
  return (
    <Tag style={{ height: "2rem" }} className="rounded-xl ml-2 flex items-center justify-between relative">
      <div className="flex items-center">
        <SoundOutlined />
      </div>
      <audio controls className="custom-audio w-full">
        <source src={`http://localhost:3000/file/${audioId}`} type={mimeType} />
      </audio>
    </Tag>
  );
}

function DocumentTag({ fileId, fileName }: { fileId: string; fileName: string }) {
  return (
    <a href={`http://localhost:3000/file/${fileId}`} target="_blank" download={fileName}>
      <Tag style={{ height: "2rem" }} className="rounded-xl ml-2 flex items-center justify-between relative">
        <div className="flex items-center">
          <span className="text-ellipsis max-w-80 overflow-hidden whitespace-nowrap inline-block">
            {fileName}
          </span>
          &nbsp;
          <FilePdfOutlined />
        </div>
      </Tag>
    </a>
  );
}

function ImageModal({ imageId }: { imageId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className="bg-black w-[98%] h-60 overflow-hidden flex items-center justify-center cursor-pointer"
        onClick={() => setOpen(true)}
      >
        <img src={`http://localhost:3000/file/${imageId}`} alt={"post-related"} />
      </div>
      <Modal
        title={<div className="text-white">_</div>}
        centered
        open={open}
        footer={null}
        onCancel={() => setOpen(false)}
      >
        <div className="flex items-center justify-center">
          <img src={`http://localhost:3000/file/${imageId}`} alt={"post-related"} />
        </div>
      </Modal>
    </>
  );
}
