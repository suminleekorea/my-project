## Reviewing HTML and Markdown with human-review

After writing an HTML or Markdown file the user will read, open it for them with
`human-review <file.html>`, then block on
`human-review poll <file.html> --timeout 600` until they send feedback.
If it prints `{"status":"timeout"}`, no feedback arrived yet — run the same
poll command again to keep waiting. When a `{"status":"feedback"}` batch
arrives, apply it, then poll again with `--ack`.

Keep the poll command in the foreground and do not end the turn while it waits.
If the shell returns a process or session handle, keep waiting on that handle until
the command exits. `human-review status <file.html>` reports instantly
whether feedback is already waiting, without blocking.

The batch groups feedback by page under `pages`, so fix every page listed. Items
under `edits` are changes the user already made: `after` is their exact wording,
so carry it across verbatim and never revert it — and if the HTML was generated
from MDX or Markdown, apply it to the source too. Markdown files open rendered
and are never written by human-review: apply their comments and edits to the
Markdown source, keeping its syntax. There is no reply channel; the user sees
your work when the page reloads.
