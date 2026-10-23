# Authentication and permissions inventory

Evidence: [WIN_Acesso](WIN_Acesso.md), [WIN_MENU](WIN_MENU.md), [utilizadores](utilizadores.md), [mecanicos](mecanicos.md), [password quantity entry](WIN_Inserir_quantidade_password.md), and the material/labor workflow maps.

The application selects a user from utilizadores and compares the input password through the legacy access workflow. The main menu can initialize a user record when the file is empty; the mapping redacts credential assignments. Mechanics also have legacy password fields used by workflow validation. Actual credential values are not copied into notes, fixtures, tools output or Git.

Source-level button visibility, restricted command-line modes, mechanic checks and passwords are recorded in individual events; they are not evidence of a new role/permission system. A new authentication scheme, password handling, Groupware replacement or changed rights model requires later framing. No target accounts or authorization code were created.

U-PERM-01: establish deployed users, administrative rights and any externally managed restrictions from a legacy session/owner inventory. Interim: preserve observed checks and keep the original password data local; do not infer permission from hidden controls alone.
