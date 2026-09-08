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

These tests never pay, never broadcast transactions, never cancel payments, and never create payment links. They only `GET` public protocol endpoints (standards, wallet apps, pay request, callback quote fetch, recipient).

## License

MIT
