import { IntegrationBrandLogo } from "@/components/integrations/IntegrationBrandLogo";
import { Icon } from "@/components/Icon";
import type { Integration } from "@/lib/types";

export function IntegrationLogoSlot({ integration }: { integration: Integration }) {
  return (
    <span className="h-10 w-10 rounded-lg bg-white border border-slate-100 grid place-items-center shrink-0 overflow-hidden">
      {integration.brand ? (
        <IntegrationBrandLogo brand={integration.brand} />
      ) : (
        <Icon name="plug" className="w-5 h-5 text-slate-400" />
      )}
    </span>
  );
}
