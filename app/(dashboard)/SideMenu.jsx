import { Menu } from "antd";
import React from "react";
import { useRouter } from "next/navigation";

function SideMenu() {
  const router = useRouter();

  const menuItems = [
    { label: "Directory", path: "/directory" },
    { label: "Parish Information", path: "/parish-information" },
    { label: "Church Committees", path: "/church-committees" },
    { label: "Church Positions", path: "/positions" },
    { label: "Prayer Units", path: "/prayer-units" },
    { label: "Sponsors", path: "/sponsors" },
  ].map((item, key) => {
    return {
      key: String(key + 1),
      label: item.label,
      onClick: () => router.push(item.path),
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
