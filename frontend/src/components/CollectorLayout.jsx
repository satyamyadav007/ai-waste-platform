import { Outlet } from "react-router-dom";
import CollectorSidebar from "./CollectorSidebar";

function CollectorLayout() {
  return (
    <div className="collector-layout">

      <CollectorSidebar />

      <main className="collector-main">
        <Outlet />
      </main>

    </div>
  );
}

export default CollectorLayout;