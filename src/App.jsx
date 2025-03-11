import React, { useEffect, useState } from "react";
import HandshakeSimulation from "./sims/handshakeGame/HandshakeSimulation";
import Simulation2 from "./sims/simulationTwo/Simulation";

export const App = () => {
  const sims = [
    {
      name: "Handshake Simulation",
      component: HandshakeSimulation,
    },
    {
      name: "The flu",
      component: Simulation2,
    },
  ];

  const [activeSim, setActiveSim] = useState(undefined);

  const renderChooser = () => (
    <div className="simulation-chooser">
      <h1>Simulation Playground</h1>
      <p>R. Mamet and Xavier E.</p>
      <p>For this project, we were supposed to simulate a disease that is spreading. For the first challenge, we were tasked with adding a new parameter. My group added an immunity parameter. For the second challenge, we were supposed to recreate an existing disease, and we chose the flu.</p>
      <ul>
        {sims.map((sim) => (
          <li key={sim.name}>
            <button onClick={() => setActiveSim(sim)}>{sim.name}</button>
          </li>
        ))}
      </ul>
    </div>
  );

  const renderSim = () => (
    <div className="simulation-container">
      <button className="back-button" onClick={() => setActiveSim(undefined)}>
        Back
      </button>
      <activeSim.component />;
    </div>
  );

  if (activeSim) {
    return renderSim();
  } else {
    return renderChooser();
  }
};

export default App;
