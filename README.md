# Priority Task Manager

Backend for task managing with the use of  **Node.js**, **TypeScript**, and **Socket.IO**.

---

## Dependency installation

```bash
npm install
```

## Run backend locally (development)

```bash
npm run dev
```
Server will be listening on http://localhost:3000


## Run tests

```bash
npm run test
```

## Run the client listener for manual testing

```bash
npx ts-node tests/clientListener.ts
```

## Run the client caller for manual testing

```bash
npx ts-node tests/clientCaller.ts
```

## Run backend through Docker (production)

```bash
docker-compose up
```