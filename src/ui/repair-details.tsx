import { useEffect, useRef, useState } from "react";
import type { RepairLaborRepository } from "../application/repair-labor";
import type { RepairMaterialsRepository } from "../application/repair-materials";
import type { ArticleRepository } from "../application/articles";
import type { MechanicRepository } from "../application/mechanics";
import { RepairDescriptionsDialog } from "./repair-labor";
import { RepairMaterialsDialog } from "./repair-materials";

/** Compose the actual source dialogs without holding a database connection across them. */
export function RepairDetailsDialog({ repositories, numero, finish }: {
  repositories: { labor: RepairLaborRepository; materials: RepairMaterialsRepository; articles: ArticleRepository; mechanics: MechanicRepository };
  numero: string; finish: () => void;
}) {
  const [material, setMaterial] = useState<{ orderId: string; resolve: () => void } | null>(null);
  const pending = useRef<(() => void) | null>(null);
  useEffect(() => () => { pending.current?.(); pending.current = null; }, []);
  return <>
    <RepairDescriptionsDialog repository={repositories.labor} numero={numero} finish={finish}
      onMaterial={order => new Promise<void>(resolve => { pending.current = resolve; setMaterial({ orderId: order.id, resolve }); })} />
    {material && <RepairMaterialsDialog repository={repositories.materials} orderId={material.orderId}
      articleRepository={repositories.articles} mechanicRepository={repositories.mechanics}
      finish={() => { pending.current = null; setMaterial(null); material.resolve(); }} />}
  </>;
}
