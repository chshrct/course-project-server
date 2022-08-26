export type CommentResponseType = {
  id: string;
  message: string;
  user: { id: string; name: string };
  item: string;
  date: string;
};

export type CreateCommentRequestType = {
  message: string;
  user: string;
  item: string;
};
