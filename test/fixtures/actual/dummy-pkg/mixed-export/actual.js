export const something = () => {};

const MixedExport = React.forwardRef(function MixedExport(props, ref) {
  return null;
});

export default withHoC(something, {
  name: 'MixedExport'
})(MixedExport);
