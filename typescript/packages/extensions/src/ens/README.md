# ENS Identity Extension

The ENS extension carries optional metadata so x402 participants can attach ENS identities to a payment without changing settlement semantics. Any party that includes ENS identity MUST provide its ENS name and MAY include hints pointing to relevant ENS records. 

ENS already acts as a multichain identity layer across Ethereum tooling—many apps and wallets rely on ENS names, text records, and per-network `addr` records to represent merchants, customers, and agents—so the `ens` extension simply reuses that surface. Clients or servers that do not care about ENS can ignore the extension entirely.

## Server `PaymentRequired` example

Servers SHOULD populate `info.payee` whenever they advertise the ENS extension in `PaymentRequired`. The snippet below shows a resource responding to a paymentless request with a `PaymentRequired` response (HTTP 402) and including its ENS identity (name, optional message, and the records it believes are relevant). `info.payer` is typically omitted at this stage because the server doesn’t know the client identity yet; it’s the client’s job to attach `info.payer` when it constructs the `PaymentPayload`.

```json
{
  "extensions": {
    "ens": {
      "info": {
        "payee": {
          "ens": "merchant.eth",
          "message": "merchant identity with supporting KYC/KYB records",
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
          "message": "merchant identity with supporting KYC/KYB records",
          "records": {
            "text": ["agent-context", "email", "description", "url"],
            "data": ["location-credential", "gov-id-credential"]
          }
        },
        "payer": {
          "ens": "customer-agent-name.eth",
          "message": "customer agent identity with verification records referenced below",
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
- ENS extension data is not proof of ownership or authorization.

## Runtime helpers

See `core.ts` for the builder/validator helper. In most cases you only need:

- `declareEnsExtension(info)` – builds the extension and validates it, returning `{ valid, errors, extension }`.

### Example

```ts
import { declareEnsExtension } from "@x402/extensions/ens";

const result = declareEnsExtension({
  payee: {
    ens: "merchant.eth",
    message: "merchant identity with KYC hints",
    records: {
      text: ["kyc-provider", "support-email"],
      data: ["kyc-credential", "aml-credential"],
    },
  },
});

if (!result.valid || !result.extension) {
  console.error("Invalid ENS extension:", result.errors);
  throw new Error("Failed to build ENS extension");
}

const ensExtension = result.extension;
```
