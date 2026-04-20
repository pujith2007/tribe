import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useAppContext } from "../hooks/useAppContext";

const STEPS = [
  {
    title: "Track visible progress",
    description:
      "Post one meaningful update each day, even if it is unfinished. Consistency matters more than polish.",
  },
  {
    title: "Build accountability",
    description:
      "Follow other creators, leave comments, and use the feed as a lightweight studio circle.",
  },
  {
    title: "Reflect with data",
    description:
      "Your profile turns uploads, likes, and views into signals you can discuss during critiques or a viva.",
  },
];

function TutorialModal() {
  const [stepIndex, setStepIndex] = useState(0);
  const { tutorialOpen, setTutorialOpen } = useAppContext();
  const { user } = useAuth();

  if (!tutorialOpen) {
    return null;
  }

  const step = STEPS[stepIndex];

  function closeTutorial() {
    localStorage.setItem(`creative-pulse-tutorial-${user.uid}`, "seen");
    setTutorialOpen(false);
    setStepIndex(0);
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <p className="eyebrow">Quick walkthrough</p>
        <h2>{step.title}</h2>
        <p>{step.description}</p>
        <div className="tutorial-dots">
          {STEPS.map((item, index) => (
            <span
              key={item.title}
              className={index === stepIndex ? "tutorial-dot active" : "tutorial-dot"}
            />
          ))}
        </div>
        <div className="row-actions">
          <button className="ghost-button" onClick={closeTutorial} type="button">
            Skip
          </button>
          <button
            className="primary-button"
            onClick={() => {
              if (stepIndex === STEPS.length - 1) {
                closeTutorial();
                return;
              }

              setStepIndex((current) => current + 1);
            }}
            type="button"
          >
            {stepIndex === STEPS.length - 1 ? "Start posting" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TutorialModal;
