import { createContext, useContext, useState } from "react";

const NotificationContext = createContext();
export const useNotification = () => useContext(NotificationContext);

export function NotificationProvider({ children }) {
  const [notif, setNotif] = useState({ show: false, product: null });

  const showNotification = (product) => {
    setNotif({ show: true, product });
    setTimeout(() => setNotif({ show: false, product: null }), 2000);
  };

  return (
    <NotificationContext.Provider value={{ notif, showNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}