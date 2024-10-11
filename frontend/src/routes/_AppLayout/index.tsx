import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { PostComponent } from "../../components/post";
import { SharePostForm } from "../../components/share_post_form";
import { PostData } from "../../interfaces";

export const Route = createFileRoute("/_AppLayout/")({
  component: Homepage,
});

function Homepage() {
  const [posts, setPosts] = useState<PostData[]>([]);

  function fetchPosts() {
    axios
      .get("http://localhost:3000/post", { withCredentials: true })
      .then((response) => setPosts(response.data))
      .catch((error) => toast.error(error?.message ?? "Unexpected error occured while getting posts."));
  }

  useEffect(fetchPosts, []);

  return (
    <div className="p-2 w-full flex flex-col gap-2 items-center">
      <SharePostForm fetchPosts={fetchPosts} />
      <div className="mt-4">
        <div className="flex flex-col gap-2">
          {posts.map((post) => (
            <PostComponent key={post._id} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
}
