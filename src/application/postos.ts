import type { PostoList, PostoListResult, PostoSave, PostoSaveResult, PostoDeleteResult } from "../../packages/domain/src/postos";

export interface PostoRepository {
  list(input: PostoList): Promise<PostoListResult>;
  save(command: PostoSave): Promise<PostoSaveResult>;
  remove(id: string): Promise<PostoDeleteResult>;
}
