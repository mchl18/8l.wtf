# 8l.wtf

8 letters is all you need.
Anonymous, encrypted, and fast.

A secure, fast URL shortener service built with Next.js.

## Live Demo

Visit [8l.wtf](https://8l.wtf) to try it out!

## Features

- Instantly shorten any URL
- Clean and simple user interface
- RESTful API support with token-based authentication
- Proxy for sending DELETE requests to the original URL via the browser
- End-to-end encryption for authenticated URLs
- Secure token validation
- URL expiration support
- Separate storage for authenticated and anonymous URLs
- Support for private URLs with zero-knowledge encryption - the server never sees the original URL
- Support for inviting users to your account/token

## Security Features

- AES-256-CBC encryption for authenticated URLs
- Zero-knowledge encryption for private URLs - only token holders can decrypt
- Cryptographically secure tokens required for API access
- URLs can be set to automatically expire
- Deletion endpoints require token verification
- Secure proxy system for DELETE requests
- No access to other users' shortened URLs

## How Private URLs Work

When a URL is marked as private:

1. The URL is encrypted client-side using the token as the encryption key
2. Only the encrypted URL is stored on the server
3. The server cannot decrypt or view the original URL
4. When someone visits the shortened URL, they must provide the token. It can be in their localStorage or as a query parameter.
5. The token is used client-side to decrypt and redirect to the original URL
6. Without the token, the URL contents remain completely private

## How Secure URL Indexing Works

To enable users to retrieve their URLs while maintaining security:

1. The server provides a public seed (NEXT_PUBLIC_SEED)
2. Users encrypt this seed with their private key to generate a unique hex seed
3. This hex seed is used to index their URLs in the database
4. Only someone with the same private key can generate the same hex seed
5. This allows users to list their URLs without exposing their private key
6. The server never sees or stores the private key
7. Even if the database is compromised, URLs remain encrypted

## API Documentation

Full API documentation is available at [8l.wtf/api](https://8l.wtf/api)

The API allows you to:

- Create shortened URLs with optional encryption
- Retrieve original URLs securely
- Delete URLs with token authentication
- Set URL expiration times

## Environment Variables

- `NEXT_PUBLIC_HOSTNAME`: The hostname of the server (e.g. `localhost:3000`)
- `NEXT_PUBLIC_DEFAULT_URL`: The default URL to redirect to (e.g. `https://8l.wtf`)
- `NEXT_PUBLIC_REDIRECT_DELAY`: The delay in milliseconds before redirecting to the original URL (e.g. `5000`)
- `NEXT_PUBLIC_DB_TYPE`: The type of database to use (e.g. `kv`)

## Development

This is a Next.js project. To run it locally:

```bash
npm run dev
# or
yarn dev
```

## Database Adapters (Work in Progress)

Currently works best with Vercel KV (Redis) adapter.

Postgres adapter is a work in progress.

Rest have not been tested.

- If you want to use Vercel KV, you need to set the `KV_URL` environment variable.
- If you want to use Redis, you need to set the `REDIS_URL` environment variable.
- If you want to use Postgres, you need to set the `POSTGRES_URL` environment variable.
- If you want to use MySQL, you need to set the `MYSQL_URL` environment variable.
- If you want to use MongoDB, you need to set the `MONGO_URL` environment variable.
- If you want to use SQLite, you need to set the `SQLITE_URL` environment variable.
