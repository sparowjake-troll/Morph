import React from "react";
import {createRoot} from "react-dom/client";
import {Portfolio} from "./Portfolio";
import "./styles.css";
createRoot(document.getElementById("root")!).render(<React.StrictMode><Portfolio/></React.StrictMode>);