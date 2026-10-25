import type { UserList, UserListResult, UserReadResult, UserSave, UserSaveResult, UserDeleteResult } from "../../packages/domain/src/users";

export interface UserRepository {
  list(input: UserList): Promise<UserListResult>;
  read(input: { id: string }): Promise<UserReadResult>;
  save(command: UserSave): Promise<UserSaveResult>;
  remove(id: string): Promise<UserDeleteResult>;
}
