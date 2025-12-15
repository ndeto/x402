#
# ENS Identity Extension

**What**: Optional `ens` metadata that lets x402 participants attach ENS identities to a payment
without changing settlement semantics. Any party that includes ENS identity MUST provide its ENS
name and MAY include hints pointing to relevant ENS records.

**Why**: ENS already acts as a multichain identity layer inside Ethereum tooling. Many apps and
wallets rely on ENS names, text records, and per-network `addr` records to represent merchants,
customers, and agents. The `ens` extension lets x402 reuse that surface. Implementations that do
not care about ENS can ignore the extension entirely.

## Extension Identifier

```
ens
```

## Server `PaymentRequired` example

Servers SHOULD populate `info.payee` when advertising the ENS extension and MAY omit `info.payer`.

```json
{
  "extensions": {
    "ens": {
      "info": {
        "payee": {
          "ens": "merchant.eth",
          "message": "merchant with payment preferences and agent for receiving payments",
          "records": {
            "text": ["agent-context", "email", "description", "url"],
            "data": ["location-credential", "gov-id-credential"]
          }
        }
      },
      "schema": { /* see JSON Schema below */ }
    }
  }
}
```

## Client `PaymentPayload` example

Clients MUST echo `info.payee` exactly as received and MAY append their own `info.payer` entry when
submitting the payment.

```json
{
  "extensions": {
    "ens": {
      "info": {
        "payee": {
          "ens": "merchant.eth",
          "message": "merchant with payment preferences and agent for receiving payments",
          "records": {
            "text": ["agent-context", "email", "description", "url"],
            "data": ["location-credential", "gov-id-credential"]
          }
        },
        "payer": {
          "ens": "customer-agent-name.eth",
          "message": "a service agent of customer-name.eth, with delegated credentials",
          "records": {
            "text": ["agent-context", "email", "description", "url"],
            "data": ["parent-account", "delegate-certificate"]
          }
        }
      },
      "schema": { /* see JSON Schema below */ }
    }
  }
}
```

## ENS JSON Schema (`info`)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "payee": {
      "type": "object",
      "properties": {
        "ens": { "type": "string" },
        "message": { "type": "string" },
        "records": {
          "type": "object",
          "properties": {
            "text": { "type": "array", "items": { "type": "string" } },
            "data": { "type": "array", "items": { "type": "string" } }
          }
        }
      },
      "required": ["ens"]
    },
    "payer": {
      "type": "object",
      "properties": {
        "ens": { "type": "string" },
        "message": { "type": "string" },
        "records": {
          "type": "object",
          "properties": {
            "text": { "type": "array", "items": { "type": "string" } },
            "data": { "type": "array", "items": { "type": "string" } }
          }
        }
      },
      "required": ["ens"]
    }
  },
  "required": ["payee"]
}
```

## Semantics

- Extension is informational; ignore it if ENS is irrelevant to your flow.
- Treat `info.payee`/`info.payer` as canonical ENS hints for the parties; use `records.text` /
  `records.data` to decide which ENS records to inspect for context.
- Clients MUST echo the server-provided `info.payee` verbatim, MUST NOT delete or rewrite those
  fields, and MAY append `info.payer`.
- Never treat ENS identities as settlement targets; `payTo`, scheme, and network rules still govern
  payment routing.
- ENS data is not proof of ownership or authorization. Bind to a stronger assertion (e.g., SIWx) if
  your use case depends on verified ENS control.

## Runtime helpers

See `core.ts` for the builder/validator helpers:

- `buildEnsExtension(info)` – attach the JSON Schema to an `EnsInfo` payload.
- `declareEnsExtension(info)` – build and validate in one step, returning `extension` or errors.
- `validateEnsExtension(extension)` – validate an already constructed extension.
