import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ArrowRightLeft, Activity, ListOrdered } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="logo-container">
                    <Activity className="logo-icon" size={28} />
                    <h1 className="logo-text">Sleeper<span className="accent">Command</span></h1>
                </div>
            </div>

            <nav className="sidebar-nav">
                <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <LayoutDashboard size={20} />
                    <span>War Room</span>
                </NavLink>

                <NavLink to="/trade" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <ArrowRightLeft size={20} />
                    <span>Trade Calculator</span>
                </NavLink>

                <NavLink to="/market" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <Activity size={20} />
                    <span>Market Explorer</span>
                </NavLink>

                <NavLink to="/power-rankings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <ListOrdered size={20} />
                    <span>Power Rankings</span>
                </NavLink>
            </nav>

            <div className="sidebar-footer">
                <div className="league-status">
                    <div className="status-indicator online"></div>
                    <span>Sleeper API Active</span>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
