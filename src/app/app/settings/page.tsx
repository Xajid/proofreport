import { Suspense } from "react";
import { SettingsForm } from "./settings-form";

export default function SettingsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-stone-500">Loading settings…</p>}>
      <SettingsForm />
    </Suspense>
  );
}
