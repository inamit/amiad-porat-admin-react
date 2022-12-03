import {
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
  Typography
} from '@mui/material';
import FiberNewIcon from '@mui/icons-material/FiberNew';
import React, { useEffect } from 'react';
import { getString } from 'firebase/remote-config';
import { remoteConfig } from 'firebaseConfig';
import { getWhatsNew } from 'dal/config.dal';
import { useAppSelector } from 'store/store';
import { selectWhatsNew } from 'store/config/config.slice';

const HeaderWhatsNew = (props) => {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const whatsNew = useAppSelector(selectWhatsNew);

  return (
    <>
      <Tooltip title="מה חדש?">
        <IconButton
          color="primary"
          onClick={() => {
            setIsOpen(!isOpen);
          }}
        >
          <FiberNewIcon />
        </IconButton>
      </Tooltip>
      <Dialog
        open={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
      >
        <DialogTitle>מה חדש?</DialogTitle>
        <DialogContent>
          {whatsNew.length > 0 ? (
            <ul>
              {whatsNew.map((value) => {
                return <li key={value}>{value}</li>;
              })}
            </ul>
          ) : (
            'אין חדש כרגע :('
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HeaderWhatsNew;
