# veryshort.me

A secure, fast URL shortener service built with Next.js.

## Live Demo

Visit [veryshort.me](https://veryshort.me) to try it out!

## Features

- Instantly shorten any URL
- Clean and simple user interface
- RESTful API support with token-based authentication
- Proxy for sending DELETE requests to the original URL via the browser
- End-to-end encryption for authenticated URLs
- Secure token validation
- URL expiration support
- Separate storage for authenticated and anonymous URLs

## Security Features

- AES-256-CBC encryption for authenticated URLs
- Cryptographically secure tokens required for API access
- URLs can be set to automatically expire
- Deletion endpoints require token verification
- Secure proxy system for DELETE requests
- No access to other users' shortened URLs

## API Documentation

Full API documentation is available at [veryshort.me/api](https://veryshort.me/api)

The API allows you to:
- Create shortened URLs with optional encryption
- Retrieve original URLs securely
- Delete URLs with token authentication
- Set URL expiration times

## Development

This is a Next.js project. To run it locally:
