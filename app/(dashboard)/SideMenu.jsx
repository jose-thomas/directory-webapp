import { Menu } from "antd";
import React from "react";

function SideMenu() {
  const menuItems = [
    "Directory",
    "Parish Information",
    "Church Committees",
    "Prayer Units",
    "Sponsors",
  ].map((label, key) => {
    return {
      key: String(key + 1),
      label: label,
    };
  });
  return (
    <Menu
      items={menuItems}
      mode="inline"
      style={{
        textAlign: "left",
        overflowY: "auto",
        maxHeight: "65vh",
        paddingRight: "1vw",
      }}
      className="scroll-container"
    />
  );
}

export default SideMenu;
