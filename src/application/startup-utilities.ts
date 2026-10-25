import type { ReceptionCustomerReassignmentResult } from "../../packages/domain/src/startup-utilities";
export interface StartupUtilityRepository { reassignReceptionCustomers(): Promise<ReceptionCustomerReassignmentResult> }
