"use client";

import dynamic from "next/dynamic";
import { MapProps } from "./Map";

const Map = dynamic(() => import("./Map"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-slate-800 animate-pulse flex items-center justify-center text-slate-400">
      Loading Map...
    </div>
  ),
});

export default function DynamicMap(props: MapProps) {
  return <Map {...props} />;
}
