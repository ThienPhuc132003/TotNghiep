import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import Api from "../network/Api";
import { METHOD_TYPE } from "../network/methodType";
import "../assets/css/NotifiButton.style.css";

const NotifiButtonComponent = () => {
  const userInfo = useSelector((state) => state.user.userProfile);
  const [notifications, setNotifications] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const observer = useRef();
  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        const response = await Api({
          endpoint: `loan-service/notification/me?seen=all`,
          method: METHOD_TYPE.GET,
        });
        if (Array.isArray(response.data)) {
          setNotifications((prevNotifications) => [
            ...prevNotifications,
            ...response.data,
          ]);
        } else if (response.data === null) {
          console.error("Expected response.data to be an array, but got null");
        } else {
          console.error("Expected response.data to be an array, but got:", response.data);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchNotifications(page);
  }, [page]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map((notification) => ({
      ...notification,
      seen: true,
    }));
    setNotifications(updatedNotifications);
  };

  const toggleReadStatus = (notificationId) => {
    const updatedNotifications = notifications.map((notification) =>
      notification.notificationId === notificationId
        ? { ...notification, seen: !notification.seen }
        : notification
    );
    setNotifications(updatedNotifications);
  };

  const filteredNotifications = (notifications || []).filter((notification) => {
    if (filter === "all") return true;
    if (filter === "unread") return !notification.seen;
    if (filter === "read") return notification.seen;
  });

  const lastNotificationElementRef = useCallback(
    (node) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoading]
  );

  return (
    <div className="notifi-button-container">
      <button className="notifi-button" onClick={toggleDropdown}>
        <i className="fa-regular fa-bell fa-2xl"></i>
      </button>
      {isDropdownOpen && (
        <div className={`notifi-dropdown-menu ${isDropdownOpen ? "open" : ""}`}>
          <div className="notifi-dropdown-header">
            <h3>Thông báo</h3>
            <div className="notifi-mark-buttons">
              <button className="notifi-mark-read" onClick={markAllAsRead}>
                Đánh dấu đã đọc tất cả
              </button>
            </div>
          </div>
          <div className="notifi-filter-buttons">
            <button
              className={`notifi-filter-button ${
                filter === "all" ? "active" : ""
              }`}
              onClick={() => setFilter("all")}
            >
              Tất cả
            </button>
            <button
              className={`notifi-filter-button ${
                filter === "unread" ? "active" : ""
              }`}
              onClick={() => setFilter("unread")}
            >
              Chưa đọc
            </button>
            <button
              className={`notifi-filter-button ${
                filter === "read" ? "active" : ""
              }`}
              onClick={() => setFilter("read")}
            >
              Đã đọc
            </button>
          </div>
          <div className="notifi-dropdown-content">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification, index) => {
                if (filteredNotifications.length === index + 1) {
                  return (
                    <div
                      ref={lastNotificationElementRef}
                      key={notification.notificationId}
                      className={`notifi-dropdown-item ${
                        notification.seen ? "read" : "unread"
                      }`}
                      onClick={() =>
                        toggleReadStatus(notification.notificationId)
                      }
                    >
                      <div className="notifi-notification-icon">
                        <img src={userInfo.avatar} alt="icon" />
                      </div>
                      <div className="notifi-notification-content">
                        <p className="notifi-notification-title">
                          {notification.titleName}
                        </p>
                        <p className="notifi-notification-details">
                          {notification.content}
                        </p>
                        <p className="notifi-notification-time">
                          {new Date(notification.createAt).toLocaleString()}
                        </p>
                      </div>
                      {!notification.seen && (
                        <span className="notifi-unread-indicator"></span>
                      )}
                    </div>
                  );
                } else {
                  return (
                    <div
                      key={notification.notificationId}
                      className={`notifi-dropdown-item ${
                        notification.seen ? "read" : "unread"
                      }`}
                      onClick={() =>
                        toggleReadStatus(notification.notificationId)
                      }
                    >
                      <div className="notifi-notification-icon">
                        <img src={userInfo.avatar} alt="icon" />
                      </div>
                      <div className="notifi-notification-content">
                        <p className="notifi-notification-title">
                          {notification.titleName}
                        </p>
                        <p className="notifi-notification-details">
                          {notification.content}
                        </p>
                        <p className="notifi-notification-time">
                          {new Date(notification.createAt).toLocaleString()}
                        </p>
                      </div>
                      {!notification.seen && (
                        <span className="notifi-unread-indicator"></span>
                      )}
                    </div>
                  );
                }
              })
            ) : (
              <div className="notifi-dropdown-item">No notifications</div>
            )}
            {isLoading && <div className="loading">Loading...</div>}
          </div>
        </div>
      )}
    </div>
  );
};

const NotifiButton = React.memo(NotifiButtonComponent);
export default NotifiButton;