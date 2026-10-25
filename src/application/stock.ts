import type { StockList, StockListResult, StockReadResult, StockSave, StockSaveResult, StockDeleteResult, StockInventoryResult, StockRebuildResult, StockLookupResult, StockNextResult, ScannerConfigResult, ScannerRow, ScannerResult } from "../../packages/domain/src/stock";
export interface StockRepository {
  list(input: StockList): Promise<StockListResult>;
  read(id: string): Promise<StockReadResult>;
  next(document: string): Promise<StockNextResult>;
  lookup(code: string, barcode?: boolean): Promise<StockLookupResult>;
  save(command: StockSave): Promise<StockSaveResult>;
  remove(id: string): Promise<StockDeleteResult>;
  inventory(): Promise<StockInventoryResult>;
  rebuild(): Promise<StockRebuildResult>;
  scannerConfig(): Promise<ScannerConfigResult>;
  scannerPartition(rows: ScannerRow[]): Promise<ScannerResult>;
}
