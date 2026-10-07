import { jakartaFont, soraFont, spaceMonoFont } from "./fonts";
import { InteractiveJourneySection } from "./journey/InteractiveJourneySection";

// Normal document flow gives accordions room to expand on touch devices and small screens.
// The same interactive demos remain available when reduced motion is preferred.
export function SolutionSection() {
  return <div className={`${soraFont.variable} ${jakartaFont.variable} ${spaceMonoFont.variable}`}>
    <InteractiveJourneySection variant="standalone" />
  </div>;
}
