export interface CreateCommentDTO {
  postId: string;
  userId: string;
  content: string;
}

export interface CreateAnswerDTO {
  postId: string;
  userId: string;
  content: string;
  answerTo: string;
}
