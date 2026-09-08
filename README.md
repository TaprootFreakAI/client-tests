# Open CryptoPay client tests

Tests for the Open CryptoPay API at [api.dfx.swiss](https://api.dfx.swiss).

Protocol description: [opencryptopay.io](https://opencryptopay.io) · [openCryptoPay/landingPage](https://github.com/openCryptoPay/landingPage)

## Run

Requires Node.js 22+.

```bash
npm test
```

No install step — there are no npm dependencies.

## Environment

| Variable       | Default                              | Meaning                                      |
|----------------|--------------------------------------|----------------------------------------------|
| `OCP_BASE_URL` | `https://api.dfx.swiss/v1`           | API base URL (no trailing slash)             |
| `OCP_LINK_ID`  | `pl_beeddb41cd4b6d9e`                | Public demo payment link from the protocol docs |

## Scope

Coverage:

- LNURL encode/decode
- payment standards list and per-id detail
- wallet apps list, recommended, and per-id detail
- paymentLink recipient lookup
- full pay-request schema (including every transferAmounts entry)
- a callback GET for every **available** transfer method on the live pay-request
- that `/lnurlp/tx` rejects a missing quote

These tests never pay, never broadcast transactions, never cancel payments, never create payment links, and never wait on `/lnurlp/wait`. They only `GET` public unauthenticated wallet-client endpoints.

## License

MIT
