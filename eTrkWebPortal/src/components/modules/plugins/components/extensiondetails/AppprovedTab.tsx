import {
  Button, createTableColumn, DataGrid, DataGridBody, DataGridCell, DataGridHeader, DataGridHeaderCell, DataGridRow, Input, InputOnChangeData, makeStyles,
  Popover,
  PopoverSurface,
  PopoverTrigger, shorthands, TableCellLayout, TableColumnDefinition, Text
} from "@fluentui/react-components";
import { LockClosedKeyRegular, Search16Regular } from "@fluentui/react-icons";
import React, { memo, useEffect, useState } from 'react';
import api from '../../../../interceptors';
import { CancelIcon } from '../../../../shared/icons';
import { UpdateRejectPopup } from './confirmationpopup/UpdateRejectPopup';
import { EditHistoryTab } from './VersionHistoryTab';



export type Item = {
  id:string,
  name: string;
  browser:string;
  permissions: string;
  history:JSX.Element;
  buttonfield:JSX.Element;
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
  });
  
  const ApprovePermissions = ({permissions}:{permissions:any}) => {
    const styles = useStyles();
    return (
      <div>
        <h3 className={styles.contentHeader}>Permissions</h3>
        <ul>{permissions}</ul>
      </div>
    );
  };


const ApprovedTab = () => {
  const [updateApprove, setUpdateApprove] =useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const styles = useStyles();
  const inputRef = React.useRef<HTMLInputElement | null>(null);

   
    useEffect(() => {
      const fetchBrowserExtensionData = async () => {
        try {
          const response = await api.get(`extensions/acceptedstatus`);
          const data = response.data;
          const sortedData = data.sort((a:any, b:any) => {
            const userNameA = a.name.toLowerCase();
            const userNameB = b.name.toLowerCase();
            return userNameA.localeCompare(userNameB);
          });
          console.log("approveDATA",sortedData)
          setUpdateApprove(sortedData);
        } catch (error) {
          console.error("Error fetching Extension data:", error);
        }
      };
  
      fetchBrowserExtensionData();
    }, []);

    const handleSearchBoxChange = (event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
      const newValue = data?.value || '';
      setSearchQuery(newValue.toLowerCase());
    };
    
    
  
    const filteredExtension = updateApprove.filter((item: Item) =>
    Object.values(item).some((value: any) =>
    value && typeof value === 'string' && value.toLowerCase().includes(searchQuery))
    );

    const handleClear = () => {
      setSearchQuery('');
      if (inputRef.current) {
        inputRef.current.focus();
      }}


    const columns: TableColumnDefinition<Item>[] = [
      createTableColumn<Item>({
        columnId: "ExtensionName",
        renderHeaderCell: () => "ExtensionName",
        renderCell: (item) =>{ 
          const status = item.name
        return <TableCellLayout style={{color:'#ef4444'}}>{status}</TableCellLayout>} 
      }),
      createTableColumn<Item>({
        columnId: "Permissions",
        renderHeaderCell: () => "Permissions",
        renderCell: (item) => {
          if (item.permissions !== null) {
            const permissionsArray = item.permissions.split(',');
            const formattedPermissions = permissionsArray.map(permission => (
              <li key={permission}>{permission.trim()}</li>
            ));
      
            return  <Popover >
            <PopoverTrigger disableButtonEnhancement>
              <Button icon={<LockClosedKeyRegular/>}>Permissions</Button>
            </PopoverTrigger>
        
            <PopoverSurface tabIndex={-1}>
              <ApprovePermissions permissions={formattedPermissions}/>
            </PopoverSurface>
          </Popover>
          }
          return null; 
        },
      }),

      
      createTableColumn<Item>({
        columnId: "Edit History",
        renderHeaderCell: () => "Edit History",
        renderCell: (item) =>{ 
        return <TableCellLayout >
          <EditHistoryTab extensionId={item.id}/>
        </TableCellLayout>} 
      }), 
      createTableColumn<Item>({
        columnId: "Edit",
        renderHeaderCell: () => "Edit",
        renderCell: (item) =>{ 
        return <TableCellLayout >
          <UpdateRejectPopup setUpdateApprove={setUpdateApprove} extensionId={item.id}/>
        </TableCellLayout>} 
      }),      
    ];
  
    return (
      <div role="tabpanel" aria-labelledby="Approved">
        <div  style={{display:'flex', justifyContent:'flex-end', marginBottom:'10px'}} >
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
        <div className='widget-body'>
          <div className="">
            <DataGrid
              items={filteredExtension}
              columns={columns}
            >
              <div className=''>
              <DataGridHeader>
                <DataGridRow>
                  {({ renderHeaderCell }: any) => (
                    <DataGridHeaderCell style={{ backgroundColor: '#26C0BB', color: 'white' }}>{renderHeaderCell()}</DataGridHeaderCell>
                  )}
                </DataGridRow>
              </DataGridHeader>
              </div>
              <div className='table-container' style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <DataGridBody<Item> >
                  {({ item, rowId }: any) => (
                    <DataGridRow<Item> key={rowId}>
                      {({ renderCell }: any) => (
                        <DataGridCell >{renderCell(item)}</DataGridCell>
                      )}
                    </DataGridRow>
                  )}
                </DataGridBody>
                  {
                    updateApprove.length<=0 && (
                      <div style={{textAlign:'center', marginTop:'20px'}}>
                      <Text align="center" size={300} weight='medium' style={{color:'#9ca3af'}}>No data found</Text>
                      </div>
                    )
                  }
              </div>
            </DataGrid>
          </div>
        </div>
      </div>
    );
};

export default memo(ApprovedTab);
