import LoadingButton from '@mui/lab/LoadingButton';
import {
  Card,
  CardContent,
  CardHeader,
  CardMedia,
  TextField
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  auth,
  logInWithEmailAndPassword,
  logout,
  sendPasswordReset
} from '../../firebaseConfig';
import Joi from 'joi';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';

import logo from '../../assets/logos/amiad_logo_transparent.png';
import mask from '../../assets/misc/mask-light.png';
import tree from '../../assets/misc/tree.png';
import tree3 from '../../assets/misc/tree-3.png';
import './login.scss';
import { getUserByID } from 'dal/users.dal';
import { UserRoles } from 'models/enums/userRoles';

const MySwal = withReactContent(Swal);

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const [valid, setValid] = useState(true);
  const [user, loading, error] = useAuthState(auth);
  const navigate = useNavigate();
  const { state } = useLocation();

  useEffect(() => {
    if (loading) {
      // maybe trigger a loading screen
      return;
    }
    if (user) {
      getUserByID(user.uid).then((userInfo) => {
        if (userInfo.role === UserRoles.ADMIN.value) {
          navigate((state as any)?.from ?? '/dashboard');
        } else {
          MySwal.fire({
            icon: 'error',
            title: 'אוי! נראה שאין לך גישה לכאן',
            text: 'נפלה טעות? כדאי לדבר עם מנהל המערכת',
            confirmButtonText: 'אוקיי'
          });
          logout();
        }
      });
    }
  }, [user, loading]);

  const signIn = async () => {
    try {
      await logInWithEmailAndPassword(email, password);
    } catch (error) {
      MySwal.fire({
        icon: 'error',
        title: 'אירעה שגיאה בהתחברות',
        text: error
      });
    }
  };

  const isEmailValid = (email: string) => {
    const validation = Joi.string()
      .required()
      .email({ tlds: { allow: false } })
      .messages({
        'string.email': 'כתובת מייל לא תקינה',
        'string.empty': 'יש למלא אימייל'
      })
      .validate(email);

    setValidationErrors({
      ...validationErrors,
      email: validation.error?.message
    });
    return validation.value;
  };

  const isPasswordValid = (password: string) => {
    const validation = Joi.string()
      .required()
      .messages({ 'string.empty': 'יש למלא סיסמה' })
      .validate(password);

    setValidationErrors({
      ...validationErrors,
      password: validation.error?.message
    });
    return validation.value;
  };

  const isFormValid = () => {
    const emailValidation = isEmailValid(email);
    const passwordValidation = isPasswordValid(password);

    return emailValidation && passwordValidation;
  };

  const resetPassword = async () => {
    const email = await Swal.fire({
      title: 'הכנס כתובת מייל',
      icon: 'question',
      input: 'email'
    });

    try {
      await sendPasswordReset(email.value);
      MySwal.fire({
        title: 'הצלחנו!',
        text: 'שלחנו לך קישור במייל. עקוב אחריו ואפס את סיסמתך',
        icon: 'success'
      });
    } catch (error) {
      MySwal.fire({
        title: 'שגיאה',
        text: 'הייתה שגיאה בשליחת המייל. נסה שנית',
        icon: 'error'
      });
    }
  };

  return (
    <div className="auth-wrapper auth-v1">
      <div className="auth-inner">
        <Card className="auth-card">
          <CardMedia component="img" src={logo}></CardMedia>

          <CardContent>
            <TextField
              fullWidth
              sx={{
                paddingBottom: '20px'
              }}
              label="שם משתמש"
              error={Boolean(validationErrors.email)}
              helperText={validationErrors.email}
              onChange={(event) => {
                setEmail(event.target.value);
              }}
              onBlur={() => {
                isEmailValid(email);
              }}
              required
            />
            <TextField
              fullWidth
              sx={{
                paddingBottom: '20px'
              }}
              type="password"
              label="סיסמה"
              onChange={(event) => {
                setPassword(event.target.value);
              }}
              error={Boolean(validationErrors.password)}
              helperText={validationErrors.password}
              onBlur={() => {
                isPasswordValid(password);
              }}
              required
            />

            <div
              style={{ paddingBottom: '20px' }}
              className="d-flex align-center justify-space-between flex-wrap"
              onClick={() => resetPassword()}
            >
              <a className="mt-1 ms-1"> שכחתי סיסמה </a>
            </div>

            <LoadingButton
              fullWidth
              variant="contained"
              disabled={!valid}
              loading={loading}
              onClick={() => {
                isFormValid() && signIn();
              }}
            >
              התחבר
            </LoadingButton>
          </CardContent>
        </Card>
      </div>

      <img className="auth-mask-bg" height="173" alt="mask" src={mask} />
      <img
        className="auth-tree"
        width="247"
        height="185"
        alt="tree"
        src={tree}
      />
      <img
        className="auth-tree-3"
        width="377"
        height="289"
        alt="tree"
        src={tree3}
      />
    </div>
  );
};

export default Login;
