import { createFileRoute } from '@tanstack/react-router'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { PostComponent } from '../../components/post'
import toast from 'react-hot-toast'

export const Route = createFileRoute('/_AppLayout/post')({
  component: PostPage,
})

function PostPage() {
  const { id } = Route.useSearch()
  const [post, setPost] = useState<null | any>(null)
  const [loadState, setLoadState] = useState<'loading' | 'error' | 'loaded'>(
    'loading',
  )
  const [userInfo, setUserInfo] = useState(null)

  function fetchPost() {
    axios
      .get(`http://localhost:3000/post/get_post/${id}`, {
        withCredentials: true,
      })
      .then((response) => {
        setPost(response.data.post)
        setLoadState('loaded')
      })
      .catch((error) => {
        toast.error(error.message ?? 'Unexpected error occured.')
        setLoadState('error')
      })
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
    fetchPost()
    fetchUserInfo()
  }

  useEffect(fetchData, [])
  if (loadState === 'loading') return 'loading'
  else if (loadState === 'error') return 'error'
  return (
    <div className="p-2 w-full flex flex-col items-center">
      <div className="mt-4">
        <div className="flex flex-col gap-2">
          <PostComponent post={post} postPage userInfo={userInfo} />
        </div>
      </div>
    </div>
  )
}
