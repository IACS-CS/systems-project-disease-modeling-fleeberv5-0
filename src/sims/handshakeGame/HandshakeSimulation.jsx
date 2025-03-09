import React, { useEffect, useState } from "react";
import {
  computeStatistics,
  createPopulation,
  trackedStats,
  updatePopulation,
  defaultSimulationParameters,
} from "./diseaseModel";
import { renderChart } from "../../lib/renderChart";
import { renderTable } from "../../lib/renderTable";

let boxSize = 500; // size of the "world box" in pixels
let maxSize = 1000; // don't make this too big, or the UI will be slow!

// Nudging function to prevent overcrowding on the y-axis
const nudgePeople = (population) => {
  for (let person of population) {
    for (let other of population) {
      if (person === other || person.partner === other) {
        continue; // Skip self and partner
      }

      if (
        Math.abs(person.y - other.y) < 1 &&
        Math.abs(person.x - other.x) < 3
      ) {
        // If too close vertically, move randomly up or down
        person.y += Math.random() > 0.5 ? 2 : -2;

        // Ensure y stays within bounds (0 - 100)
        person.y = Math.max(0, Math.min(100, person.y));
        if (person.partner) person.partner.y = person.y;
      }
    }
  }
};

/**
 * Renders a subset of the population as a list of patients with emojis indicating their infection status.
 * If the population size exceeds the maximum size, only a subset is rendered with a warning message.
 *
 * @param {Array} population - The array of patient objects to render. Each patient object should have the following properties:
 *   @param {number} population[].id - The unique identifier for the patient.
 *   @param {boolean} population[].infected - The infection status of the patient.
 *   @param {number} population[].x - The x-coordinate of the patient's position.
 *   @param {number} population[].y - The y-coordinate of the patient's position.
 * @returns {JSX.Element} The rendered list of patients with their respective emojis and a subset warning if applicable.
 */
const renderPatients = (population) => {
  let amRenderingSubset = population.length > maxSize;
  const popSize = population.length;
  if (popSize > maxSize) {
    population = population.slice(0, maxSize);
  }
  nudgePeople(population);
  function renderEmoji(p) {
    if (p.newlyInfected) {
      return "🤧";
    } else if (p.infected) {
      return "🤢";
    } else {
      return "😀";
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
            transform: `translate(${(p.x / 100) * boxSize}px,${
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

const SimpleSimulation = () => {
  // State for population
  const [popSize, setPopSize] = useState(20);
  const [population, setPopulation] = useState(
    createPopulation(popSize * popSize)
  );

  // State for graph data
  const [lineToGraph, setLineToGraph] = useState("infected");
  const [diseaseData, setDiseaseData] = useState([]);
  const [autoMode, setAutoMode] = useState(false);

  // Simulation parameters
  const [simulationParameters, setSimulationParameters] = useState(
    defaultSimulationParameters
  );

  // Runs a single simulation step
  const runTurn = () => {
    let newPopulation = updatePopulation(
      population.slice(),
      simulationParameters
    );
    setPopulation(newPopulation);
    let newStats = computeStatistics(newPopulation, diseaseData.length);
    setDiseaseData([...diseaseData, newStats]);
  };

  // Handles input change for population size
  const onPopInput = (e) => {
    setPopSize(parseInt(e.target.value));
  };

  // Resets the simulation
  const resetPopulation = () => {
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
        <h1>My Systems Model</h1>
        <p>
          This is a model of the "handshake" game: each turn, two people at
          random find each other and shake hands. If one of them is infected,
          the other gets infected too.
        </p>
        <p>This model was created by Mr. Hinkle. Modified by R. Mamet</p>
        <p>
          Population: {population.length}. Infected:{" "}
          {population.filter((p) => p.infected).length}
        </p>
        <button onClick={runTurn}>Next Turn</button>
        <button onClick={() => setAutoMode(true)}>AutoRun</button>
        <button onClick={() => setAutoMode(false)}>Stop</button>
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
              onChange={onPopInput}
            />
            <input
              type="number"
              value={Math.round(popSize * popSize)}
              step="10"
              onChange={(e) => setPopSize(Math.sqrt(parseInt(e.target.value)))}
            />
          </div>
          <button onClick={resetPopulation}>Reset Population</button>
        </label>

        <label>
          <div>
            <label>Infection Chance:</label>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={simulationParameters.infectionChance}
              onChange={(e) =>
                setSimulationParameters({
                  ...simulationParameters,
                  infectionChance: parseFloat(e.target.value),
                })
              }
            />
            <input
              type="number"
              min="0"
              max="100"
              value={simulationParameters.infectionChance}
              onChange={(e) =>
                setSimulationParameters({
                  ...simulationParameters,
                  infectionChance: parseFloat(e.target.value),
                })
              }
            />
          </div>
        </label>
      </section>
      <section className="side-by-side">
        {/* Line chart of data */}
        {renderChart(diseaseData, lineToGraph, setLineToGraph, trackedStats)}
        {/* Display of "patients" */}
        <div className="world">
          <div
            className="population-box"
            style={{ width: boxSize, height: boxSize }}
          >
            {renderPatients(population)}
          </div>
        </div>
        {/* Data table */}
        {renderTable(diseaseData, trackedStats)}
      </section>
    </div>
  );
};

export default SimpleSimulation;
