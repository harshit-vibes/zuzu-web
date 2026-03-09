import "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "spline-viewer": React.HTMLAttributes<HTMLElement> & {
        url?: string;
        "loading-anim-type"?: string;
        hint?: string;
      };
    }
  }
}
