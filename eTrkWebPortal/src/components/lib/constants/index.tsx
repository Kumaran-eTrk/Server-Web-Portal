
import { HomeIcon, ChartSquareIcon,  ContactIcon,  DesktopIcon, TeamIcon, DivisionIcon  } from "../../shared/icons";

export const AdminSidebar = [
    {
        id:'1',
        routeLink: './#/dashboard',
        icon: <HomeIcon/>,
        label: 'Home' ,
    },

    {
        id:'2',
        routeLink: './#/Teaminfo',
        icon: <ChartSquareIcon/>,
        label: 'TeamInfo',
    },

    {
        id:'3',
        routeLink: './#/adminconsole',
        icon: <ContactIcon/>,
        label: 'AdminConsole' ,
    },
    {
        id:'4',
        routeLink: './#/systemconsole',
        icon: <DesktopIcon/>,
        label: 'SystemConsole' ,
    },
    {
        id:'5',
        routeLink: './#/plugininfo',
        icon: <TeamIcon/>,
        label: 'PluginInfo' ,
    },

    {
        id:'6',
        routeLink: './#/usercomplaince',
        icon: <DivisionIcon/>,
        label: 'UserComplaince' ,
    },

]

export const SysTeamSidebar = [
    {
        id:'1',
        routeLink: './#/dashboard',
        icon: <HomeIcon/>,
        label: 'Home' ,
    },
    {
        id:'2',
        routeLink: './#/systemconsole',
        icon: <DesktopIcon/>,
        label: 'SystemConsole' ,
    },
    {
        id:'3',
        routeLink: './#/plugininfo',
        icon: <TeamIcon/>,
        label: 'PluginInfo' ,
    },

    {
        id:'4',
        routeLink: './#/usercomplaince',
        icon: <DivisionIcon/>,
        label: 'UserComplaince' ,
    },

    
]

export const ManagerSidebar = [
    {
        id:'1',
        routeLink: './#/dashboard',
        icon: <HomeIcon/>,
        label: 'Home' ,
    },

    {
        id:'2',
        routeLink: './#/Teaminfo',
        icon: <ChartSquareIcon/>,
        label: 'TeamInfo',
    },
]