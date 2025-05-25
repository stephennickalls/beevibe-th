// server/api/hello.ts
export default defineEventHandler(() => {
  // by default this will be sent as JSON,
  // so your browser/client will see:
  //   "hello world"
  return 'hello world'
})
