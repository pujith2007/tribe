import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import StatCard from "../components/StatCard";
import { useAuth } from "../hooks/useAuth";
import { getProfileById, getUserPosts, toggleFollowUser } from "../services/dataService";
import { getFriendlyError } from "../services/serviceGuards";

function ProfilePage() {
  const { userId } = useParams();
  const { profile } = useAuth();
  const profileId = userId || profile?.id;
  const [currentProfile, setCurrentProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      if (!profileId) {
        return;
      }

      try {
        const [profileData, postData] = await Promise.all([
          getProfileById(profileId),
          getUserPosts(profileId),
        ]);
        setCurrentProfile(profileData);
        setPosts(postData);
      } catch (loadError) {
        setError(getFriendlyError(loadError, "Unable to load the profile."));
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [profileId]);

  if (!profile) {
    return <LoadingSpinner label="Preparing your creator profile" />;
  }

  if (loading) {
    return <LoadingSpinner label="Loading profile" />;
  }

  if (!currentProfile) {
    return <EmptyState title="Profile not found" message="This creator does not exist yet." />;
  }

  const likesTotal = posts.reduce((total, post) => total + (post.likes?.length || 0), 0);
  const weeklyUploads = posts.filter((post) => {
    if (!post.createdAt?.seconds) {
      return false;
    }

    const ageInDays = (Date.now() - post.createdAt.seconds * 1000) / (1000 * 60 * 60 * 24);
    return ageInDays <= 7;
  }).length;
  const isOwnProfile = currentProfile.id === profile.id;
  const isFollowing = profile.following?.includes(currentProfile.id);

  async function handleFollow() {
    try {
      await toggleFollowUser(profile.id, currentProfile.id, isFollowing);
      setCurrentProfile((current) => ({
        ...current,
        followers: isFollowing
          ? (current.followers || []).filter((item) => item !== profile.id)
          : [...(current.followers || []), profile.id],
      }));
    } catch (followError) {
      setError(getFriendlyError(followError, "Unable to update follow state."));
    }
  }

  return (
    <div className="profile-page">
      {error ? <p className="error-text">{error}</p> : null}

      <section className="panel profile-hero">
        <img alt={currentProfile.name} className="avatar hero-avatar" src={currentProfile.avatar} />
        <div className="profile-copy">
          <p className="eyebrow">Creator profile</p>
          <h1>{currentProfile.name}</h1>
          <p>{currentProfile.bio}</p>
          <div className="row-actions">
            <span className="pill">{currentProfile.followers?.length || 0} followers</span>
            <span className="pill">{currentProfile.following?.length || 0} following</span>
            {!isOwnProfile ? (
              <button className="primary-button" onClick={handleFollow} type="button">
                {isFollowing ? "Unfollow" : "Follow"}
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <section className="stats-grid">
        <StatCard
          helper="Helpful for discussing consistency."
          label="Weekly uploads"
          value={weeklyUploads}
        />
        <StatCard
          helper="Signals community response to your process."
          label="Likes earned"
          value={likesTotal}
        />
        <StatCard
          helper="Stored in the profile for future expansion."
          label="Views"
          value={currentProfile.views || 0}
        />
      </section>

      <section className="panel">
        <p className="eyebrow">Recent uploads</p>
        <div className="profile-gallery">
          {posts.map((post) => (
            <img alt={post.caption || "Creative post"} key={post.id} src={post.imageUrl} />
          ))}
        </div>
        {posts.length === 0 ? (
          <EmptyState
            message="This creator has not posted a progress update yet."
            title="No uploads yet"
          />
        ) : null}
      </section>
    </div>
  );
}

export default ProfilePage;
