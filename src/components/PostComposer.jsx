import { useState } from "react";
import { createPost } from "../services/dataService";
import { getFriendlyError } from "../services/serviceGuards";

function PostComposer({ user, profile, onCreated }) {
  const [caption, setCaption] = useState("");
  const [tags, setTags] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    if (!imageFile) {
      setError("Please choose an image of your work.");
      return;
    }

    if (!caption.trim()) {
      setError("Add a short note so people understand what changed today.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await createPost({ user, profile, caption, imageFile, tags });
      setCaption("");
      setTags("");
      setImageFile(null);
      onCreated("Progress update posted.");
    } catch (submitError) {
      setError(getFriendlyError(submitError, "Unable to publish your post right now."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="panel composer" onSubmit={handleSubmit}>
      <div className="panel-header">
        <div>
          <p className="eyebrow">Daily update</p>
          <h2>Share today&apos;s creative proof</h2>
        </div>
      </div>

      <textarea
        className="text-input"
        onChange={(event) => setCaption(event.target.value)}
        placeholder="What moved forward today?"
        rows="4"
        value={caption}
      />

      <div className="grid-two">
        <input
          accept="image/*"
          className="text-input"
          disabled={submitting}
          onChange={(event) => setImageFile(event.target.files?.[0] || null)}
          type="file"
        />
        <input
          className="text-input"
          disabled={submitting}
          onChange={(event) => setTags(event.target.value)}
          placeholder="Tags: sketch, reel, layout"
          value={tags}
        />
      </div>

      {error ? <p className="error-text">{error}</p> : null}

      <div className="row-actions">
        <span className="muted-text">Images help creators show process, not just final outcomes.</span>
        <button className="primary-button" disabled={submitting} type="submit">
          {submitting ? "Posting..." : "Post update"}
        </button>
      </div>
    </form>
  );
}

export default PostComposer;
