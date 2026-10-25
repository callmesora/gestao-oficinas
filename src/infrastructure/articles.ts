import { isolatedWorkflowPost } from "./workflow-http";
import type { ArticleRepository } from "../application/articles";

export async function isolatedArticleRepository(): Promise<ArticleRepository> {
  const [post, units] = await Promise.all([isolatedWorkflowPost("articles", "Article request failed"), isolatedWorkflowPost("units", "Unit request failed")]);
  return {
    list: input => post("list", input), save: command => post("save", command),
    checkDelete: id => post("check-delete", { id }), remove: id => post("delete", { id }),
    units: () => units("list", { sort: "Codigo", descending: false }),
  };
}
