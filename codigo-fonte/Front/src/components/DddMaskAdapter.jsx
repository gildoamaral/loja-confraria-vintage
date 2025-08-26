import React from 'react';
import { IMaskInput } from 'react-imask';

const DddMaskAdapter = React.forwardRef(function DddMaskAdapter(props, ref) {
  const { onChange, ...other } = props;

  return (
    <IMaskInput
      {...other}
      mask="00"
      placeholder="DDD"
      inputRef={ref}
      onAccept={(value) => onChange({ target: { name: props.name, value } })}
      overwrite
    />
  );
});

export default DddMaskAdapter;
