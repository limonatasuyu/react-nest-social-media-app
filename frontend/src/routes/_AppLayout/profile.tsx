import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useContext } from "react";
import { Tabs } from "antd";
import toast from "react-hot-toast";
import axios from "axios";
import { PostComponent } from "../../components/post";
import { UserContext } from "../_AppLayout";
import { PostData } from "../../interfaces";

export const Route = createFileRoute("/_AppLayout/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { id } = Route.useSearch();
  const [userPosts, setUserPosts] = useState<PostData[]>([]);
  const [likedPosts, setLikedPosts] = useState<PostData[]>([]);
  const [userCommentedPosts, setUserCommentedPosts] = useState<PostData[]>([]);
  const [postsPage, setPostsPage] = useState(1);
  const [commentedPostsPage, setCommentedPostsPage] = useState(1);
  const [likedPostsPage, setLikedPostsPage] = useState(1);

  const userInfo = useContext(UserContext);

  console.log("id: ", id);

  // Fetch user posts
  function fetchUserPosts() {
    axios
      .get(`http://localhost:3000/post/user?userId=${id}&page=${postsPage}`, {
        withCredentials: true,
      })
      .then((response) => setUserPosts(response.data))
      .catch((error) =>
        toast.error(
          error?.message ??
            "Unexpected error occurred while getting user posts."
        )
      );
  }

  // Fetch liked posts
  function fetchLikedPosts() {
    axios
      .get(
        `http://localhost:3000/post/liked?userId=${id}&page=${likedPostsPage}`,
        { withCredentials: true }
      )
      .then((response) => setLikedPosts(response.data))
      .catch((error) =>
        toast.error(
          error?.message ??
            "Unexpected error occurred while getting liked posts."
        )
      );
  }

  // Fetch user comments
  function fetchUserComments() {
    axios
      .get(
        `http://localhost:3000/comment/user?userId=${id}&page=${commentedPostsPage}`,
        { withCredentials: true }
      )
      .then((response) => setUserCommentedPosts(response.data))
      .catch((error) =>
        toast.error(
          error?.message ??
            "Unexpected error occurred while getting user comments."
        )
      );
  }

  function fetchData() {
    fetchUserPosts();
    fetchLikedPosts();
    fetchUserComments();
  }

  useEffect(fetchData, []);

  return (
    <div className="p-4 w-full flex flex-col items-center bg-transparent">
      {/* User Information Section */}
      <div className="bg-white w-full py-4 rounded-xl">
        {userInfo && (
          <div className="flex flex-col items-center mb-6">
            <img
              src={
                userInfo.profilePictureId
                  ? `http://localhost:3000/file/${userInfo.profilePictureId}`
                  : "/default-avatar.png"
              }
              alt="User Avatar"
              className="w-24 h-24 rounded-full mb-4"
            />
            <h2 className="text-xl font-semibold">{userInfo.username}</h2>
            <p className="text-gray-600">
              {userInfo.bio ?? "No bio available"}
            </p>
          </div>
        )}
      </div>

      {/* Tabs for Posts, Liked Posts, and Comments */}
      <Tabs defaultActiveKey="1" className="w-full max-w-3xl mt-4" type="card" tabBarStyle={{ background: 'white' }} tabBarGutter={25}>
        <Tabs.TabPane tab="My Posts" key="1">
          <div className="flex flex-col gap-2">
            {userPosts.length > 0 ? (
              userPosts.map((post) => (
                <PostComponent key={post._id} post={post} />
              ))
            ) : (
              <p className="text-center text-white">No posts to show.</p>
            )}
          </div>
        </Tabs.TabPane>

        <Tabs.TabPane tab="Liked Posts" key="2">
          <div className="flex flex-col gap-2">
            {likedPosts.length > 0 ? (
              likedPosts.map((post) => (
                <PostComponent key={post._id} post={post} />
              ))
            ) : (
              <p className="text-center text-white">
                No liked posts to show.
              </p>
            )}
          </div>
        </Tabs.TabPane>

        <Tabs.TabPane tab="My Comments" key="3">
          <div className="flex flex-col gap-2">
            {userCommentedPosts.length > 0 ? (
              userCommentedPosts.map((post) => (
                <PostComponent key={post._id} post={post} />
              ))
            ) : (
              <p className="text-center text-gray-white">No comments to show.</p>
            )}
          </div>
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
}
