import FormControl from '@mui/material/FormControl/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel/FormControlLabel';
import FormLabel from '@mui/material/FormLabel/FormLabel';
import Radio from '@mui/material/Radio/Radio';
import RadioGroup from '@mui/material/RadioGroup/RadioGroup';
import { RadioGroupDirection } from 'models/enums/radioGroupDirection';
import { RadioFormField } from 'models/fieldsConfigs';

const TextFieldRadioGroup = ({
  field,
  formValues,
  setValues,
  isFieldValid
}) => {
  return (
    <FormControl
      sx={{
        '&': {
          paddingBottom: '30px',
          alignSelf: 'center',
          display: 'flex',
          alignItems: 'center'
        }
      }}
    >
      <FormLabel id={field.objectLocation + '-group-label'}>
        {field.placeholder}
      </FormLabel>
      <RadioGroup
        row={(field as RadioFormField).direction === RadioGroupDirection.ROW}
        aria-labelledby={field.objectLocation + '-group-label'}
        name={field.objectLocation + '-radio-buttons-group'}
        value={formValues[field.objectLocation]}
        onChange={({ target }) => {
          const newValues = { ...formValues };
          newValues[field.objectLocation] = target.value;

          setValues(newValues);
        }}
        onBlur={() => {
          isFieldValid(field);
        }}
      >
        {(field as RadioFormField).children.map((child) => (
          <FormControlLabel
            key={child.value}
            value={child.value}
            control={<Radio />}
            label={child.label}
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
};

export default TextFieldRadioGroup;
