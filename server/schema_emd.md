# EMD: `public.logs` & `public.error_logs`

```
                         ┌───────────────────────────────┐
                         │         public.logs           │
                         ├───────────────────────────────┤
                         │ (PK) id            uuid       │ NOT NULL DEFAULT gen_random_uuid()
                         │ question           text       │ NULL
                         │ prompt             text       │ NULL
                         │ answer             text       │ NULL
                         │ session_id         uuid       │ NULL
                         └───────────────────────────────┘

                                    (no declared FK)
                                           │
                                           │  Shared attribute name & type
                                           ▼
                         ┌───────────────────────────────┐
                         │      public.error_logs        │
                         ├───────────────────────────────┤
                         │ (PK) id            uuid       │ NOT NULL DEFAULT gen_random_uuid()
                         │ error_time         timestamptz│ NOT NULL DEFAULT now()
                         │ status_code        integer    │ NOT NULL DEFAULT 500
                         │ message            text       │ NOT NULL
                         │ path               text       │ NULL
                         │ method             text       │ NULL
                         │ session_id         uuid       │ NULL
                         │ stack_trace        text       │ NULL
                         └───────────────────────────────┘
```

## Notes
- There is **no explicit foreign key** between the tables. Both include a `session_id uuid` column, which you may later choose to:
  - keep independent, or
  - convert into a relationship (e.g., add `FOREIGN KEY (session_id) REFERENCES some_sessions_table(id)` if a sessions table exists).
- Primary keys are UUIDs with server-side defaults via `gen_random_uuid()`.
- `error_time` uses `timestamptz` with `now()` so timestamps are timezone-aware.
- `status_code` defaults to **500** to match the global error handler's fallback.
