import React, { useState, useEffect } from 'react';
import { DataGrid, DataGridBody, DataGridCell, DataGridHeader, DataGridHeaderCell, DataGridRow, Input, InputOnChangeData, Spinner, TableCellLayout, TableColumnDefinition, createTableColumn, makeStyles, shorthands } from '@fluentui/react-components';
import { formatCustomStartDate, onFormatDate } from '../../../../../lib/Date-Utils';
import { DatePicker } from '@fluentui/react-datepicker-compat';
import api from '../../../../../interceptors';
import { CancelIcon } from "../../../../../shared/icons";
import { Search16Regular } from "@fluentui/react-icons";
import { useRangeContext } from '../../../../../contexts/range-context';
import { toast } from 'react-toastify';


interface Item {
  id: number;
  holiday: string;
  date: string;
  location: string;
  branch: string;
}

const useStyles = makeStyles({
    contentHeader: {
      marginTop: "0",
    },
    root: {
      display: 'flex',
      flexDirection: 'column',
      ...shorthands.gap('20px'),
      maxWidth: '400px',
      '> div': {
        display: 'flex',
        flexDirection: 'column',
        ...shorthands.gap('2px'),
      },
    },
    control: {
      maxWidth: "340px",
      height:"20px",
      marginTop:"5px"
    },
  });
const HolidayEditTable = () => {
  const [holidays, setHolidays] = useState<Item[]>([]);
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [selectedHoliday, setSelectedHoliday] = useState<Item | null>(null);
  const [loading, setLoading] = useState(false);
  const today = new Date();
  const [value, setValue] = useState<Date | null>(today);
  const {setHolidayPopup}: any = useRangeContext();
  const handleOpenPopup = () => {
    setHolidayPopup(true); // Function to set showPopup state to true
  };
  useEffect(() => {
    const fetchHolidays = async () => {
      setLoading(true);
      try {
        const response = await api.get("/adminscreen/holiday");
        setHolidays(response.data);
      } catch (error) {
        console.error('Error fetching holidays:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHolidays();
  }, []);

  const openEditModal = (holiday: Item) => {
    setSelectedHoliday(holiday);
    setEditModalOpen(true);
    setDatePickerValue(new Date(holiday.date));
  };

  const closeEditModal = () => {
    setSelectedHoliday(null);
    setEditModalOpen(false);
  };
  
  const styles = useStyles();
  const [datePickerValue, setDatePickerValue] = useState<Date | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const onSelectDate = (
    date: Date | null | undefined, // Adjust type to accept undefined
    setValueFn: React.Dispatch<React.SetStateAction<Date | null>>
  ) => {
    // Check if a valid date is selected and not undefined
    if (date !== undefined && date !== null) {
      // Update the state with the selected date
      setValueFn(date);
      // Update the selected holiday's date as well if applicable
      if (selectedHoliday) {
        setSelectedHoliday({
          ...selectedHoliday,
          date: date.toISOString(), // Convert the selected date to ISO string format
        });
      }
    }
  };

  const editApplicationSearch = holidays.filter((item: Item) =>
  Object.values(item).some((value: any) =>
  value && typeof value === 'string' && value.toLowerCase().includes(searchQuery)
  )
);

const handleClear = () => {
  setSearchQuery('');
  if (inputRef.current) {
    inputRef.current.focus();
  }}


  const updateHoliday = async (updatedHoliday: Item) => {
    try {
      await api.put(`/adminscreen/holiday/${updatedHoliday.id}`, updatedHoliday);
      const response = await api.get("/adminscreen/holiday");
      setHolidays(response.data);
      toast.success('Holiday updated successfully', { autoClose: 2000 }); 
    } catch (error:any) {
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(`Failed to update holiday: ${error.response.data.error}`, {
          autoClose: 2000,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (selectedHoliday) {
      updateHoliday(selectedHoliday);
      closeEditModal();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    
    if (selectedHoliday) {
      setSelectedHoliday({
        ...selectedHoliday,
        [e.target.name]: e.target.value
      });
    }
  };
  const handleSearchBoxChange = (_event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
    const newValue = data?.value || '';
    setSearchQuery(newValue.toLowerCase());
  };
  

  const columns: TableColumnDefinition<Item>[] = [
    createTableColumn<Item>({
      columnId: "Holiday name",
      renderHeaderCell: () => {
        return "Holiday name";
      },
      renderCell: (item:any) => {
        return (
          <TableCellLayout >
            {item.holiday}
          </TableCellLayout>
        );
      },
    }),
    createTableColumn<Item>({
        columnId: "Date",
        renderHeaderCell: () => {
          return "Date";
        },
        renderCell: (item: any) => {
          // Assuming item.date is a Date object
          const formattedDate = formatCustomStartDate(item.date);
          const date = (formattedDate).split('T')[0];
          return <TableCellLayout>{date}</TableCellLayout>;
        },
      }),
    createTableColumn<Item>({
      columnId: "Location",
      renderHeaderCell: () => {
        return "Location";
      },
      renderCell: (item:any) => {
        return (
          <TableCellLayout >
            {item.location}
          </TableCellLayout>
        );
      },
    }),
    createTableColumn<Item>({
      columnId: "Branch",
      renderHeaderCell: () => {
        return "Branch";
      },
      renderCell: (item:any) => {
        return (
          <TableCellLayout >
            {item.branch}
          </TableCellLayout>
        );
      },
    }),
    createTableColumn<Item>({
        columnId: "",
        renderHeaderCell: () => {
          return "";
        },
        renderCell: (holiday:any) => {
          return (
            <TableCellLayout >
             <button onClick={() => openEditModal(holiday)} className="text-indigo-600 hover:text-indigo-900">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
</svg>

                </button>
            </TableCellLayout>
          );
        },
      }),
  ];

  return (
    <div className="flex flex-wrap space-x-0 space-y-2 md:space-y-0">
      <div className="flex-1 rounded-lg w-full max-h-80  overflow-y-auto">
      
        {/* <table className="w-full table-auto  text-sm text-center ">
          <thead className="sticky top-0.5 z-5 bg-[#26C0BB] text-white">

            <tr className="bg-[#26C0BB] w-full ">
              <th className="text-white text-sm px-6 py-2">Holiday</th>
              <th className="text-white text-sm px-6 py-2">Date</th>
              <th className="text-white text-sm px-6 py-2">Location</th>
              <th className="text-white text-sm px-6 py-2">Branch</th>
              <th className="text-white text-sm px-6 py-2 w-28"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="text-center py-9 " colSpan={3} style={{ width: '100%' }}>
                  <div style={{ display: 'inline-block' }}>
                    <Spinner label="fetching data..." />
                  </div>
                </td>
              </tr>
            ) :(
              holidays.map((holiday): any => (
                <tr key={holiday.id}>
                  <td className="border-b-2 py-2">{holiday.holiday}</td>
                  <td className="border-b-2 py-2">{holiday.date}</td>
                  <td className="border-b-2 py-2">{holiday.location}</td>
                  <td className="border-b-2 py-2 ">{holiday.branch}</td>
                  <td className="border-b-2 py-2">
                    <button onClick={() => openEditModal(holiday)} className="text-indigo-600 hover:text-indigo-900">
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table> */}
          <div className='flex items-center justify-between my-2' >

          <div className="text-violet-900">
            <button
              className="px-2 py-1 border border-violet-200 rounded-sm"
              onClick={handleOpenPopup} // Attach onClick event to open the popup
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
</svg>

            </button>
          </div>
      <div className={styles.root}>

      <div ref={inputRef}>
        <Input
          onChange={handleSearchBoxChange}
          size='large'
          value={searchQuery}
          contentBefore={<Search16Regular />}
          contentAfter={
            searchQuery ? (
            <div onClick={handleClear} style={{ cursor: 'pointer' }}>
              <CancelIcon   />
            </div>
            ) : null
          }
          id="searchInput" 
        />
      </div>
    </div>
    </div>
        <DataGrid
          items={editApplicationSearch}
          columns={columns}
        >
          <DataGridHeader>
            <DataGridRow style={{ backgroundColor: '#26C0BB'}}>
              {({ renderHeaderCell }: any) => (
                <DataGridHeaderCell style={{ backgroundColor: '#26C0BB', color: 'white' }}>{renderHeaderCell()}</DataGridHeaderCell>
              )}
            </DataGridRow>
          </DataGridHeader>
          
          <div className="table-container">
          {loading ?(
                <Spinner style={{ margin: 50 }} label="fetching data..."/>
                ):(
            <DataGridBody<Item>>
              {({ item, rowId }) => (
                <DataGridRow<Item>
                  key={rowId}>
                  {({ renderCell }) => (
                    <DataGridCell>{renderCell(item)}</DataGridCell>
                  )}
                </DataGridRow>
              )}
            </DataGridBody>)}
          </div>
        </DataGrid>
        {editModalOpen && selectedHoliday && (
  <div className="fixed z-10 inset-0 overflow-y-auto">
    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div className="fixed inset-0 transition-opacity" aria-hidden="true">
        <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
      </div>
      <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
        &#8203;
      </span>
      <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-x-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">Edit Holiday</h3>
              <div className="mt-2 grid grid-cols-2 gap-4">
                <div className="mb-4 flex flex-col">
                  <label htmlFor="holiday" className="block text-sm font-semibold text-gray-700">
                    Holiday
                  </label>
                  <input
                    type="text"
                    name="holiday"
                    id="holiday"
                    value={selectedHoliday.holiday}
                    onChange={handleInputChange}
                    className="mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="date" className="block text-sm font-semibold text-gray-700">
                    Date
                  </label>
                  <DatePicker
                    value={datePickerValue}
                    onSelectDate={(date) => onSelectDate(date, setValue)}
                    placeholder=""
                    formatDate={onFormatDate}       
                    className={styles.control}
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="date" className="block text-sm font-semibold text-gray-700">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    id="location"
                    value={selectedHoliday.location}
                    onChange={handleInputChange}
                    className="mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="date" className="block text-sm font-semibold text-gray-700">
                    Branch
                  </label>
                  <input
                    type="text"
                    name="branch"
                    id="branch"
                    value={selectedHoliday.branch}
                    onChange={handleInputChange}
                    className="mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button onClick={handleSave} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm">
            Save
          </button>
          <button onClick={closeEditModal} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
)}

      </div>
    </div>
  );
};

export default HolidayEditTable;
