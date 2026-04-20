import { useEffect, useState } from "react";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import PostCard from "../components/PostCard";
import PostComposer from "../components/PostComposer";
import { useAuth } from "../hooks/useAuth";
import { useAppContext } from "../hooks/useAppContext";
import { useTutorial } from "../hooks/useTutorial";
import { subscribeToFeed } from "../services/dataService";
import { getFriendlyError } from "../services/serviceGuards";

function FeedPage() {
  const { user, profile } = useAuth();
  const { preferences } = useAppContext();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useTutorial(user?.uid, preferences.autoplayTutorial);

  useEffect(() => {
    const unsubscribe = subscribeToFeed(
      (nextPosts) => {
        setPosts(nextPosts);
        setLoading(false);
      },
      (feedError) => {
        setError(getFriendlyError(feedError, "Unable to load the feed."));
        setLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  if (!profile) {
    return <LoadingSpinner label="Preparing your creator profile" />;
  }

  return (
    <div className="page-grid">
      <section className="feed-column">
        <div className="panel page-intro">
          <div>
            <p className="eyebrow">Seamless flow</p>
            <h1>Post a small win, check your circle, keep moving.</h1>
          </div>
          <p className="muted-text">
            The feed is tuned for quick daily updates, supportive interaction, and low-friction accountability.
          </p>
        </div>

        <PostComposer onCreated={setMessage} profile={profile} user={user} />

        {message ? <p className="success-banner">{message}</p> : null}
        {error ? <p className="error-text">{error}</p> : null}
        {loading ? <LoadingSpinner label="Loading the community feed" /> : null}

        {!loading && posts.length === 0 ? (
          <EmptyState
            message="Be the first creator to share a draft, sketch, clip, or experiment."
            title="No posts yet"
          />
        ) : null}

        <div className={preferences.compactFeed ? "post-list compact" : "post-list"}>
          {posts.map((post) => (
            <PostCard key={post.id} onFeedback={setMessage} post={post} />
          ))}
        </div>
      </section>

      <aside className="side-column">
        <div className="panel">
          <p className="eyebrow">Why this matters</p>
          <h3>Designed for creators who need gentle accountability.</h3>
          <p>
            The product focuses on visible progress, social encouragement, and lightweight
            analytics so creative work feels more sustainable.
          </p>
        </div>
        <div className="panel">
          <p className="eyebrow">Your current rhythm</p>
          <h3>{profile?.weeklyGoal || 0} posts/week target</h3>
          <p>Use Settings to tune your preferred pace and feed layout.</p>
        </div>
      </aside>
    </div>
  );
}

export default FeedPage;
