import { LikeOutlined, DislikeOutlined, SaveOutlined, CommentOutlined, SaveFilled } from "@ant-design/icons";
import { Avatar, Typography, Button } from "antd";
import { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";

export function CustomAvatar({
  user,
}: {
  user: {
    profilePictureId?: string;
    username: string;
    firstname: string;
    lastname: string;
  };
}) {
  return (
    <div className="flex items-center gap-2 mt-2 ml-2">
      <Avatar
        size="large"
        src={user.profilePictureId && <img src={`http://localhost:3000/file/${user.profilePictureId}`} />}
      >
        {user.username[0]}
      </Avatar>
      <div>
        <Typography className="text-gray-800 font-bold">
          {user.firstname}&nbsp;{user.lastname}
        </Typography>
        <Typography className="text-gray-500">@{user.username}</Typography>
      </div>
    </div>
  );
}

export function Comments({
  comments,
  commentCount,
  postId,
  setComments,
  postPage,
}: {
  comments: any[];
  commentCount: number;
  postId: string;
  setComments: (comments: any[]) => void;
  postPage?: boolean;
}) {
  const [commentPage, setCommentPage] = useState(postPage ? 3 : 0);
  const [buttonType, setButtonType] = useState<"more" | "post" | "none">("more");

  function handleFetchComments() {
    const newCommentPage = commentPage + 1;
    axios
      .get(`http://localhost:3000/comment/postComments?postId=${postId}&page=${commentPage}`, {
        withCredentials: true,
      })
      .then((response) => {
        if (!postPage) {
          if (newCommentPage < 2) setCommentPage(newCommentPage);
          else if (newCommentPage * 2 + 1 < commentCount) setButtonType("post");
          else setButtonType("none");
        } else {
          if (newCommentPage < 4) setCommentPage(newCommentPage);
          else setButtonType("none");
        }
        setComments([...comments, ...response.data.comments]);
      })
      .catch();
  }

  return (
    <>
      <div>
        {comments.map((comment, index) => (
          <div key={index} className="">
            <CustomAvatar user={comment.user} />
            <div className="text-gray-600 ml-2">{comment.content}</div>
          </div>
        ))}
      </div>
      {commentCount > 1 && buttonType !== "none" && (
        <Button
          onClick={handleFetchComments}
          className="inline p-0 m-0 ml-2 border-none h-min outline-none"
          type="link"
          href={buttonType === "post" ? "http://localhost:5173/post?id=" + postId : undefined}
        >
          {buttonType === "more" ? "Show more.." : "Go to the post"}
        </Button>
      )}
    </>
  );
}

export function PostInteractionsBar({ post }: { post: any }) {
  const [likeCount, setLikeCount] = useState<number>(post.likeCount);
  const [dislikeCount, setDislikeCount] = useState<number>(post.dislikeCount);
  const [saveCount, setSaveCount] = useState<number>(post.saveCount);

  const [isUserLiked, setIsUserLiked] = useState<boolean>(post.isUserLiked);
  const [isUserDisliked, setIsUserDisliked] = useState<boolean>(post.isUserDisliked);
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
      .post(`http://localhost:3000/post/like/${post._id}`, {}, { withCredentials: true })
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
      .post(`http://localhost:3000/post/dislike/${post._id}`, {}, { withCredentials: true })
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
      .post(`http://localhost:3000/post/save/${post._id}`, {}, { withCredentials: true })
      .catch((error) => {
        setIsUserSaved(!newSaveState);
        setSaveCount((prev) => prev - saveChange);
        toast.error(error?.message ?? "Unexpected error occurred.");
      });
  };

  return (
    <div className="flex justify-around w-full mt-2">
      <Button className="flex gap-2 hover:text-blue-500 text-base" onClick={handleLike} type="text">
        <LikeOutlined /> {likeCount}
      </Button>
      <Button className="flex gap-2 hover:text-red-500 text-base" onClick={handleDislike} type="text">
        <DislikeOutlined /> {dislikeCount}
      </Button>
      <div className="flex gap-2 items-center">
        <CommentOutlined /> {post.commentCount}
      </div>
      <Button className="flex gap-2 hover:text-blue-500 text-base" onClick={handleSave} type="text">
        {isUserSaved ? <SaveFilled /> : <SaveOutlined />} {saveCount}
      </Button>
    </div>
  );
}
