# ENS Identity Extension Example

This example demonstrates how to construct and inspect the x402 `ens` extension using the shared `@x402/extensions` package. It does **not** change payment routing or settlement semantics— it simply shows how to attach optional ENS identity hints for the payee and (optionally) the payer within `PaymentRequired` / `PaymentPayload`.

## Setup

From the repo root:

```bash
cd examples/typescript
pnpm install
pnpm build        # builds the workspace packages (including @x402/extensions)
cd clients/ens-extension
cp .env-local .env
```

Edit `.env` and set the required values:

| Variable                  | Purpose                                                                             | Required |
| ------------------------- | ----------------------------------------------------------------------------------- | -------- |
| `EVM_PRIVATE_KEY`         | Client private key used by the x402 SDK                                             | Yes      |
| `EVM_ADDRESS`             | Required for the bundled demo server (always used in this example)                  | Yes      |
| `RESOURCE_SERVER_URL`     | Override to point at your own resource server (defaults to the bundled demo server) | Optional |
| `ENS_PAYEE`               | Payee ENS identity advertised by the example server (defaults to `merchant.eth`)    | Optional |
| `ENS_PAYER`               | Payer ENS identity attached by the client when echoing the extension                 | Optional |

## Running the example

From this directory you have two options:

### Bundled demo server (default)

The example launches a local demo server on `http://localhost:4022`, exercises the ENS extension,
and shuts the server down when the flow finishes. Provide `EVM_PRIVATE_KEY` and `EVM_ADDRESS`, then
run:

```bash
pnpm dev
```

If you want to target your own resource server, set `RESOURCE_SERVER_URL` (and `ENDPOINT_PATH` if necessary)
before running the same command—the example will use the URL you provide instead of starting the demo server.
`pnpm dev:e2e` simply rebuilds `@x402/extensions` and then runs `pnpm dev` with the current environment.
