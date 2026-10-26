import { useState } from "react";
import { createRoot } from "react-dom/client";
import { DialogProvider, useDialogs } from "../../src/ui/legacy/dialogs";
import type { MessageRequest } from "../../src/ui/legacy/message-state";
import type { ResourceRequest } from "../../src/ui/legacy/resource-state";
import { VehicleEditor } from "../../src/ui/vehicles";
import { isolatedVehicleRepository } from "../../src/infrastructure/vehicles";
import { isolatedCustomerRepository } from "../../src/infrastructure/customers";
import type { VehicleRepository } from "../../src/application/vehicles";
import type { CustomerRepository } from "../../src/application/customers";

type ProofDialogRequest = { kind: "message"; request: MessageRequest } | { kind: "resource"; request: ResourceRequest };

// This private caller supplies requests and observes awaited values only. All
// rendering, measurement, native HTML-dialog keys and result ownership are the
// production DialogProvider/MessageBox/ResourceBox path, without replacements.
function Caller({ requests }: { requests: ProofDialogRequest[] }) {
  const { message, resource } = useDialogs();
  const [results, setResults] = useState<unknown[]>([]);
  const [settled, setSettled] = useState(0);
  return <div data-testid="proof-core-caller">
    <button data-testid="proof-core-open" onClick={() => {
      setResults([]); setSettled(0);
      const pending = requests.map(item => (item.kind === "message" ? message(item.request) : resource(item.request))
        .then(value => { setSettled(count => count + 1); return value; }));
      void Promise.all(pending).then(setResults);
    }}>Abrir</button>
    <input data-testid="proof-core-background" defaultValue="parent draft" />
    <output data-testid="proof-core-results">{JSON.stringify(results)}</output>
    <output data-testid="proof-core-settled">{settled}</output>
  </div>;
}

export function mount(requests: ProofDialogRequest[]) {
  const container = document.createElement("div");
  document.body.append(container);
  createRoot(container).render(<DialogProvider><Caller requests={requests} /></DialogProvider>);
}

function VehicleCaller({ initialRegistration, repositories }: {
  initialRegistration: string; repositories: { vehicles: VehicleRepository; customers: CustomerRepository };
}) {
  const [opened, setOpened] = useState(false), [returned, setReturned] = useState<boolean | null>(null);
  return <>
    <button data-testid="proof-core-vehicle-open" onClick={() => { setReturned(null); setOpened(true); }}>Abrir viatura</button>
    {opened && <VehicleEditor repositories={repositories} initialRegistration={initialRegistration} finish={saved => { setReturned(saved); setOpened(false); }} />}
    <output data-testid="proof-core-vehicle-result">{returned === null ? "pending" : String(returned)}</output>
  </>;
}

export async function mountVehicleCaller(initialRegistration: string) {
  const [vehicles, customers] = await Promise.all([isolatedVehicleRepository(), isolatedCustomerRepository()]);
  const container = document.createElement("div"); document.body.append(container);
  createRoot(container).render(<DialogProvider><VehicleCaller initialRegistration={initialRegistration} repositories={{ vehicles, customers }} /></DialogProvider>);
}
