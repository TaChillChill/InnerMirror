// Entry for rendering the film with the Remotion CLI (the browser viewer uses main.tsx).
//   npx remotion render src/remotion.tsx Film public/out/innermirror-roughcut.mp4
import { Composition, registerRoot } from "remotion";
import { loadFont } from "@remotion/google-fonts/Nunito";
import { Film } from "./Film";
import { FPS, HEIGHT, TOTAL_SEC, WIDTH } from "./story";

loadFont("normal", { weights: ["400", "500", "600", "700", "800"], subsets: ["latin"] });

function Root() {
  return <Composition id="Film" component={Film} durationInFrames={TOTAL_SEC * FPS} fps={FPS} width={WIDTH} height={HEIGHT} />;
}

registerRoot(Root);
