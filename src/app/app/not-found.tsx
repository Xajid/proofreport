import Link from "next/link";
import { FileSearch } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppNotFound() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="panel max-w-md p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <FileSearch className="h-6 w-6" />
        </div>
        <h2 className="font-display text-xl font-semibold text-slate-900">
          Page not found
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          The client or report you requested could not be found in this workspace.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Link href="/app">
            <Button size="sm">Back to overview</Button>
          </Link>
          <Link href="/app/clients">
            <Button size="sm" variant="outline">
              View clients
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

