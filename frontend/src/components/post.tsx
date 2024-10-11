import { Divider, Input, Typography, Button, Form } from "antd";
import { useContext, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { Comments, CustomAvatar, PostInteractionsBar } from "./post_parts";
import { PostAttachments } from "./post_attachments";
import { UserContext } from "../routes/_AppLayout";
import { CommentData, PostData } from "../interfaces";

export function PostComponent({ post, postPage }: { post: PostData; postPage?: boolean }) {
  const [value, setValue] = useState("");
  const [isReadingMore, setIsReadingMore] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [touched, setTouched] = useState(false);
  const [comments, setComments] = useState<CommentData[]>(
    (postPage ? post.comments : post.lastComment?.content ? [post.lastComment] : []) ?? []
  );
  const [submitting, setSubmitting] = useState(false);
  const userInfo = useContext(UserContext);

  function validateInput() {
    if (value === "") {
      setTouched(true);
      setValidationError("Field is required.");
      return false;
    } else if (validationError) {
      setValidationError("");
    }
    return true;
  }

  function handleCommentSharing() {
    const isInputValid = validateInput();
    if (!isInputValid) return;
    setValue("");
    setTouched(false);

    setSubmitting(true);
    axios
      .post("http://localhost:3000/comment/" + post._id, { content: value }, { withCredentials: true })
      .then((response) => {
        setComments([
          {
            content: value,
            user: {
              firstname: userInfo.firstname,
              lastname: userInfo.lastname,
              username: userInfo.username,
              _id: userInfo._id,
              profilePictureId: userInfo.profilePictureId,
            },
            createdAt: new Date(),
            id: response.data.commentId,
          },
          ...comments,
        ]);
      })
      .catch((error) => {
        toast.error(error?.message ?? "Unexpected error occurred.");
      })
      .finally(() => setSubmitting(false));
  }

  return (
    <div className="flex flex-col items-start border w-[23.5rem] rounded-lg bg-white">
      <CustomAvatar user={post.user} />
      <div className="mt-2 ml-4">
        <Typography>
          {post.text.length < 80 || isReadingMore ? post.text : post.text.slice(0, 80)}
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
      <PostAttachments files={post.files} locations={post.locations} />
      <PostInteractionsBar post={post} />
      <Divider className="m-0 mt-2" />
      <div className="pb-2 w-full">
        <Form.Item
          validateStatus={touched && validationError ? "error" : ""}
          help={touched && validationError && <span className="ml-2">{validationError}</span>}
        >
          <Input.TextArea
            size="large"
            className="custom-scrollbar outline-none"
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
            onChange={(e) => {
              validateInput();
              setValue(e.target.value);
            }}
            value={value}
          />
        </Form.Item>
        <Button className="ml-2 mt-2" onClick={handleCommentSharing} disabled={submitting}>
          Share
        </Button>
      </div>
      {Boolean(comments.length) && (
        <Comments
          comments={comments}
          commentCount={post.commentCount}
          postId={post._id}
          setComments={setComments}
          postPage={postPage}
        />
      )}
    </div>
  );
}
