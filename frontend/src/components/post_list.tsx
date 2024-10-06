import { Avatar, Divider, Input, Typography, Button, Modal, Tag } from "antd";
import {
  LikeOutlined,
  DislikeOutlined,
  SaveOutlined,
  CommentOutlined,
  SaveFilled,
  SoundOutlined,
  FilePdfOutlined,
  PushpinOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import MapModal from "./map_modal";

export default function PostList({ posts }: { posts: any[] }) {
  return (
    <div className="flex flex-col gap-2">
      {posts.map((post, index) => (
        <PostComponent key={index} post={post} />
      ))}
    </div>
  );
}

function PostComponent({ post }: { post: any }) {
  const [value, setValue] = useState("");
  const [isReadingMore, setIsReadingMore] = useState(false);

  return (
    <div className="flex flex-col items-start border w-[23.5rem] rounded-lg">
      <div className="flex items-center gap-2 mt-2 ml-2">
        <Avatar
          size="large"
          src={
            post.user.profilePictureId && (
              <img
                src={`http://localhost:3000/file/${post.user.profilePictureId}`}
              />
            )
          }
        >
          {post.user.username[0]}
        </Avatar>
        <div>
          <Typography className="text-gray-800 font-bold">
            {post.user.firstname}&nbsp;{post.user.lastname}
          </Typography>
          <Typography className="text-gray-500">
            @{post.user.username}
          </Typography>
        </div>
      </div>
      <div className="mt-2 ml-4">
        <Typography>
          {post.text.length < 80 || isReadingMore
            ? post.text
            : post.text.slice(0, 80)}
          {post.text.length > 80 && (
            <Button
              onClick={() => setIsReadingMore(!isReadingMore)}
              className="inline p-0 m-0 border-none h-min outline-none"
              type="link"
            >
              {isReadingMore ? "Read less" : "Read more..."}
            </Button>
          )}
        </Typography>
      </div>
      <div className="w-full mt-2 flex flex-col gap-2">
        {post.files.map((file, index) => {
          if (file.mimeType.startsWith("image"))
            return <ImageModal key={index} imageId={file._id} />;
          else if (file.mimeType.startsWith("audio"))
            return <AudioTag key={index} audioId={file._id} mimeType={file.mimeType} />;
          else return <DocumentTag key={index} fileId={file._id} fileName={file.name}/>;
        })}
        {
          post.locations?.map((location, index) => <LocationTag key={index} location={location}/>)
        }
      </div>
      <PostInteractionsBar post={post} />
      <Divider className="m-0 mt-2" />
      <div className="pb-2 w-full">
        <Input.TextArea
          size="large"
          className="border-none custom-scrollbar outline-none"
          placeholder="what do you think about that ?"
          style={{ resize: "none" }}
          autoSize={{ maxRows: 3 }}
          showCount={{
            formatter: ({ count, maxLength }) => (
              <span className="block -mb-1 text-sm text-gray-500 mr-2 mt-2">
                {count} / {maxLength}
              </span>
            ),
          }}
          maxLength={400}
          onChange={(e) => setValue(e.target.value)}
          value={value}
        />
        <Button className="ml-2 mt-2">Share</Button>
      </div>
    </div>
  );
}

function PostInteractionsBar({ post }: { post: any }) {
  const [likeCount, setLikeCount] = useState<number>(post.likeCount);
  const [dislikeCount, setDislikeCount] = useState<number>(post.dislikeCount);
  const [saveCount, setSaveCount] = useState<number>(post.saveCount);

  const [isUserLiked, setIsUserLiked] = useState<boolean>(post.isUserLiked);
  const [isUserDisliked, setIsUserDisliked] = useState<boolean>(
    post.isUserDisliked
  );
  const [isUserSaved, setIsUserSaved] = useState<boolean>(post.isUserSaved);

  const handleLike = () => {
    const newLikeState = !isUserLiked;
    const likeChange = newLikeState ? 1 : -1;
    const dislikeChange = isUserDisliked ? -1 : 0;

    setIsUserLiked(newLikeState);
    setIsUserDisliked(false);
    setLikeCount((prev) => prev + likeChange);
    setDislikeCount((prev) => prev + dislikeChange);

    axios
      .post(
        `http://localhost:3000/post/like/${post._id}`,
        {},
        { withCredentials: true }
      )
      .catch((error) => {
        setIsUserLiked(!newLikeState);
        setIsUserDisliked(dislikeChange ? true : false);
        setLikeCount((prev) => prev - likeChange);
        setDislikeCount((prev) => prev - dislikeChange);
        toast.error(error?.message ?? "Unexpected error occurred.");
      });
  };

  const handleDislike = () => {
    const newDislikeState = !isUserDisliked;
    const dislikeChange = newDislikeState ? 1 : -1;
    const likeChange = isUserLiked ? -1 : 0;

    setIsUserDisliked(newDislikeState);
    setIsUserLiked(false);
    setDislikeCount((prev) => prev + dislikeChange);
    setLikeCount((prev) => prev + likeChange);

    axios
      .post(
        `http://localhost:3000/post/dislike/${post._id}`,
        {},
        { withCredentials: true }
      )
      .catch((error) => {
        setIsUserDisliked(!newDislikeState);
        setIsUserLiked(likeChange ? true : false);
        setDislikeCount((prev) => prev - dislikeChange);
        setLikeCount((prev) => prev - likeChange);
        toast.error(error?.message ?? "Unexpected error occurred.");
      });
  };

  const handleSave = () => {
    const newSaveState = !isUserSaved;
    const saveChange = newSaveState ? 1 : -1;

    setIsUserSaved(newSaveState);
    setSaveCount((prev) => prev + saveChange);

    axios
      .post(
        `http://localhost:3000/post/save/${post._id}`,
        {},
        { withCredentials: true }
      )
      .catch((error) => {
        setIsUserSaved(!newSaveState);
        setSaveCount((prev) => prev - saveChange);
        toast.error(error?.message ?? "Unexpected error occurred.");
      });
  };

  return (
    <div className="flex justify-around w-full mt-2">
      <Button
        className="flex gap-2 hover:text-blue-500 text-base"
        onClick={handleLike}
        type="text"
      >
        <LikeOutlined /> {likeCount}
      </Button>
      <Button
        className="flex gap-2 hover:text-red-500 text-base"
        onClick={handleDislike}
        type="text"
      >
        <DislikeOutlined /> {dislikeCount}
      </Button>
      <div className="flex gap-2 items-center">
        <CommentOutlined /> {post.commentCount}
      </div>
      <Button
        className="flex gap-2 hover:text-blue-500 text-base"
        onClick={handleSave}
        type="text"
      >
        {isUserSaved ? <SaveFilled /> : <SaveOutlined />} {saveCount}
      </Button>
    </div>
  );
}


function LocationTag({ location }: { location: [number, number] }) {
  return (

    <Tag
      style={{ height: "2rem" }}
      className="rounded-xl ml-2 flex items-center justify-between relative"
    >
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

function ImageModal({ imageId }: { imageId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className="bg-black w-[98%] h-60 overflow-hidden flex items-center justify-center cursor-pointer"
        onClick={() => setOpen(true)}
      >
        <img
          src={`http://localhost:3000/file/${imageId}`}
          alt={"post-related"}
        />
      </div>
      <Modal
        title={<div className="text-white">_</div>}
        centered
        open={open}
        footer={null}
        onCancel={() => setOpen(false)}
      >
        <div className="flex items-center justify-center">
          <img
            src={`http://localhost:3000/file/${imageId}`}
            alt={"post-related"}
          />
        </div>
      </Modal>
    </>
  );
}

function AudioTag({
  audioId,
  mimeType,
}: {
  audioId: string;
  mimeType: string;
}) {
  return (
    <Tag
      style={{ height: "2rem" }}
      className="rounded-xl ml-2 flex items-center justify-between relative"
    >
      <div className="flex items-center">
        <SoundOutlined />
      </div>
      <audio controls className="custom-audio w-full">
        <source src={`http://localhost:3000/file/${audioId}`} type={mimeType} />
      </audio>
    </Tag>
  );
}

function DocumentTag({
  fileId,
  fileName,
}: {
  fileId: string;
  fileName: string;
}) {
  return (
    <a href={`http://localhost:3000/file/${fileId}`} target="_blank" download={fileName}>
    <Tag
      style={{ height: "2rem" }}
      className="rounded-xl ml-2 flex items-center justify-between relative"
    >
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
