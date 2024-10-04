import { createFileRoute } from "@tanstack/react-router";
import { Input, Button, Divider, Tag, Modal } from "antd";
import { useState, useRef, RefObject } from "react";
import {
  FileImageOutlined,
  SoundOutlined,
  FilePdfOutlined,
  CloseOutlined,
  PushpinOutlined,
} from "@ant-design/icons";
import MapModal from "../components/map_modal";

export const Route = createFileRoute("/")({
  component: Homepage,
});

function f(x: number) {
  return 2.4 * x + 3.2;
}

interface TagType1 {
  id: number;
  name: string;
  type: "Document" | "Sound" | "Location" | "Image";
  mimeType: string;
  content: File;
}

interface TagType2 {
  id: number;
  name: string;
  type: "Location";
  content: [number, number];
}

type TagType = TagType1 | TagType2;

function Homepage() {
  const [value, setValue] = useState("");
  const [tags, setTags] = useState<TagType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const soundInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "Document" | "Sound" | "Image" // | "Location"
  ) => {
    const files = event?.target?.files;
    const file = files?.length && files[0];
    if (file) {
      setTags([
        ...tags,
        {
          id: tags.length,
          name: file.name,
          type,
          content: file,
          mimeType: file.type,
        },
      ]);
    }
  };

  const handleClick = (inputRef: RefObject<HTMLInputElement>) => {
    if (inputRef?.current) {
      inputRef.current.click();
    }
  };

  function storeLocation(location: [number, number]) {
    setTags([
      ...tags,
      {
        id: tags.length,
        name: "Location",
        type: "Location",
        content: location,
      },
    ]);
  }

  function handleSubmit() {
    setIsSubmitting(true);
    const formData = new FormData();

    formData.set("text", value);

    tags.forEach((tag, index) => {
      formData.append(`richMedia[${index}][id]`, tag.id.toString());
      formData.append(`richMedia[${index}][name]`, tag.name);
      formData.append(`richMedia[${index}][type]`, tag.type);

      // Handle TagType1 (Document, Sound, Image)
      if (tag.type !== "Location") {
        formData.append(`richMedia[${index}][content]`, tag.content); // File is directly appendable to FormData

        if (tag.mimeType) {
          formData.append(`richMedia[${index}][mimeType]`, tag.mimeType);
        }
      }

      if (tag.type === "Location") {
        formData.append(
          `richMedia[${index}][content]`,
          JSON.stringify(tag.content)
        );
      }
    });

    fetch("http://localhost:3000/post", {
      body: formData,
      method: "POST",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setIsSubmitting(false);
      })
      .catch((error) => {
        console.error("Error:", error);
        setIsSubmitting(false);
      });
  }

  return (
    <div className="p-2 w-full flex flex-col items-center">
      <div
        className="w-[23.5rem]"
        style={{
          height: `${tags.filter((i) => i.type === "Image").length * 16 + 16 + tags.length * 2.5}rem`,
        }}
      >
        <Input.TextArea
          style={{
            resize: "none",
            height: `${tags.filter((i) => i.type === "Image").length * 16 + 16 + tags.length * 2.5}rem `,
            paddingBottom: `${tags.filter((i) => i.type === "Image").length * 16 + 4 + f(tags.length)}rem`,
          }}
          className="text-lg text-gray-700 custom-scrollbar"
          showCount={{
            formatter: ({ count, maxLength }) => (
              <span className="block -mb-1 text-sm text-gray-500">
                {count} / {maxLength}
              </span>
            ),
          }}
          placeholder="What are you thinking about"
          maxLength={400}
          onChange={(e) => setValue(e.target.value)}
          value={value}
        />
        <div
          className="relative z-10"
          style={{
            bottom: `${tags.filter((i) => i.type === "Image").length * 16 + 6 + tags.length * 2.5}rem`,
          }}
        >
          <div
            className="flex flex-col gap-2"
            style={{
              marginBottom: `${tags.length ? 1 : 0}rem`,
            }}
          >
            {tags.map((tag) => (
              <TagComponent
                key={tag.id}
                tag={tag}
                setTags={setTags}
                tags={tags}
              />
            ))}
          </div>
          <Divider
            className="text-black-900 border-gray-300 m-0"
            variant="dashed"
          />
          <div className="flex justify-around mt-8">
            {/* Image Upload */}
            <input
              type="file"
              ref={imageInputRef}
              style={{ display: "none" }}
              accept="image/*"
              onChange={(e) => handleFileChange(e, "Image")}
            />
            <Button
              className="flex flex-col items-center w-min group gap-1 h-[3.5rem] rounded-none p-0 static border-none -mt-3 pt-2"
              shape="circle"
              type="text"
              onClick={() => handleClick(imageInputRef)}
            >
              <FileImageOutlined className="text-2xl text-gray-600 group-hover:text-gray-900 -mt-[0.4rem]" />
              <span className="text-gray-600 group-hover:text-gray-900">
                Media
              </span>
            </Button>

            {/* Sound Upload */}
            <input
              type="file"
              ref={soundInputRef}
              style={{ display: "none" }}
              accept="audio/*"
              onChange={(e) => handleFileChange(e, "Sound")}
            />
            <Button
              className="flex flex-col items-center w-min group gap-1 h-[3.5rem] rounded-none p-0 static border-none -mt-3 pt-2"
              shape="circle"
              type="text"
              onClick={() => handleClick(soundInputRef)}
            >
              <SoundOutlined className="text-2xl text-gray-600 group-hover:text-gray-900 -mt-[0.4rem]" />
              <span className="text-gray-600 group-hover:text-gray-900">
                Sound
              </span>
            </Button>

            <MapModal storeLocation={storeLocation} />

            {/* Document Upload */}
            <input
              type="file"
              ref={documentInputRef}
              style={{ display: "none" }}
              accept="application/pdf"
              onChange={(e) => handleFileChange(e, "Document")}
            />
            <Button
              className="flex flex-col items-center w-min group gap-1 h-[3.5rem] rounded-none p-0 static border-none -mt-3 pt-2"
              shape="circle"
              type="text"
              onClick={() => handleClick(documentInputRef)}
            >
              <FilePdfOutlined className="text-2xl text-gray-600 group-hover:text-gray-900 -mt-[0.4rem]" />
              <span className="text-gray-600 group-hover:text-gray-900">
                Document
              </span>
            </Button>
          </div>
        </div>
      </div>
      <div className="flex gap-1 mt-2 w-[23.5rem] z-10">
        <Button type="primary" onClick={handleSubmit} disabled={isSubmitting}>
          Share
        </Button>
        <Button type="primary">Save for later</Button>
      </div>
    </div>
  );
}

function TagComponent({
  tag,
  setTags,
  tags,
}: {
  tag: TagType;
  setTags: (tags: TagType[]) => void;
  tags: TagType[];
}) {
  return (
    <Tag
      key={tag.id}
      closeIcon={
        tag.type === "Image" ? (
          <CloseOutlined className="self-start mt-2" />
        ) : (
          <CloseOutlined />
        )
      }
      style={{ height: tag.type === "Image" ? "18rem" : "2rem" }}
      className="rounded-xl ml-2 flex items-center justify-between relative"
      onClose={() => setTags(tags.filter((i) => i.id !== tag.id))}
    >
      {tag.type === "Document" && <DocumentTag tag={tag} />}
      {tag.type === "Sound" && <AudioTag tag={tag} />}
      {tag.type === "Image" && <ImageTag tag={tag} />}
      {tag.type === "Location" && <LocationTag tag={tag as TagType2} />}
    </Tag>
  );
}

function LocationTag({ tag }: { tag: TagType2 }) {
  return (
    <MapModal
      CustomButton={
        <div className="flex items-center cursor-pointer">
          <span className="text-ellipsis max-w-80 overflow-hidden whitespace-nowrap inline-block">
            {tag.name}
          </span>
          &nbsp;
          <PushpinOutlined />
        </div>
      }
      defaultLocation={tag.content as [number, number]}
    />
  );
}

function ImageTag({ tag }: { tag: TagType1 }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="flex items-center self-start mt-2">
        <span className="text-ellipsis max-w-80 overflow-hidden whitespace-nowrap	inline-block">
          {tag.name}
        </span>
      </div>
      <div
        className="bg-black absolute w-[98%] h-60 overflow-hidden flex items-center justify-center mt-6 -ml-1 cursor-pointer"
        onClick={() => setOpen(true)}
      >
        <img src={URL.createObjectURL(tag.content)} alt={tag.name} />
      </div>
      <Modal
        title={<div className="text-white">_</div>}
        centered
        open={open}
        footer={null}
        onCancel={() => setOpen(false)}
      >
        <div className="flex items-center justify-center">
          <img src={URL.createObjectURL(tag.content)} alt={tag.name} />
        </div>
      </Modal>
    </>
  );
}

function AudioTag({ tag }: { tag: TagType1 }) {
  return (
    <>
      <div className="flex items-center">
        <span className="text-ellipsis max-w-16 overflow-hidden whitespace-nowrap inline-block">
          {tag.name}
        </span>
        <SoundOutlined />
      </div>
      <audio controls className="custom-audio">
        <source src={URL.createObjectURL(tag.content)} type={tag.mimeType} />
      </audio>
    </>
  );
}

function DocumentTag({ tag }: { tag: TagType1 }) {
  return (
    <div className="flex items-center">
      <span className="text-ellipsis max-w-80 overflow-hidden whitespace-nowrap inline-block">
        {tag.name}
      </span>
      &nbsp;
      <FilePdfOutlined />
    </div>
  );
}
