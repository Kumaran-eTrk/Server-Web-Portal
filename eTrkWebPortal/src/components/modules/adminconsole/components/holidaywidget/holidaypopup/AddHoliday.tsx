import React, { useEffect } from 'react';
import { useRangeContext } from '../../../../../contexts/range-context';
import {  makeStyles, shorthands } from '@fluentui/react-components';
import { DatePicker } from '@fluentui/react-datepicker-compat';
import { formatCustomStartDate, onFormatDate } from '../../../../../lib/Date-Utils';
import api from '../../../../../interceptors';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "../../../../../../index.css";


type Item = {
    holiday:string;
    date:Date;
    location:string;
    branch:string;
    deleteButton?:string;
    modifiedBy
: 
"";
modifiedTime
: 
null
  };

  export type Holiday = {
    holiday: string;
    date: Date;
    location: string;
    branch: string;
    deleteButton?: string;
};
  
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
      inputroot: {
          maxWidth: "200px",
      },
      container: {
          display: "flex",
          flexDirection: "row",
          columnGap: "5px",
        },
        control: {
          maxWidth: "330px",
        },
  
    });
function AddHoliday() {
  // Define handleClose function if it's needed
  const {setHolidayPopup}: any = useRangeContext();
  const [holidays, setHolidays] = React.useState<Holiday[]>([]);
  const [holidayInput, setHolidayInput] = React.useState<string>("");
  const [locationInput, setLocationInput] = React.useState<string>("");
  const [branchInput, setBranchInput] = React.useState<string>("");

  
  const handleClosePopup = () => {
    setHolidayPopup(false);
  };


 
  const today = new Date();
  const styles = useStyles();

  const [value, setValue] = React.useState<Date | null>(today);

  const onSelectDate = (
    date: Date | any,
    setValueFn: React.Dispatch<React.SetStateAction<Date | any>>
  ) => {
    const formattedStartDate = formatCustomStartDate(date);
   console.log("date format",date)
    setValueFn(date);
  };
  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const response = await api.get("/adminscreen/holiday");
        setHolidays(response.data);
      } catch (error) {
        toast.error('Error fetching holidays');
      } 
    };

    fetchHolidays();
  }, []); 
  const handleSaveChange = async () => {
    try {
      if (!holidayInput || !value || !locationInput || !branchInput) {
        toast.error('Please fill all the fields', { autoClose: 2000, position:"top-center" });
        return;
      }
  
      const newHoliday: Item = {
        holiday: holidayInput,
        date: value,
        location: locationInput,
        branch: branchInput,
        modifiedBy: '',
        modifiedTime: null
      };
  
      // Make POST request to add holiday
      const response = await api.post(`/adminscreen/holiday`, newHoliday);
     
      
  
      // Check for successful creation (status 200 or 201)
      if (response.status === 200 || response.status === 201) {
        // Clear input values after adding a holiday
        const responses = await api.get("/adminscreen/holiday");
        setHolidays(responses.data);
        toast.success('Holiday added successfully', { autoClose: 2000 }); 
        setHolidayInput('');
        setValue(today);
        setLocationInput('');
        setBranchInput('');
        setHolidayPopup(false);
     
      }
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(`Failed to add holiday: ${error.response.data.error}`, {
          autoClose: 2000,
        });

    }
  }
  };
  
  
  
  
  
  
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    
    if (/^[a-zA-Z]*$/.test(value)) {
      setHolidayInput(value);
    }
  };

  const handleLocationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    
    if (/^[a-zA-Z]*$/.test(value)) {
      setLocationInput(value);
    }
  };

  const handleBranchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    
    if (/^[a-zA-Z]*$/.test(value)) {
      setBranchInput(value);
    }
  };

 
  return (
    <>
    <div className="fixed inset-0 bg-black opacity-50 z-10"></div>
  
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
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">Add Holiday</h3>
              <div className="mt-2 grid grid-cols-2 gap-4">
                <div className="mb-4 flex flex-col">
                  <label htmlFor="holiday" className="block text-sm font-semibold text-gray-700">
                    Holiday
                  </label>
                  <input
                    type="text"
                    name="holiday"
                    id="holiday"
                    placeholder='Enter your holiday'
                    value={holidayInput}
                    onChange={handleInputChange}
                    className="mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="date" className="block text-sm font-semibold text-gray-700">
                    Date
                  </label>
                  <DatePicker
                    value={value || today}
                    onSelectDate={(date) => onSelectDate(date, setValue)}
                    placeholder="start date"
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
                    placeholder='Enter your location'
                    value={locationInput}
                    onChange={handleLocationChange}
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
                    value={branchInput}
                     placeholder='Enter your branch'
                    onChange={handleBranchChange}
                    className="mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button onClick={handleSaveChange} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm">
            Save
          </button>
          <button onClick={handleClosePopup} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
  </>
  
  
  );
}

export default React.memo(AddHoliday);
