module.exports = ({
  github,
  context
}) => {
  console.log(github)
  return context.payload.client_payload.value
}
