import React, { useEffect, useState } from "react";
import {
  createPopulation,
  updatePopulation,
  computeStatistics,
  trackedStats,
  defaultSimulationParameters,
} from "./diseaseModel";
import { renderChart } from "../../lib/renderChart";
import { renderTable } from "../../lib/renderTable";

let boxSize = 500; // World box size in pixels
let maxSize = 1000; // Max number of icons we render (we can simulate big populations, but don't render them all...)

/**
 * Renders a subset of the population as a list of patients with emojis indicating their infection status.
 */
const renderPatients = (population) => {
  let amRenderingSubset = population.length > maxSize;
  const popSize = population.length;
  if (popSize > maxSize) {
    population = population.slice(0, maxSize);
  }

  function renderEmoji(p) {
    if (p.dead) {
      return "💀"; // Skull for dead
    } else if (p.immune) {
      return "😷"; // Face with Medical Mask for immune
    } else if (p.newlyInfected) {
      return "🤧"; // Sneezing Face for new cases
    } else if (p.infected) {
      return "🤢"; // Vomiting Face for already sick
    } else {
      return "😀"; // Healthy person
    }
  }

  function renderSubsetWarning() {
    if (amRenderingSubset) {
      return (
        <div className="subset-warning">
          Only showing {maxSize} ({((maxSize * 100) / popSize).toFixed(2)}%) of{" "}
          {popSize} patients...
        </div>
      );
    }
  }

  return (
    <>
      {renderSubsetWarning()}
      {population.map((p) => (
        <div
          key={p.id}
          data-patient-id={p.id}
          data-patient-x={p.x}
          data-patient-y={p.y}
          className="patient"
          style={{
            transform: `translate(${(p.x / 100) * boxSize}px, ${
              (p.y / 100) * boxSize
            }px)`,
          }}
        >
          {renderEmoji(p)}
        </div>
      ))}
    </>
  );
};

const Simulation = () => {
  const [popSize, setPopSize] = useState(20);
  const [population, setPopulation] = useState(
    createPopulation(popSize * popSize)
  );
  const [diseaseData, setDiseaseData] = useState([]);
  const [lineToGraph, setLineToGraph] = useState("infected");
  const [autoMode, setAutoMode] = useState(false);
  const [simulationParameters, setSimulationParameters] = useState(
    defaultSimulationParameters
  );

  // Runs a single simulation step
  const runTurn = () => {
    let newPopulation = updatePopulation([...population], simulationParameters);
    setPopulation(newPopulation);
    let newStats = computeStatistics(newPopulation, diseaseData.length);
    setDiseaseData([...diseaseData, newStats]);
  };

  // Resets the simulation
  const resetSimulation = () => {
    setPopulation(createPopulation(popSize * popSize));
    setDiseaseData([]);
  };

  // Auto-run simulation effect
  useEffect(() => {
    if (autoMode) {
      setTimeout(runTurn, 50);
    }
  }, [autoMode, population]);

  return (
    <div>
      <section className="top">
        <h1>The Flu simulation</h1>
        <p>
          Simulates the spread of the flu through a population, tracking
          infection rates, duration of sickness, and immunity. Coded by R. Mamet
          and Xavier.
        </p>

        <p>
          Population: {population.length}. Infected:{" "}
          {population.filter((p) => p.infected).length}. Dead:{" "}
          {population.filter((p) => p.dead).length}. Immune:{" "}
          {population.filter((p) => p.immune).length}.
        </p>

        <button onClick={runTurn}>Next Turn</button>
        <button onClick={() => setAutoMode(true)}>AutoRun</button>
        <button onClick={() => setAutoMode(false)}>Stop</button>
        <button onClick={resetSimulation}>Reset Simulation</button>

        <div>
          {/* Add custom parameters here... */}
          <label>
            Population:
            <div className="vertical-stack">
              {/* Population uses a "square" size to allow a UI that makes it easy to slide
          from a small population to a large one. */}
              <input
                type="range"
                min="3"
                max="1000"
                value={popSize}
                onChange={(e) => setPopSize(parseInt(e.target.value))}
              />
              <input
                type="number"
                value={Math.round(popSize * popSize)}
                step="10"
                onChange={(e) =>
                  setPopSize(Math.sqrt(parseInt(e.target.value)))
                }
              />
            </div>
          </label>
          <label>
            Death Rate
            <div className="vertical-stack">
              <input
                type="range"
                min="0"
                max="100"
                value={simulationParameters.deathPercentage}
                onChange={(e) =>
                  setSimulationParameters({
                    ...simulationParameters,
                    deathPercentage: parseFloat(e.target.value),
                  })
                }
              />
              <input
                type="number"
                value={simulationParameters.deathPercentage}
                step="0.1"
                onChange={(e) =>
                  setSimulationParameters({
                    ...simulationParameters,
                    deathPercentage: parseFloat(e.target.value),
                  })
                }
              />
            </div>
          </label>
        </div>
      </section>

      <section className="side-by-side">
        {renderChart(diseaseData, lineToGraph, setLineToGraph, trackedStats)}

        <div className="world">
          <div
            className="population-box"
            style={{ width: boxSize, height: boxSize }}
          >
            {renderPatients(population)}
          </div>
        </div>

        {renderTable(diseaseData, trackedStats)}
      </section>
    </div>
  );
};

export default Simulation;
