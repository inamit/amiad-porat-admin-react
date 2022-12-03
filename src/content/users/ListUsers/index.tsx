import {
  DataGrid,
  GridRowsProp,
  GridColumns,
  GridActionsCellItem,
  GridRowParams,
  GridRowId,
  GridRowModel,
  GridFilterOperator,
  GridFilterItem,
  GridRowModes,
  GridRowModesModel,
  MuiEvent,
  GridEventListener,
  useGridApiContext
} from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import React, { useEffect } from 'react';
import { UserRoles } from 'models/enums/userRoles';
import User from 'models/user';
import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import { store, useAppDispatch, useAppSelector } from 'store/store';
import { selectGrades, selectSubjects } from 'store/config/config.slice';
import { getEnumByValue } from 'models/enums/enumUtils';
import Alert, { AlertProps } from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import {
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Tooltip
} from '@mui/material';
import {
  selectUsers,
  selectUsersLoadStatus,
  updateUser
} from 'store/users/users.slice';
import {
  selectGroups,
  selectGroupsWithTeachers
} from 'store/groups/groups.slice';
import { LoadStatus } from 'store/loadStatus';

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

const SubjectsMultiSelectComponent = (props) => {
  const { item, applyValue } = props;
  const subjects = useAppSelector(selectSubjects);

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250
      }
    }
  };

  return (
    <div>
      <FormControl variant="standard" sx={{ width: 180 }}>
        <InputLabel shrink={true} id="subjects-select-label">
          מקצוע
        </InputLabel>
        <Select
          variant="standard"
          labelId="subjects-select-label"
          id="subjects-select"
          multiple
          value={item.value ?? []}
          onChange={({ target }) => {
            applyValue({ ...item, value: target.value });
          }}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => (
                <Chip
                  sx={{ height: '90%' }}
                  key={value}
                  label={getEnumByValue(subjects, value).label}
                />
              ))}
            </Box>
          )}
          MenuProps={MenuProps}
        >
          {subjects.map((subject) => (
            <MenuItem key={subject.value} value={subject.value}>
              {subject.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};

const MultiSelectComponnent = (props) => {
  const { id, value, field, options } = props;
  const apiRef = useGridApiContext();

  const handleChange = (event) => {
    const eventValue = event.target.value; // The new value entered by the user
    console.log({ eventValue });
    const newValue =
      typeof eventValue === 'string' ? value.split(',') : eventValue;
    apiRef.current.setEditCellValue({
      id,
      field,
      value: newValue.filter((x) => x !== '')
    });
  };

  return (
    <Select
      labelId="demo-multiple-name-label"
      id="demo-multiple-name"
      multiple
      value={(typeof value === 'string' ? value.split(',') : value) ?? []}
      onChange={handleChange}
      sx={{ width: '100%' }}
    >
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </Select>
  );
};

const CustomFilterInputMultipleSelect = (props) => {
  const {
    item,
    applyValue,
    type,
    apiRef,
    focusElementRef,
    options,
    ...others
  } = props;

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250
      }
    }
  };

  return (
    <div>
      <FormControl variant="standard" sx={{ width: 130 }}>
        <InputLabel shrink={true} id="demo-multiple-chip-label">
          ערך
        </InputLabel>
        <Select
          labelId="demo-multiple-chip-label"
          id="demo-multiple-chip"
          multiple
          value={
            (typeof item.value === 'string'
              ? item.value.split(',')
              : item.value) ?? []
          }
          onChange={(event) =>
            applyValue({ ...item, value: event.target.value })
          }
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => {
                const selectedOptions = options.find(
                  (option) => option.value === value
                );
                return (
                  <Chip
                    key={selectedOptions.value}
                    label={selectedOptions.label}
                  />
                );
              })}
            </Box>
          )}
          MenuProps={MenuProps}
        >
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};

const CustomGroupsFilterInput = (params) => {
  const groups = selectGroups(store.getState());

  return (
    <CustomFilterInputMultipleSelect
      {...params}
      options={groups.map((group) => ({ value: group.id, label: group.name }))}
    />
  );
};

const CustomGroupsEditCell = (params) => {
  const groups = selectGroups(store.getState());

  return (
    <MultiSelectComponnent
      {...params}
      options={
        (params.row?.role as unknown as number) === UserRoles.STUDENT.value
          ? groups.map((group) => ({ value: group.id, label: group.name }))
          : []
      }
    />
  );
};
const ListUsers = () => {
  const dispatch = useAppDispatch();
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>(
    {}
  );
  const [rows, setRows] = React.useState<User[]>([]);

  const subjects = useAppSelector(selectSubjects);
  const grades = useAppSelector(selectGrades);
  const users = useAppSelector(selectUsers);
  const loadStatus = useAppSelector(selectUsersLoadStatus);
  const groups = useAppSelector(selectGroupsWithTeachers);

  useEffect(() => {
    setRows(users);
  }, [users]);
  const [snackbar, setSnackbar] = React.useState<Pick<
    AlertProps,
    'children' | 'severity'
  > | null>(null);
  const handleCloseSnackbar = () => setSnackbar(null);

  const processRowUpdate = React.useCallback(
    async (newRow: GridRowModel, oldRow: GridRowModel) => {
      dispatch(updateUser({ id: newRow.uid, changes: newRow }));
      return oldRow;
    },
    []
  );

  const handleProcessRowUpdateError = React.useCallback((error: Error) => {
    setSnackbar({ children: error.message, severity: 'error' });
  }, []);

  const handleRowEditStart = (
    params: GridRowParams,
    event: MuiEvent<React.SyntheticEvent>
  ) => {
    event.defaultMuiPrevented = true;
  };

  const handleRowEditStop: GridEventListener<'rowEditStop'> = (
    params,
    event
  ) => {
    event.defaultMuiPrevented = true;
  };

  const handleEditClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleCancelClick = (id: GridRowId) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true }
    });
  };

  const deleteUser = React.useCallback(
    (id: GridRowId) => () => {
      // TODO: implement delete user
      alert(`הפונקציה הזאת תתאפשר בקרוב!`);
    },
    []
  );

  const disableUser = React.useCallback(
    (id: GridRowId) => () => {
      //TODO: implement disable user
      alert('הפונקציה הזאת תתאפשר בקרוב!');
    },
    []
  );
  const enableUser = React.useCallback(
    (id: GridRowId) => () => {
      //TODO: implement enable user
      alert('הפונקציה הזאת תתאפשר בקרוב!');
    },
    []
  );

  const subjectsFilter: GridFilterOperator[] = [
    {
      label: 'מכיל אחד מ',
      value: 'containsAny',
      getApplyFilterFn: (filterItem: GridFilterItem) => {
        if (
          !filterItem.columnField ||
          !filterItem.value ||
          !filterItem.operatorValue ||
          filterItem.value.length === 0
        ) {
          return null;
        }

        return (params): boolean => {
          return filterItem.value.some((item) => params.value?.includes(item));
        };
      },
      InputComponent: CustomGroupsFilterInput
    },
    {
      label: 'מכיל את כל',
      value: 'containsAll',
      getApplyFilterFn: (filterItem: GridFilterItem) => {
        if (
          !filterItem.columnField ||
          !filterItem.value ||
          !filterItem.operatorValue ||
          filterItem.value.length === 0
        ) {
          return null;
        }

        return (params): boolean => {
          return filterItem.value.every((item) => params.value?.includes(item));
        };
      },
      InputComponent: CustomGroupsFilterInput
    }
  ];

  const columns = React.useMemo<GridColumns<GridRowsProp<User>[number]>>(
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
        editable: false,
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
        valueOptions: (params) => {
          return params.row?.role
            ? params.row?.role === UserRoles.STUDENT.value
              ? grades
              : []
            : grades;
        }
      },
      {
        field: 'group',
        headerName: 'שיעור',
        editable: true,
        width: 250,
        renderEditCell: CustomGroupsEditCell,
        renderCell: (params) => {
          return params.row.group?.map((group) => {
            const groupInfo = groups.find(
              (groupOption) => groupOption.id === group
            );
            return (
              <Tooltip
                key={group}
                title={`מורה: ${groupInfo?.teacher?.firstName} ${groupInfo?.teacher?.lastName}`}
              >
                <Chip key={group} label={groupInfo?.name} />
              </Tooltip>
            );
          });
        },
        type: 'singleSelect',
        filterOperators: subjectsFilter
      },
      {
        field: 'role',
        headerName: 'סוג משתמש',
        editable: true,
        width: 100,
        align: 'center',
        renderCell: (params) =>
          getEnumByValue(Object.values(UserRoles), params.row.role)?.label,
        type: 'singleSelect',
        valueOptions: () => {
          return Object.values(UserRoles);
        }
      },
      {
        field: 'disabled',
        headerName: 'מוקפא?',
        type: 'boolean'
      },
      {
        field: 'actions',
        headerName: 'פעולות',
        type: 'actions',
        getActions: ({ id }) => {
          const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

          if (isInEditMode) {
            return [
              <GridActionsCellItem
                icon={<SaveIcon />}
                label="Save"
                onClick={handleSaveClick(id)}
              />,
              <GridActionsCellItem
                icon={<CancelIcon />}
                label="Cancel"
                className="textPrimary"
                onClick={handleCancelClick(id)}
                color="inherit"
              />
            ];
          }

          return [
            <GridActionsCellItem
              icon={<EditIcon />}
              label="עריכה"
              title="עריכה"
              className="textPrimary"
              onClick={handleEditClick(id)}
              color="inherit"
            />,
            users.find((user) => user.uid === id).disabled ? (
              <GridActionsCellItem
                label="ביטול הקפאה"
                icon={<LockOpenIcon />}
                onClick={enableUser(id)}
                showInMenu
              />
            ) : (
              <GridActionsCellItem
                label="הקפאה"
                icon={<LockIcon />}
                onClick={disableUser(id)}
                showInMenu
              />
            ),
            <GridActionsCellItem
              icon={<DeleteIcon />}
              label="מחיקה"
              onClick={deleteUser(id)}
              color="inherit"
              showInMenu
            />
          ];
        }
      }
    ],
    [
      deleteUser,
      handleEditClick,
      handleSaveClick,
      handleCancelClick,
      subjects,
      grades,
      groups
    ]
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
            sx={{
              '.MuiDataGrid-row--editing .MuiDataGrid-cell': {
                backgroundColor: 'transparent !important'
              },
              '.MuiDataGrid-row--editing': {
                backgroundColor: 'lightskyblue !important'
              }
            }}
            autoHeight={true}
            rows={rows}
            initialState={{
              columns: { columnVisibilityModel: { disabled: false } },
              sorting: { sortModel: [{ field: 'disabled', sort: 'asc' }] },
              filter: {
                filterModel: {
                  items: [
                    {
                      columnField: 'role',
                      operatorValue: 'is',
                      value: UserRoles.STUDENT.value
                    }
                  ]
                }
              }
            }}
            columns={columns}
            components={{ NoRowsOverlay: NoDataText }}
            getRowId={(row) => row.uid}
            editMode="row"
            experimentalFeatures={{ newEditingApi: true }}
            processRowUpdate={processRowUpdate}
            onProcessRowUpdateError={handleProcessRowUpdateError}
            rowModesModel={rowModesModel}
            onRowEditStart={handleRowEditStart}
            onRowEditStop={handleRowEditStop}
            loading={loadStatus === LoadStatus.LOADING}
            onCellDoubleClick={(params) => {
              // TODO: Open user info
            }}
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
