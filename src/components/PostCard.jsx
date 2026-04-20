import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  addComment,
  getPostComments,
  deletePost,
  sharePost,
  toggleFollowUser,
  toggleLike,
} from "../services/dataService";
import { getFriendlyError } from "../services/serviceGuards";

function PostCard({ post, onFeedback }) {
  const { profile } = useAuth();
  const [comment, setComment] = useState("");
  const [busyAction, setBusyAction] = useState("");
  const [expandedComments, setExpandedComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [cardError, setCardError] = useState("");
  const [optimisticLikes, setOptimisticLikes] = useState(post.likes || []);
  const [optimisticShareCount, setOptimisticShareCount] = useState(post.shareCount || 0);
  const [optimisticCommentCount, setOptimisticCommentCount] = useState(post.commentCount || 0);

  useEffect(() => {
    setOptimisticLikes(post.likes || []);
    setOptimisticShareCount(post.shareCount || 0);
    setOptimisticCommentCount(post.commentCount || 0);
  }, [post.commentCount, post.likes, post.shareCount]);

  const hasLiked = optimisticLikes.includes(profile.id);
  const isOwnPost = post.authorId === profile.id;
  const isFollowing = profile.following?.includes(post.authorId);

  async function loadComments() {
    if (commentsLoading) {
      return;
    }

    setCommentsLoading(true);
    setCardError("");

    try {
      const nextComments = await getPostComments(post.id);
      setComments(nextComments);
    } catch (error) {
      setCardError(getFriendlyError(error, "Unable to load comments."));
    } finally {
      setCommentsLoading(false);
    }
  }

  async function handleLike() {
    setBusyAction("like");
    setCardError("");

    const nextLikes = hasLiked
      ? optimisticLikes.filter((item) => item !== profile.id)
      : [...optimisticLikes, profile.id];
    setOptimisticLikes(nextLikes);

    try {
      await toggleLike(post.id, profile.id, hasLiked);
      onFeedback(hasLiked ? "Like removed." : "Post liked.");
    } catch (error) {
      setOptimisticLikes(post.likes || []);
      setCardError(getFriendlyError(error, "Unable to update your like."));
    } finally {
      setBusyAction("");
    }
  }

  async function handleComment(event) {
    event.preventDefault();
    if (!comment.trim()) {
      setCardError("Write a short comment before posting.");
      return;
    }

    setBusyAction("comment");
    setCardError("");

    try {
      const newComment = await addComment(post.id, profile, comment);
      setExpandedComments(true);
      setOptimisticCommentCount((current) => current + 1);
      setComments((current) => [...current, newComment].filter(Boolean));
      setComment("");
      onFeedback("Comment posted.");
    } catch (error) {
      setCardError(getFriendlyError(error, "Unable to add your comment."));
    } finally {
      setBusyAction("");
    }
  }

  async function handleShare() {
    setBusyAction("share");
    setCardError("");
    setOptimisticShareCount((current) => current + 1);

    try {
      await sharePost(post.id);
      await navigator.clipboard.writeText(`${window.location.origin}/profile/${post.authorId}`);
      onFeedback("Post link copied to the clipboard.");
    } catch (error) {
      setOptimisticShareCount(post.shareCount || 0);
      setCardError(getFriendlyError(error, "Unable to share this post right now."));
    } finally {
      setBusyAction("");
    }
  }

  async function handleFollow() {
    setBusyAction("follow");
    setCardError("");

    try {
      await toggleFollowUser(profile.id, post.authorId, isFollowing);
      onFeedback(isFollowing ? "Unfollowed creator." : "Creator followed.");
    } catch (error) {
      setCardError(getFriendlyError(error, "Unable to update the follow state."));
    } finally {
      setBusyAction("");
    }
  }

  async function handleDelete() {
    setBusyAction("delete");
    setCardError("");

    try {
      await deletePost(post);
      onFeedback("Post deleted.");
    } catch (error) {
      setCardError(getFriendlyError(error, "Unable to delete the post."));
    } finally {
      setBusyAction("");
    }
  }

  return (
    <article className="panel post-card">
      <div className="post-header">
        <div className="author-row">
          <img alt={post.authorName} className="avatar" src={post.authorAvatar} />
          <div>
            <h3>{post.authorName}</h3>
            <p className="muted-text">{post.tags?.map((tag) => `#${tag}`).join(" ") || "Daily progress"}</p>
          </div>
        </div>

        {!isOwnPost ? (
          <button className="ghost-button" onClick={handleFollow} type="button">
            {busyAction === "follow" ? "Saving..." : isFollowing ? "Following" : "Follow"}
          </button>
        ) : (
          <button className="ghost-button danger" onClick={handleDelete} type="button">
            {busyAction === "delete" ? "Removing..." : "Delete"}
          </button>
        )}
      </div>

      <p className="post-caption">{post.caption}</p>
      <div className="post-image-wrap">
        <img alt={post.caption || "Creative post"} className="post-image" src={post.imageUrl} />
      </div>

      <div className="post-actions">
        <button className="action-button" disabled={busyAction === "like"} onClick={handleLike} type="button">
          {busyAction === "like" ? "..." : hasLiked ? "Unlike" : "Like"} ({optimisticLikes.length})
        </button>
        <button
          className="action-button"
          disabled={busyAction === "share"}
          onClick={handleShare}
          type="button"
        >
          {busyAction === "share" ? "..." : "Share"} ({optimisticShareCount})
        </button>
        <button
          className="action-button"
          onClick={async () => {
            const nextExpanded = !expandedComments;
            setExpandedComments(nextExpanded);
            if (nextExpanded && comments.length === 0) {
              await loadComments();
            }
          }}
          type="button"
        >
          {expandedComments ? "Hide comments" : "View comments"} ({optimisticCommentCount})
        </button>
      </div>

      <form className="comment-form" onSubmit={handleComment}>
        <input
          className="text-input"
          disabled={busyAction === "comment"}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Encourage the process..."
          value={comment}
        />
        <button className="primary-button" disabled={busyAction === "comment"} type="submit">
          Comment
        </button>
      </form>

      {cardError ? <p className="error-text">{cardError}</p> : null}

      {expandedComments ? (
        <div className="comment-list">
          {commentsLoading ? <p className="muted-text">Loading comments...</p> : null}
          {!commentsLoading && comments.length === 0 ? (
            <p className="muted-text">No comments yet. Start the encouragement.</p>
          ) : null}
          {comments.map((item) => (
            <div className="comment-item" key={item.id}>
              <img alt={item.userName} className="avatar small" src={item.userAvatar} />
              <div>
                <strong>{item.userName}</strong>
                <p>{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </article>
  );
}

export default PostCard;
