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

| Variable         | Default                              | Meaning                                      |
|------------------|--------------------------------------|----------------------------------------------|
| `OCP_BASE_URL`   | `https://api.dfx.swiss/v1`           | API base URL (no trailing slash)             |
| `OCP_LINK_ID`    | `pl_beeddb41cd4b6d9e`                | Public demo payment link from the protocol docs |
| `OCP_ACCESS_KEY` | *(empty)*                            | Optional POS access key; empty skips POS create/cancel |
| `OCP_POS_LINK_ID` | *(empty)*                           | Payment link for POS create/cancel (not the demo link) |

## Scope

Coverage (default `npm test` covers the full **unauthenticated** Open CryptoPay HTTP surface):

- LNURL encode/decode
- payment standards list, per-id detail, unknown id 404
- wallet apps list, recommended, every listed app by id, unknown id 404, `blockchain` / `active` query filters
- paymentLink recipient lookup, missing id, unknown id
- unauthenticated merchant routes (401/403 and public locations)
- locations filtered by `publicName`
- full pay-request schema (including every transferAmounts entry)
- POST `/lnurlp/{id}` without amount is 400
- a callback GET for every **available** method×asset pair on the live pay-request
- callback quote-only Lightning default, missing asset, unknown quote, unavailable methods
- `/lnurlp/tx` rejects a missing quote, missing hex/tx/sender, and invalid hex
- `/lnurlp/wait` unknown id 404; pending wait aborts via client timeout
- `PUT /paymentLink/assign` empty body validation
- `DELETE /lnurlp/cancel` unknown id 404
- unauthenticated `POST /paymentLink/payment` (missing amount 400, no credentials 404)
- LNURL sibling routes (`/lnurlw`, `/lnurld`, `/lnurla`)
- optional POS payment create/cancel when `OCP_ACCESS_KEY` is set

Out of scope without credentials: completing a real on-chain payment. Cancel of the **demo** link remains out of scope; unknown-id cancel 404 is in scope. Never send a valid signed tx.

## License

MIT
