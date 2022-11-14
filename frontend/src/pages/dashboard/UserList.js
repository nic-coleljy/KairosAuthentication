import { sentenceCase } from 'change-case';
import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
// @mui
import { useTheme } from '@mui/material/styles';
import {
  Card,
  Table,
  Button,
  Checkbox,
  TableRow,
  TableBody,
  TableCell,
  Container,
  TableContainer,
  TablePagination,
} from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// hooks
import useSettings from '../../hooks/useSettings';
// components
import Page from '../../components/Page';
import Label from '../../components/Label';
import Iconify from '../../components/Iconify';
import Scrollbar from '../../components/Scrollbar';
import SearchNotFound from '../../components/SearchNotFound';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
// sections
import { UserListHead, UserListToolbar, UserMoreMenu } from '../../sections/@dashboard/user/list';
import LoadingScreen from '../../components/LoadingScreen';
import useAuth from '../../hooks/useAuth';
import axios from '../../utils/axios';

/* eslint-disable camelcase */

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'email', label: 'Email', alignRight: false },
  { id: 'first_name', label: 'First Name', alignRight: false },
  { id: 'last_name', label: 'Last Name', alignRight: false },
  { id: 'birthdate', label: 'Birth Date', alignRight: false },
  { id: 'status', label: 'Status', alignRight: false },
  { id: '' },
];

// ----------------------------------------------------------------------

export default function UserList() {
  const theme = useTheme();
  const {user} = useAuth();
  const { themeStretch } = useSettings();
  const [isLoading, setLoading] = useState(true);
  const [userList2, setUserList2] = useState([]);
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('name');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    const initialize = async () => {
      try {
        await axios.get('/auth/admin/user-crud/').then((res) => {
          setLoading(false);
          setUserList2(Object.values(res.data));
        });
      } catch (err) {
        console.log(err);
      }
    };
    initialize();


  }, []);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (checked) => {
    if (checked) {
      const newSelecteds = userList2.map((n) => n.email);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };



  const handleClick = (name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    }
    setSelected(newSelected);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterByName = (filterName) => {
    setFilterName(filterName);
    setPage(0);
  };

  const handleDeleteUser = async (userId) => {
    const deleteUser = userList2.filter((user) => user.id !== userId);
    await axios.delete(`/auth/admin/user-crud/?user_id=${userId}`).catch((err) => {console.log(err)});
    setSelected([]);
    setUserList2(deleteUser);
  };

  const handleDeleteMultiUser = async (selected) => {
    const deleteUsers = userList2.filter((user) => !selected.includes(user.email));
    setLoading(true);
    selected.map(userId => (deleteUser(userId)));
    setSelected([]);
    setUserList2(deleteUsers);
    setLoading(false);
    window.location.reload(false);

  };


  const deleteUser = async(userId) => {
    await axios.delete(`/auth/admin/user-crud/?user_id=${userId}`).catch((err) => {console.log(err)})
  }

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - userList2.length) : 0;

  const filteredUsers = applySortFilter(userList2, getComparator(order, orderBy), filterName);

  const isNotFound = !filteredUsers.length && Boolean(filterName);
  
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Page title="User: List">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading="User List"
          links={[
            { name: 'Dashboard', href: PATH_DASHBOARD.root },
            { name: 'List' },
          ]}
          action={
            user?.is_superuser &&
            <Button
              variant="contained"
              component={RouterLink}
              to={PATH_DASHBOARD.user.newUser}
              startIcon={<Iconify icon={'eva:plus-fill'} />}
            >
              New User
            </Button>
          }
        />

        <Card>
          <UserListToolbar
            numSelected={selected.length}
            filterName={filterName}
            onFilterName={handleFilterByName}
            onDeleteUsers={() => handleDeleteMultiUser(selected)}
          />

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <UserListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={userList2.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const { id, first_name, last_name, status, email, birthdate } = row;
                    const isItemSelected = selected.indexOf(id) !== -1;

                    return (
                      <TableRow
                        hover
                        key={id}
                        tabIndex={-1}
                        role="checkbox"
                        selected={isItemSelected}
                        aria-checked={isItemSelected}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox checked={isItemSelected} onClick={() => handleClick(id)} />
                        </TableCell>
                        
                        <TableCell align="left">{email}</TableCell>
                        <TableCell align="left">{first_name}</TableCell>
                        <TableCell align="left">{last_name}</TableCell>
                        <TableCell align="left">{birthdate}</TableCell>
                        <TableCell align="left">
                          <Label
                            variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                            color={(status === 'pending' && 'error') || 'success'}
                          >
                            {sentenceCase(status)}
                          </Label>
                        </TableCell>
                        {user?.is_superuser && 
                        <TableCell align="right">
                          <UserMoreMenu onDelete={() => handleDeleteUser(id)} id={id} />
                        </TableCell>}
                      </TableRow>
                    );
                  })}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>
                {isNotFound && (
                  <TableBody>
                    <TableRow>
                      <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                        <SearchNotFound searchQuery={filterName} />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}
              </Table>
            </TableContainer>
          </Scrollbar>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={userList2.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, page) => setPage(page)}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Container>
    </Page>
  );
}

// ----------------------------------------------------------------------

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function applySortFilter(array, comparator, query) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    return array.filter((_user) => _user.email.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}
