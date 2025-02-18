import React, { useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Cookies from "js-cookie";

const MenuItem = React.memo(function MenuItem({ item, openMenus, handleMenuClick, pathname, removeDiacritics }) {
    const itemPath = useMemo(() => {
        return item.name
            ? removeDiacritics(item.name.toLowerCase().replace(/ /g, "-"))
            : "";
    }, [item.name, removeDiacritics]);

    const isActive = useMemo(() => {
        return pathname.includes(itemPath);
    }, [pathname, itemPath]);

    const hasActiveChild = useMemo(() => {
        if (!item.children) return false;
        return item.children.some(child => {
            const childPath = child.name
                ? removeDiacritics(child.name.toLowerCase().replace(/ /g, "-"))
                : "";
            return pathname.includes(childPath);
        });
    }, [item.children, pathname, removeDiacritics]);

    if (item.children) {
        return (
            <React.Fragment key={item.name}>
                <li
                    key={`${item.name}-parent`}
                    className={`menu-item ${isActive ? "active" : ""} ${hasActiveChild ? "parent-active" : ""}`}
                    onClick={() => handleMenuClick(item.name)}
                >
                    <a className="menu-item">
                        {item.icon && <i className={item.icon}></i>}
                        <p className="menu-name">{item.name}</p>
                    </a>
                </li>
                <ul className={`submenu ${openMenus[item.name] ? 'open' : ''}`}>
                    {item.children.map(child => (
                        <MenuItem
                            key={child.name}
                            item={child}
                            openMenus={openMenus}
                            handleMenuClick={handleMenuClick}
                            pathname={pathname}
                            removeDiacritics={removeDiacritics}
                        />
                    ))}
                </ul>
            </React.Fragment>
        );
    }

    return (
        <li key={item.name} className={`menu-item ${isActive ? "active" : ""}`}>
            <Link to={`/${itemPath}`}>
                {item.icon && <i className={item.icon}></i>}
                <p className="menu-name">{item.name}</p>
            </Link>
        </li>
    );
});

MenuItem.propTypes = {
    item: PropTypes.object.isRequired,
    openMenus: PropTypes.object.isRequired,
    handleMenuClick: PropTypes.func.isRequired,
    pathname: PropTypes.string.isRequired, // Changed from location to pathname
    removeDiacritics: PropTypes.func.isRequired,
};

const AdminSidebarComponent = ({
    currentPath,
    openMenus,
    handleMenuClick,
    menuData,
}) => {
    const { t } = useTranslation();
    const role = Cookies.get("role");
    const location = useLocation();
    const pathname = useMemo(() => location.pathname, [location.pathname]); // Memoize pathname

    const removeDiacritics = useCallback((str) => {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }, []);

    const memoizedMenuItems = useMemo(() => {
        return menuData.map(item => (
            <MenuItem
                key={item.name}
                item={item}
                openMenus={openMenus}
                handleMenuClick={handleMenuClick}
                pathname={pathname} // Pass pathname instead of location
                removeDiacritics={removeDiacritics}
            />
        ));
    }, [menuData, openMenus, handleMenuClick, pathname, removeDiacritics]);

    return (
        <div className="sidebar">
            <h1 className="main-logo">Admin</h1>
            <nav className="primary-navigation">
                <ul>
                    <li
                        className={`menu-item ${currentPath === "/admin/dashboard" ? "active" : ""
                            }`}
                    >
                        <Link to="/admin/dashboard">
                            <i className="fa-solid fa-house"></i>
                            <p className="menu-name">{t("menu.dashboard")}</p>
                        </Link>
                    </li>
                </ul>
            </nav>
            <nav className="secondary-navigation">
                <ul>{role === "admin" && memoizedMenuItems}</ul>
            </nav>
        </div>
    );
};

AdminSidebarComponent.propTypes = {
    currentPath: PropTypes.string.isRequired,
    openMenus: PropTypes.object.isRequired,
    handleMenuClick: PropTypes.func.isRequired,
    menuData: PropTypes.array,
};

const AdminSidebar = React.memo(AdminSidebarComponent);
export default AdminSidebar;