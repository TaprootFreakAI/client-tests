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
- payment standards list, per-id detail, unknown id 404
- wallet apps list, recommended, every listed app by id, unknown id 404
- paymentLink recipient lookup, missing id, unknown id
- unauthenticated merchant routes (401/403 and public locations)
- full pay-request schema (including every transferAmounts entry)
- POST `/lnurlp/{id}` without amount is 400
- a callback GET for every **available** method×asset pair on the live pay-request
- callback quote-only Lightning default, missing asset, unknown quote, unavailable methods
- `/lnurlp/tx` rejects a missing quote and rejects missing hex/tx/sender

Out of scope: paying, broadcasting signed txs, cancel, wait (`/lnurlp/wait`), creating payment links with credentials.

## License

MIT
