import {useState} from 'react';
import * as FaIcons from 'react-icons/fa';
import * as AiIcons from 'react-icons/ai';
import {Link} from 'react-router-dom';
import {SidebarData} from './SidebarData.tsx';
import {SidebarItem} from './SidebarData.tsx';
import {IconContext} from 'react-icons';


function Sidebar(){
    const [sidebar, setSidebar] = useState(false);

    const showSidebar = () => setSidebar(!sidebar);
    return(
        <>
            <IconContext.Provider value={{color: '#fff'}}>
                <div className='navbar'>
                    <Link to='#' className='menu-bars'>
                        <FaIcons.FaBars onClick={showSidebar} />
                    </Link>
                    <h1>Instructor Dashboard</h1>
                </div>
                <nav className={sidebar ? 'nav-menu active' : 'nav-menu'}>
                    <ul className='nav-menu-items'>
                        <li className='navbar-toggle'>
                            <Link to={'#'} className={'menu-bars'}>
                                <AiIcons.AiOutlineClose onClick={showSidebar} />
                            </Link>
                        </li>
                        {SidebarData.map((item : SidebarItem, index : number) => {
                            return (
                                <li key={index} className={item.cName}>
                                    <Link to={item.path}>
                                        {item.icon}
                                        <span>{item.title}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </IconContext.Provider>
        </>
    )
}

export default Sidebar