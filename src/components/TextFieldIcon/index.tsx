import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import { FieldType } from 'models/enums/fieldTypes';
import React, { useEffect } from 'react';
import { useState } from 'react';

interface TextFieldIconProps {
  onFocus?: (event: any) => void;
  onBlur?: (event: any) => void;
  onChange?: (event: any) => void;
  error?: boolean;
  helperText?: string;
  classes?: any;
  endIcon?: any;
  startIcon?: any;
  autoComplete?: any;
  type?: FieldType;
  value?: string | number;
  placeholder: string;
  min?: number;
  max?: number;
  other?: any[];
}

interface TextFieldIconState {
  shrink: boolean;
}

const TextFieldIcon = ({
  other,
  placeholder,
  classes,
  autoComplete,
  endIcon,
  startIcon,
  onFocus,
  onBlur,
  onChange,
  error,
  helperText,
  type,
  value,
  min,
  max
}: TextFieldIconProps) => {
  const [shrink, setShrink] = useState(value !== undefined);

  const shrinkLabel = (event) => {
    setShrink(true);

    if (onFocus) {
      onFocus(event); // let the child do it's thing
    }
  };

  const unShrinkLabel = (event) => {
    if (event.target.value.length === 0) {
      setShrink(false);
    }

    if (onBlur) {
      onBlur(event); // let the child do it's thing
    }
  };

  return (
    <TextField
      {...other}
      fullWidth
      type={type}
      onFocus={shrinkLabel}
      onBlur={unShrinkLabel}
      onChange={onChange}
      label={placeholder}
      error={error}
      helperText={helperText}
      value={value}
      InputLabelProps={{
        shrink: shrink,
        sx: {
          '&:not(.MuiInputLabel-shrink)': {
            paddingLeft: '30px'
          }
        },
        classes
      }}
      InputProps={{
        autoComplete,
        endAdornment: endIcon && (
          <InputAdornment position={'end'}>{endIcon}</InputAdornment>
        ),
        startAdornment: startIcon && (
          <InputAdornment position={'start'}>{startIcon}</InputAdornment>
        )
      }}
      inputProps={{
        min,
        max
      }}
    />
  );
};

export default TextFieldIcon;
