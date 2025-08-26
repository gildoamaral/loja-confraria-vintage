import React from 'react';
import { IMaskInput } from 'react-imask';

const TelefoneMaskAdapter = React.forwardRef(function TelefoneMaskAdapter(props, ref) {
  const { onChange, ...other } = props;

  return (
    <IMaskInput
      {...other}
      mask="00000-0000"
      placeholder="00000-0000"
      inputRef={ref}
      onAccept={(value) => onChange({ target: { name: props.name, value } })}
      overwrite
    />
  );
});

export default TelefoneMaskAdapter;
