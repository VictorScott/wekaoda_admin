import clsx from "clsx";
import { Outlet } from "react-router";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export default function MainLayout() {
  return (
    <>
      <Header />
      <main
        className={clsx("main-content transition-content grid grid-cols-1")}
      >
        <Outlet />
      </main>
      <Sidebar />
    </>
  );
}
