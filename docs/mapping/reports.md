# Report inventory

All 28 report units have a mapping note, a report specification, a parity CSV and independent review. The [unit index](README.md) links them. There are 27 report designer images; the combined detailed material-consumption report lacks one.

- Nine master-list reports use embedded SQL that the dossier does not print. Compiler evidence recovers selected items; filter/sort/destination proposals remain assumed.
- Material consumption reports distinguish document exits, repair materials and their union, detailed and summarized outputs, and vehicle-oriented outputs. Query joins, description filters and mechanic sources differ by branch.
- Labor reports group by order, mechanic or vehicle and implement source-specific string/rounding/reset rules. Labor start timestamp filtering is distinct from interval overlap.
- Order/delivery/payment reports use different data sources; some read live UI tables and inherited formatted values. Payment-report title/caption inconsistencies remain facts until a later decision changes them.
- Article statements use historical opening movements and current-period movements with inclusive boundaries; potential boundary overlap is retained as a question.

Report specs separate printed visible extents from hidden designer controls and keep inferred image readings distinct from parsed fields. Actual printer/PDF pagination, wrapping, empty reports, destination inheritance and golden outputs require later legacy evidence. No target report has been generated or visually accepted.
