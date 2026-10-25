import type { ArticleList, ArticleListResult, ArticleSave, ArticleSaveResult, ArticleDeleteResult } from "../../packages/domain/src/articles";
import type { UnitListResult } from "../../packages/domain/src/units";

export interface ArticleRepository {
  list(input: ArticleList): Promise<ArticleListResult>;
  save(command: ArticleSave): Promise<ArticleSaveResult>;
  checkDelete(id: string): Promise<ArticleDeleteResult | { kind: "ready" }>;
  remove(id: string): Promise<ArticleDeleteResult>;
  units(): Promise<UnitListResult>;
}
