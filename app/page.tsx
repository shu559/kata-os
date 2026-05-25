// トップページ。状態を持つ部分は components/Dashboard.tsx に集約。
// page.tsx は意図的に薄く保つ（KATA本体の page.tsx 肥大化の反省）。

import { Dashboard } from "@/components/Dashboard";

export default function Home() {
  return <Dashboard />;
}
