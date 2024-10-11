export interface UserInfo {
  username: string;
  firstname: string;
  lastname: string;
  profilePictureId?: string;
  _id: string;
  bio?: string;
}


export interface CommentData {
  content: string,
  user: UserInfo
  likedCount: number,
  dislikedCound: string,
  createdAt: Date,
}

export interface PostData {
  _id: string,
  content: string,
  user: UserInfo,
  likedCount: number,
  commentCount: number,
  dislikedCound: string,
  isUserLiked: boolean,
  isUserSaved: boolean;
  comments?: CommentData[],
  lastComment?: CommentData
  createdAt: Date,
}