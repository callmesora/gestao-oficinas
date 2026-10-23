# Foundation-only controls

The temporary foundation status page is not a migrated legacy window and has no visual parity claim. Its non-legacy identifiers are foundation-preview (development fake-backend banner), foundation-inspect (metadata command button), foundation-info (validated metadata result). All are removed/replaced by the skin-kit launcher when that stage is ready. Its Portuguese error is a developer diagnostic, not an accepted replacement for a legacy message.

No legacy windows are configured in ui-check.config.json until implemented; an empty list must never be reported as complete legacy control coverage. The independent foundation flow tests the temporary page only. Native_info exposes build metadata; API liveness exposes process status, not database readiness. No business workflow, data access or permission is stubbed by these diagnostics.
