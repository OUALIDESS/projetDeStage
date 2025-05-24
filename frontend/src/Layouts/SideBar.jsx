// src/components/Sidebar.jsx
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  BsColumnsGap, BsPeople, BsGrid, BsBriefcase, BsPersonCheck, BsBarChartLine,
  BsGear, BsServer, BsBoxArrowRight, BsChevronDown, BsChevronUp, BsList, BsX
} from 'react-icons/bs';

export default function Sidebar({ collapsed, onToggle }) {
  const [divOpen, setDivOpen] = useState(false);
  const [cabinetOpen, setCabinetOpen] = useState(false);
  const [serviceOpen, setServiceOpen] = useState(false);

  const IconWrapper = ({ children }) => (
    <div style={{ width: '20px', height: '20px', minWidth: '20px' }}
         className="d-flex justify-content-center align-items-center">
      {children}
    </div>
  );

  const linkClass = isActive => {
    const base = isActive ? 'text-black fw-bold' : 'text-secondary fw-normal';
    return `d-flex align-items-center ${base} rounded mb-2 nav-hover` +
      (collapsed ? ' justify-content-center py-2 px-0' : ' px-3 py-2');
  };
  const iconClass = isActive => isActive ? 'text-black' : 'text-secondary';

  const divisions = ["DAEC","DAI","DAS","DCT","DFL","DPE","DRHF","DUE"];
  const cabinetItems = [
    { name: 'Arrivée', path: 'Arrivee' },
    { name: 'Cellule de protocole', path: 'CelluleDeProtocole' },
    { name: 'SPG', path: 'SPG' },
    { name: 'Standards', path: 'Standard' },
    { name: 'Transmission', path: 'Transmission' },
  ];
  const services = [
    { name: 'Services du personnel', path: 'PS' },
    { name: 'Support général', path: 'SG' },
    { name: 'Protocole de sécurité', path: 'SP' },
  ];

  return (
    <nav
      className="d-flex flex-column"
      style={{
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        backgroundColor: '#ffffff',
        width: `${collapsed ? 60 : 240}px`,
        transition: 'width 0.3s ease',
        overflow: 'hidden',
        zIndex: 1000
      }}
    >
      <style>{`
        ::-webkit-scrollbar { display: none; }
        nav a, .menu-button {
          text-decoration: none !important;
          font-size: 0.85rem;
          transition: background-color 0.2s ease;
        }
        .text-secondary { color: grey !important; }
        .text-black { color: black !important; }
        .nav-hover:hover { background-color: #efefef !important; }
        button.btn.text-secondary:hover {
          background-color: #efefef !important;
          color: black !important;
        }
        button.btn.text-black {
          color: black !important;
          font-weight: 700 !important;
          background-color: transparent !important;
        }
      `}</style>

      {/* Toggle */}
      <div className="flex-shrink-0 p-2 position-sticky top-0"
           style={{ backgroundColor: '#ffffff', zIndex: 2 }}>
        <button className="btn p-2 bg-transparent border-0 text-dark float-end"
                onClick={onToggle}>
          <IconWrapper>
            {collapsed ? <BsList size={18} /> : <BsX size={18} />}
          </IconWrapper>
        </button>
        {!collapsed && <h6 className="text-secondary mb-0" style={{ fontSize: '0.9rem' }}>
          PROJECT
        </h6>}
      </div>

      {/* Links */}
      <div className="flex-grow-1 overflow-auto p-2" style={{ paddingBottom: '4rem' }}>
        <NavLink to="/pages/Dashboard" className={({ isActive }) => linkClass(isActive)}>
          {({ isActive }) => (
            <>
              <IconWrapper>
                <BsColumnsGap size={18} className={iconClass(isActive)} />
              </IconWrapper>
              {!collapsed && <span className="ms-2">Tableau de bord</span>}
            </>
          )}
        </NavLink>

        <NavLink to="/pages/Employees" className={({ isActive }) => linkClass(isActive)}>
          {({ isActive }) => (
            <>
              <IconWrapper><BsPeople size={18} className={iconClass(isActive)} /></IconWrapper>
              {!collapsed && <span className="ms-2">Employés</span>}
            </>
          )}
        </NavLink>

        <NavLink to="/pages/ChefDivisions" className={({ isActive }) => linkClass(isActive)}>
          {({ isActive }) => (
            <>
              <IconWrapper><BsPersonCheck size={18} className={iconClass(isActive)} /></IconWrapper>
              {!collapsed && <span className="ms-2">Chefs des divisions</span>}
            </>
          )}
        </NavLink>

        <NavLink to="/pages/GradeEmployes" className={({ isActive }) => linkClass(isActive)}>
          {({ isActive }) => (
            <>
              <IconWrapper><BsBarChartLine size={18} className={iconClass(isActive)} /></IconWrapper>
              {!collapsed && <span className="ms-2">Grade des employés</span>}
            </>
          )}
        </NavLink>

        {/* Divisions */}
        <button
          className={`btn w-100 rounded mb-2 text-start d-flex align-items-center menu-button ${
            divOpen ? 'text-black fw-bold' : 'text-secondary'
          } nav-hover`}
          onClick={() => setDivOpen(!divOpen)}
          aria-expanded={divOpen}
          style={{ backgroundColor: 'transparent' }}
        >
          <IconWrapper>
            <BsGrid size={18} className={divOpen ? 'text-black' : 'text-secondary'} />
          </IconWrapper>
          {!collapsed && <span className="ms-2 flex-grow-1">Divisions</span>}
          {!collapsed && (divOpen ? <BsChevronUp size={12} /> : <BsChevronDown size={12} />)}
        </button>
        {divOpen && !collapsed && (
          <div className="ms-4 mb-2">
            {divisions.map(d => (
              <NavLink
                key={d}
                to={`/pages/divisions/${d}`}
                className={({ isActive }) => linkClass(isActive)}
                style={{ fontSize: '0.8rem', padding: '0.25rem 1rem' }}
              >
                {d}
              </NavLink>
            ))}
          </div>
        )}

        {/* Cabinet */}
        <button
          className={`btn w-100 rounded mb-2 text-start d-flex align-items-center menu-button ${
            cabinetOpen ? 'text-black fw-bold' : 'text-secondary'
          } nav-hover`}
          onClick={() => setCabinetOpen(!cabinetOpen)}
          aria-expanded={cabinetOpen}
          style={{ backgroundColor: 'transparent' }}
        >
          <IconWrapper>
            <BsBriefcase size={18} className={cabinetOpen ? 'text-black' : 'text-secondary'} />
          </IconWrapper>
          {!collapsed && <span className="ms-2 flex-grow-1">Cabinet</span>}
          {!collapsed && (cabinetOpen ? <BsChevronUp size={12} /> : <BsChevronDown size={12} />)}
        </button>
        {cabinetOpen && !collapsed && (
          <div className="ms-4 mb-2">
            {cabinetItems.map(({ name, path }) => (
              <NavLink
                key={path}
                to={`/pages/cabinet/${path}`}
                className={({ isActive }) => linkClass(isActive)}
                style={{ fontSize: '0.8rem', padding: '0.25rem 1rem' }}
              >
                {name}
              </NavLink>
            ))}
          </div>
        )}

        {/* Services */}
        <button
          className={`btn w-100 rounded mb-2 text-start d-flex align-items-center menu-button ${
            serviceOpen ? 'text-black fw-bold' : 'text-secondary'
          } nav-hover`}
          onClick={() => setServiceOpen(!serviceOpen)}
          aria-expanded={serviceOpen}
          style={{ backgroundColor: 'transparent' }}
        >
          <IconWrapper>
            <BsServer size={18} className={serviceOpen ? 'text-black' : 'text-secondary'} />
          </IconWrapper>
          {!collapsed && <span className="ms-2 flex-grow-1">Services</span>}
          {!collapsed && (serviceOpen ? <BsChevronUp size={12} /> : <BsChevronDown size={12} />)}
        </button>
        {serviceOpen && !collapsed && (
          <div className="ms-4 mb-2">
            {services.map(({ name, path }) => (
              <NavLink
                key={path}
                to={`/pages/Service/${path}`}
                className={({ isActive }) => linkClass(isActive)}
                style={{ fontSize: '0.8rem', padding: '0.25rem 1rem' }}
              >
                {name}
              </NavLink>
            ))}
          </div>
        )}
      </div>

      {/* Bottom */}
      <div className="flex-shrink-0 px-3 py-2">
        <NavLink to="/pages/Settings" className={({ isActive }) => linkClass(isActive)}>
          {({ isActive }) => (
            <>
              <IconWrapper><BsGear size={18} className={iconClass(isActive)} /></IconWrapper>
              {!collapsed && <span className="ms-2">Paramètres</span>}
            </>
          )}
        </NavLink>
        <NavLink to="/pages/Logout" className={({ isActive }) => linkClass(isActive)}>
          {({ isActive }) => (
            <>
              <IconWrapper><BsBoxArrowRight size={18} className={iconClass(isActive)} /></IconWrapper>
              {!collapsed && <span className="ms-2">Se déconnecter</span>}
            </>
          )}
        </NavLink>
      </div>
    </nav>
);
}
