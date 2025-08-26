import React from 'react';
import { IMaskInput } from 'react-imask';

const CpfMaskAdapter = React.forwardRef(function CpfMaskAdapter(props, ref) {
  const { onChange, ...other } = props;
  return (
    <IMaskInput
      {...other}
      mask="000.000.000-00"
      inputRef={ref}
      onAccept={(value) => onChange({ target: { name: props.name, value } })}
      overwrite
    />
  );
});

export default CpfMaskAdapter;
