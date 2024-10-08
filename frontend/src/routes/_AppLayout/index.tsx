import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import axios from 'axios'
import { PostComponent } from '../../components/post'
import { SharePostForm } from '../../components/share_post_form'

export const Route = createFileRoute('/_AppLayout/')({
  component: Homepage,
})

function Homepage() {
  const [posts, setPosts] = useState([])
  const [userInfo, setUserInfo] = useState(null)

  function fetchPosts() {
    axios
      .get('http://localhost:3000/post', { withCredentials: true })
      .then((response) => setPosts(response.data))
      .catch((error) =>
        toast.error(
          error?.message ?? 'Unexpected error occured while getting posts.',
        ),
      )
  }

  function fetchUserInfo() {
    axios
      .get('http://localhost:3000/user/me', { withCredentials: true })
      .then((response) => setUserInfo(response.data))
      .catch((error) =>
        toast.error(
          error?.message ?? 'Unexpected error occured while getting user info.',
        ),
      )
  }

  function fetchData() {
    fetchPosts()
    fetchUserInfo()
  }

  useEffect(fetchData, [])

  return (
    <div className="p-2 w-full flex flex-col items-center">
      <SharePostForm fetchPosts={fetchPosts} />
      <div className="mt-4">
        <div className="flex flex-col gap-2">
          {posts.map((post) => (
            <PostComponent key={post._id} post={post} userInfo={userInfo} />
          ))}
        </div>
      </div>
    </div>
  )
}
