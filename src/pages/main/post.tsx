import {
  addDoc,
  getDocs,
  collection,
  query,
  where,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { Post as IPost } from "./main";
import { auth, db } from "../../config/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useEffect, useState } from "react";

interface Props {
  post: IPost;
}

interface Like {
  likeId: string;
  userId: string;
}

interface Comment {
  id: string;
  commentText: string;
  username: string;
  userId: string;
  date: any;
}

export const Post = (props: Props) => {
  const { post } = props;
  const [user] = useAuthState(auth);
  const [likes, setLikes] = useState<Like[] | null>(null);
  const likesRef = collection(db, "likes");
  const likesDoc = query(likesRef, where("postId", "==", post.id));
  const commentsRef = collection(db, "comments");
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const getLikes = async () => {
    const data = await getDocs(likesDoc);
    setLikes(
      data.docs.map((doc) => ({ userId: doc.data().userId, likeId: doc.id }))
    );
  };

  const addLike = async () => {
    try {
      const newDoc = await addDoc(likesRef, {
        userId: user?.uid,
        postId: post.id,
      });
      if (user) {
        setLikes((prev) =>
          prev
            ? [...prev, { userId: user.uid, likeId: newDoc.id }]
            : [{ userId: user.uid, likeId: newDoc.id }]
        );
      }
    } catch (err) {
      console.log(err);
    }
  };

  const removeLike = async () => {
    try {
      const likeToDeleteQuery = query(
        likesRef,
        where("postId", "==", post.id),
        where("userId", "==", user?.uid)
      );

      const likeToDeleteData = await getDocs(likeToDeleteQuery);
      const likeId = likeToDeleteData.docs[0].id;
      const likeToDelete = doc(db, "likes", likeId);
      await deleteDoc(likeToDelete);
      if (user) {
        setLikes(
          (prev) => prev && prev.filter((like) => like.likeId !== likeId)
        );
      }
    } catch (err) {
      console.log(err);
    }
  };

  const hasLiked = likes?.find((like) => like.userId === user?.uid);

  const getComments = async () => {
    const order = query(commentsRef, where("postId", "==", post.id));
    const data = await getDocs(order);
    const sorted = data.docs
      .map((doc) => ({ ...doc.data(), id: doc.id } as Comment))
      .sort((a, b) => b.date?.seconds - a.date?.seconds);
    setComments(sorted);
  };

  const addComment = async () => {
    await addDoc(commentsRef, {
      postId: post.id,
      commentText: newComment,
      username: user?.displayName,
      userId: user?.uid,
      date: serverTimestamp(),
    });

    setNewComment("");
    getComments();
  };
  function formatDate(dateInput: any) {
    if (!dateInput) return "";
    const date = dateInput.toDate ? dateInput.toDate() : new Date(dateInput);

    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);
  }

  useEffect(() => {
    getLikes();
    getComments();
  }, []);

  return (
    <div className="post">
      <div className="title">
        <h3>{post.title}</h3>
      </div>
      <div className="body">
        <p>{post.description}</p>
      </div>

      <div className="footer">
        <div className="post-date">{formatDate(post?.date)}</div>

        <div className="post-likes">
          <button
            className="like-button"
            onClick={hasLiked ? removeLike : addLike}
          >
            {hasLiked ? <>&#128078;</> : <>&#128077;</>}
          </button>
          {likes && <p className="like-amount">Likes: {likes?.length}</p>}
        </div>

        <div className="post-user">@{post.username}</div>
      </div>

      <div className="comments-section">
        <div className="comment-input">
          <input
            type="text"
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button onClick={addComment}>Post</button>
        </div>

        <div className="comments-list">
          {comments.map((comment) => (
            <div key={comment.id} className="comment">
              <p className="comment-meta">
                <strong>@{comment.username}</strong> ·{" "}
                {formatDate(comment.date)}
              </p>
              <p>{comment.commentText}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
