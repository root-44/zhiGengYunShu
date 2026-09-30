import { lazy, Suspense } from "react";
import Loading from "./loading";

const Demo = lazy(() => import("./demo"));

interface IndexProps {
  scope?: "admin" | "farmer";
}

export default function Index({ scope = "admin" }: IndexProps) {
  return (
    <Suspense fallback={<Loading />}>
      <Demo scope={scope} />
    </Suspense>
  );
}
