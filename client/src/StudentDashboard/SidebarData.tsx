
import * as AiIcons from 'react-icons/ai';
import * as IoIcons from 'react-icons/io';

export interface SidebarItem {
    title: string;
    path: string;
    icon: JSX.Element;
    cName: string;
}
export const SidebarData = [
    {
        title: 'Home',
        path: '/home',
        icon: <AiIcons.AiFillHome/>,
        cName: 'nav-text'
    },
    {
        title: 'My Group',
        path: '/MyGroup',
        icon: <IoIcons.IoMdPeople/>,
        cName: 'nav-text'
    },
    {
        title: 'User Settings',
        path: '/UserSettings',
        icon: <IoIcons.IoMdHelpCircle/>,
        cName: 'nav-text'
    }

];