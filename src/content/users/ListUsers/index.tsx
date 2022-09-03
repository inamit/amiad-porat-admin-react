import {
  DataGrid,
  GridRowsProp,
  GridColumns,
  GridActionsCellItem,
  GridRowParams,
  GridRowId,
  GridRenderEditCellParams,
  useGridApiContext,
  GridRenderCellParams,
  GridValueSetterParams,
  GridRowModel
} from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import React, { useEffect } from 'react';
import { getAllUsers, getUsersWithRoleBiggerThan } from 'dal/users.dal';
import { UserRoles } from 'models/enums/userRoles';
import User from 'models/user';
import {
  getAllGroups,
  teacherHasGroupByDateTime,
  updateGroup
} from 'dal/groups.dal';
import Group from 'models/group';
import { DaysOfWeek } from 'models/enums/daysOfWeek';
import { TimePicker } from '@mui/x-date-pickers';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import { useAppSelector } from 'store/store';
import { selectGrades, selectSubjects } from 'store/config/config.slice';
import { getEnumByValue } from 'models/enums/enumUtils';
import { getHourStringFromDate } from 'utils/dateUtils';
import Alert, { AlertProps } from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import { Chip, Tooltip } from '@mui/material';

const StyledGridOverlay = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  '& .ant-empty-img-1': {
    fill: theme.palette.mode === 'light' ? '#aeb8c2' : '#262626'
  },
  '& .ant-empty-img-2': {
    fill: theme.palette.mode === 'light' ? '#f5f5f7' : '#595959'
  },
  '& .ant-empty-img-3': {
    fill: theme.palette.mode === 'light' ? '#dce0e6' : '#434343'
  },
  '& .ant-empty-img-4': {
    fill: theme.palette.mode === 'light' ? '#fff' : '#1c1c1c'
  },
  '& .ant-empty-img-5': {
    fillOpacity: theme.palette.mode === 'light' ? '0.8' : '0.08',
    fill: theme.palette.mode === 'light' ? '#f5f5f5' : '#fff'
  }
}));

const NoDataText = () => {
  return (
    <StyledGridOverlay>
      <svg
        width="120"
        height="100"
        viewBox="0 0 184 152"
        aria-hidden
        focusable="false"
      >
        <g fill="none" fillRule="evenodd">
          <g transform="translate(24 31.67)">
            <ellipse
              className="ant-empty-img-5"
              cx="67.797"
              cy="106.89"
              rx="67.797"
              ry="12.668"
            />
            <path
              className="ant-empty-img-1"
              d="M122.034 69.674L98.109 40.229c-1.148-1.386-2.826-2.225-4.593-2.225h-51.44c-1.766 0-3.444.839-4.592 2.225L13.56 69.674v15.383h108.475V69.674z"
            />
            <path
              className="ant-empty-img-2"
              d="M33.83 0h67.933a4 4 0 0 1 4 4v93.344a4 4 0 0 1-4 4H33.83a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4z"
            />
            <path
              className="ant-empty-img-3"
              d="M42.678 9.953h50.237a2 2 0 0 1 2 2V36.91a2 2 0 0 1-2 2H42.678a2 2 0 0 1-2-2V11.953a2 2 0 0 1 2-2zM42.94 49.767h49.713a2.262 2.262 0 1 1 0 4.524H42.94a2.262 2.262 0 0 1 0-4.524zM42.94 61.53h49.713a2.262 2.262 0 1 1 0 4.525H42.94a2.262 2.262 0 0 1 0-4.525zM121.813 105.032c-.775 3.071-3.497 5.36-6.735 5.36H20.515c-3.238 0-5.96-2.29-6.734-5.36a7.309 7.309 0 0 1-.222-1.79V69.675h26.318c2.907 0 5.25 2.448 5.25 5.42v.04c0 2.971 2.37 5.37 5.277 5.37h34.785c2.907 0 5.277-2.421 5.277-5.393V75.1c0-2.972 2.343-5.426 5.25-5.426h26.318v33.569c0 .617-.077 1.216-.221 1.789z"
            />
          </g>
          <path
            className="ant-empty-img-3"
            d="M149.121 33.292l-6.83 2.65a1 1 0 0 1-1.317-1.23l1.937-6.207c-2.589-2.944-4.109-6.534-4.109-10.408C138.802 8.102 148.92 0 161.402 0 173.881 0 184 8.102 184 18.097c0 9.995-10.118 18.097-22.599 18.097-4.528 0-8.744-1.066-12.28-2.902z"
          />
          <g className="ant-empty-img-4" transform="translate(149.65 15.383)">
            <ellipse cx="20.654" cy="3.167" rx="2.849" ry="2.815" />
            <path d="M5.698 5.63H0L2.898.704zM9.259.704h4.985V5.63H9.259z" />
          </g>
        </g>
      </svg>
      <Box sx={{ mt: 1 }}>אין נתונים</Box>
    </StyledGridOverlay>
  );
};

const TimeEditComponent = (props: GridRenderEditCellParams<Date>) => {
  const { id, value, field } = props;
  const apiRef = useGridApiContext();

  return (
    <TimePicker
      value={value}
      onChange={(newValue) => {
        apiRef.current.setEditCellValue({
          id,
          field,
          value: newValue
        });
      }}
      renderInput={(fieldParams) => <TextField {...fieldParams} />}
    />
  );
};

const ListUsers = () => {
  const [rows, setRows] = React.useState<GridRowsProp<User>>([]);
  type Row = typeof rows[number];
  const subjects = useAppSelector(selectSubjects).values;
  const grades = useAppSelector(selectGrades).values;

  const [snackbar, setSnackbar] = React.useState<Pick<
    AlertProps,
    'children' | 'severity'
  > | null>(null);
  const handleCloseSnackbar = () => setSnackbar(null);

  const processRowUpdate = React.useCallback(async (newRow: GridRowModel) => {
    // const group = await updateGroup(newRow);
    setSnackbar({ children: 'המשתמש התעדכן בהצלחה', severity: 'success' });
    return newRow;
  }, []);

  const handleProcessRowUpdateError = React.useCallback((error: Error) => {
    setSnackbar({ children: error.message, severity: 'error' });
  }, []);

  useEffect(() => {
    getAllUsers().then((users) => {
      setRows(users);
    });
  }, []);
  const deleteUser = React.useCallback(
    (id: GridRowId) => () => {
      // TODO: implement delete user
      alert(`DELETE ${id}`);
    },
    []
  );

  const columns = React.useMemo<GridColumns<Row>>(
    () => [
      {
        field: 'firstName',
        headerName: 'שם פרטי',
        editable: true,
        width: 100
      },
      {
        field: 'lastName',
        headerName: 'שם משפחה',
        editable: true,
        width: 100
      },
      {
        field: 'email',
        headerName: 'אימייל',
        editable: false,
        width: 250
      },
      {
        field: 'phoneNo',
        headerName: 'מספר טלפון',
        editable: true,
        width: 120
      },
      {
        field: 'birthDate',
        headerName: 'תאריך לידה',
        editable: true,
        width: 100,
        type: 'date',
        valueFormatter: (params) => {
          if (!params.value) {
            return '';
          }

          return new Date(params.value).toLocaleDateString('he-IL');
        }
      },
      {
        field: 'grade',
        headerName: 'כיתה',
        editable: true,
        width: 80,
        align: 'center',
        renderCell: (params) => getEnumByValue(grades, params.row.grade)?.label,
        type: 'singleSelect',
        valueOptions: () => {
          return grades;
        }
      },
      {
        field: 'group',
        headerName: 'שיעור',
        editable: false,
        width: 150,
        renderCell: (params) => {
          return (
            <Tooltip
              title={`מורה: ${params.row.group?.teacher?.firstName} ${params.row.group?.teacher?.lastName}`}
            >
              <div>{params.row.group?.name}</div>
            </Tooltip>
          );
        }
      },
      {
        field: 'subjects',
        headerName: 'מקצועות',
        editable: true,
        width: 200,
        renderCell: (params) => {
          return params.row.subjects?.map((subject) => {
            const enumValue = getEnumByValue(subjects, subject);
            if (enumValue) {
              return <Chip key={enumValue.label} label={enumValue.label} />;
            }
          });
        }
      },
      {
        field: 'role',
        headerName: 'סוג משתמש',
        editable: true,
        width: 100,
        align: 'center',
        renderCell: (params) =>
          getEnumByValue(Object.values(UserRoles), params.row.role as unknown)
            ?.label,
        type: 'singleSelect',
        valueOptions: () => {
          return Object.values(UserRoles);
        }
      },
      {
        field: 'actions',
        headerName: 'פעולות',
        type: 'actions',
        getActions: (params: GridRowParams) => [
          <GridActionsCellItem
            icon={<DeleteIcon sx={{ '&': { color: 'red' } }} />}
            label="מחיקה"
            onClick={deleteUser(params.id)}
          />
        ]
      }
    ],
    [deleteUser, subjects, grades]
  );

  return (
    <div>
      <Card
        sx={{
          '&': {
            margin: '5vh 1vw'
          }
        }}
      >
        <CardHeader title="משתמשים" />
        <Divider />
        <CardContent>
          <DataGrid
            autoHeight={true}
            rows={rows}
            columns={columns}
            components={{ NoRowsOverlay: NoDataText }}
            getRowId={(row) => row.uid}
            experimentalFeatures={{ newEditingApi: true }}
            processRowUpdate={processRowUpdate}
            onProcessRowUpdateError={handleProcessRowUpdateError}
          />
        </CardContent>
      </Card>
      {!!snackbar && (
        <Snackbar
          open
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          onClose={handleCloseSnackbar}
          autoHideDuration={3000}
        >
          <Alert {...snackbar} onClose={handleCloseSnackbar} />
        </Snackbar>
      )}
    </div>
  );
};

export default ListUsers;
