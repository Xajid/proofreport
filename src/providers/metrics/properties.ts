export type PropertyCandidate = { id: string; label: string };

export async function listGa4Properties(token: string): Promise<PropertyCandidate[]> {
  const res = await fetch("https://analyticsadmin.googleapis.com/v1beta/accountSummaries?pageSize=200", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return [];
  const json = (await res.json()) as {
    accountSummaries?: {
      displayName?: string;
      propertySummaries?: { property?: string; displayName?: string }[];
    }[];
  };
  const rows: PropertyCandidate[] = [];
  for (const account of json.accountSummaries ?? []) {
    for (const property of account.propertySummaries ?? []) {
      if (!property.property) continue;
      const accountName = account.displayName ? `${account.displayName} · ` : "";
      rows.push({
        id: property.property,
        label: `${accountName}${property.displayName || property.property}`,
      });
    }
  }
  return rows;
}

export async function listGscSites(token: string): Promise<PropertyCandidate[]> {
  const res = await fetch("https://www.googleapis.com/webmasters/v3/sites", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return [];
  const json = (await res.json()) as { siteEntry?: { siteUrl?: string; permissionLevel?: string }[] };
  return (json.siteEntry ?? [])
    .filter((site) => site.siteUrl)
    .map((site) => ({
      id: site.siteUrl as string,
      label: site.permissionLevel ? `${site.siteUrl} (${site.permissionLevel})` : (site.siteUrl as string),
    }));
}

export function matchingSites(sites: PropertyCandidate[], domain: string): PropertyCandidate[] {
  const host = domain.replace(/^https?:\/\//, "").replace(/\/$/, "").toLowerCase();
  return sites.filter((site) => site.id.toLowerCase().includes(host));
}
