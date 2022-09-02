import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import React from 'react';
import { FormField, SyncSelectFormField } from 'models/fieldsConfigs';
import { FormHelperText } from '@mui/material';

export interface TextFieldSelectProps {
  field: FormField;
  onFocus?: (event: any) => void;
  onBlur?: (event: any) => void;
  value: any;
  onChange: (event: any) => void;
  error?: boolean;
  helperText?: string;
}

const TextFieldSelect = (props: TextFieldSelectProps) => {
  const [shrink, setShrink] = React.useState<boolean>(
    (props.value?.length ?? props.value ? 1 : 0) > 0
  );
  const field: SyncSelectFormField = props.field as SyncSelectFormField;

  const FieldIcon = field.icon;

  const shrinkLabel = (event) => {
    setShrink(true);

    if (props.onFocus) {
      props.onFocus(event); // let the child do it's thing
    }
  };

  const unShrinkLabel = (event) => {
    if (event.target.value?.length === 0) {
      setShrink(false); // gotta make sure the input is empty before shrinking the label
    }

    if (props.onBlur) {
      props.onBlur(event); // let the child do it's thing
    }
  };

  return (
    <FormControl
      fullWidth
      sx={{
        '&': {
          paddingBottom: '30px'
        }
      }}
    >
      <InputLabel
        id={field.objectLocation + '-select-label'}
        shrink={shrink}
        sx={{
          '&.MuiInputLabel-shrink': {
            backgroundColor: 'white',
            padding: '0 7px'
          },
          '&:not(.MuiInputLabel-shrink)': {
            paddingLeft: '30px'
          }
        }}
      >
        {field.placeholder}
      </InputLabel>
      <Select
        required={field.required}
        labelId={field.objectLocation + '-select-label'}
        id={field.objectLocation + '-select'}
        multiple={field.multiple}
        value={
          props.value !== undefined ? props.value : field.multiple ? [] : ''
        }
        onChange={props.onChange}
        onFocus={shrinkLabel}
        onBlur={unShrinkLabel}
        error={props.error}
        startAdornment={
          <InputAdornment position="start">
            <FieldIcon />
          </InputAdornment>
        }
      >
        {field.children?.map(
          (selectOption: { value: number; label: string }) => (
            <MenuItem key={selectOption.value} value={selectOption.value}>
              {selectOption.label}
            </MenuItem>
          )
        ) ?? (
          <MenuItem key="" disabled>
            אין אפשרויות
          </MenuItem>
        )}
      </Select>
      <FormHelperText>{props.helperText}</FormHelperText>
    </FormControl>
  );
};

export default TextFieldSelect;
